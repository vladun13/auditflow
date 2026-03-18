import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { Account } from './Account'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u-1', email: 'user@example.com' } }),
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
  it('renders Account heading', () => {
    renderAccount()
    expect(screen.getByText('Account')).toBeInTheDocument()
  })

  it('pre-fills email from auth user (disabled)', async () => {
    renderAccount()
    await waitFor(() => {
      const emailInput = screen.getByDisplayValue('user@example.com')
      expect(emailInput).toBeDisabled()
    })
  })

  it('loads and displays full name from profile', async () => {
    renderAccount()
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })
  })

  it('calls updateProfile on form submit', async () => {
    mockUpdateProfile.mockResolvedValueOnce({ error: null })

    renderAccount()
    await waitFor(() => expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument())

    const nameInput = screen.getByDisplayValue('John Doe')
    // Use fireEvent.change for reliable React state update in happy-dom
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })

    const form = nameInput.closest('form')!
    fireEvent.submit(form)

    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith({ full_name: 'Jane Smith' })
    )
  })

  it('shows success toast after save', async () => {
    mockUpdateProfile.mockResolvedValueOnce({ error: null })

    renderAccount()
    await waitFor(() => expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument())

    const nameInput = screen.getByDisplayValue('John Doe')
    fireEvent.change(nameInput, { target: { value: 'John Doe Updated' } })
    fireEvent.submit(nameInput.closest('form')!)

    await waitFor(() =>
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Profile updated')
    )
  })

  it('renders danger zone section', () => {
    renderAccount()
    expect(screen.getByText(/danger zone/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete account/i })).toBeDisabled()
  })
})
