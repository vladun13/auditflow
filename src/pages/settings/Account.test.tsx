import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { Account } from './Account'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u-1', email: 'user@example.com' }, signOut: vi.fn() }),
}))

const mockGetProfile = vi.fn()
const mockUpdateProfile = vi.fn()
vi.mock('@/lib/api', () => ({
  userApi: {
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockGetProfile.mockResolvedValue({ data: { full_name: 'John Doe' } })
})

function renderAccount() {
  return render(
    <MemoryRouter>
      <Account />
    </MemoryRouter>,
  )
}

describe('Account', () => {
  it('renders Personal Details heading', () => {
    renderAccount()
    expect(screen.getByText('Personal Details')).toBeInTheDocument()
  })

  it('pre-fills email from auth user (read-only)', async () => {
    renderAccount()
    await waitFor(() => {
      const emailInput = screen.getByDisplayValue('user@example.com')
      expect(emailInput).toHaveAttribute('readonly')
    })
  })

  it('loads and displays full name from profile', async () => {
    renderAccount()
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })
  })

  it('calls updateProfile when Save is clicked for name', async () => {
    mockUpdateProfile.mockResolvedValueOnce({ error: null })

    renderAccount()
    await waitFor(() => expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument())

    const nameInput = screen.getByDisplayValue('John Doe')
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })

    // First Save button belongs to Full Name field
    const saveButtons = screen.getAllByRole('button', { name: /^save$/i })
    fireEvent.click(saveButtons[0])

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith({ full_name: 'Jane Smith' })
    )
  })

  it('shows error toast when profile save fails', async () => {
    mockUpdateProfile.mockResolvedValueOnce({ error: 'Network error' })

    renderAccount()
    await waitFor(() => expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument())

    const nameInput = screen.getByDisplayValue('John Doe')
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })

    const saveButtons = screen.getAllByRole('button', { name: /^save$/i })
    fireEvent.click(saveButtons[0])

    await waitFor(() =>
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Network error')
    )
  })

  it('renders Manage Account section with danger actions', () => {
    renderAccount()
    expect(screen.getByText('Manage Account')).toBeInTheDocument()
    expect(screen.getByText('Deactivate Account')).toBeInTheDocument()
    expect(screen.getByText('Delete Account')).toBeInTheDocument()
  })
})
