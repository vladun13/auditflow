import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { Security } from './Security'

const mockUpdatePassword = vi.fn()
vi.mock('@/lib/api', () => ({
  userApi: { updatePassword: (...args: unknown[]) => mockUpdatePassword(...args) },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

function renderSecurity() {
  return render(
    <MemoryRouter>
      <Security />
    </MemoryRouter>,
  )
}

describe('Security', () => {
  it('renders Security heading', () => {
    renderSecurity()
    expect(screen.getByText('Security')).toBeInTheDocument()
  })

  it('renders password fields', () => {
    renderSecurity()
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
    // Use exact label text to avoid matching "Confirm new password"
    expect(screen.getByLabelText('New password')).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderSecurity()

    await user.type(screen.getByLabelText(/current password/i), 'oldpass123')
    await user.type(screen.getByLabelText('New password'), 'newpass123')
    await user.type(screen.getByLabelText(/confirm new password/i), 'different123')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() =>
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('New passwords do not match')
    )
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    const user = userEvent.setup()
    renderSecurity()

    await user.type(screen.getByLabelText(/current password/i), 'old')
    await user.type(screen.getByLabelText(/^new password/i), 'short')
    await user.type(screen.getByLabelText(/confirm new password/i), 'short')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() =>
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Password must be at least 8 characters')
    )
  })

  it('calls updatePassword on valid submission', async () => {
    const user = userEvent.setup()
    mockUpdatePassword.mockResolvedValueOnce({ error: null })
    renderSecurity()

    await user.type(screen.getByLabelText(/current password/i), 'currentpass')
    await user.type(screen.getByLabelText('New password'), 'newpassword1')
    await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword1')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() =>
      expect(mockUpdatePassword).toHaveBeenCalledWith('currentpass', 'newpassword1')
    )
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Password updated')
  })

  it('shows API error on failure', async () => {
    const user = userEvent.setup()
    mockUpdatePassword.mockResolvedValueOnce({ error: 'Invalid current password' })
    renderSecurity()

    await user.type(screen.getByLabelText(/current password/i), 'wrongpass')
    await user.type(screen.getByLabelText('New password'), 'newpassword1')
    await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword1')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() =>
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Invalid current password')
    )
  })

  it('renders 2FA section', () => {
    renderSecurity()
    expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enable 2fa/i })).toBeDisabled()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderSecurity()

    const currentPasswordInput = screen.getByLabelText(/current password/i)
    expect(currentPasswordInput).toHaveAttribute('type', 'password')

    // The toggle buttons have no accessible name — find all and click the first
    const allButtons = screen.getAllByRole('button')
    // First 3 non-submit buttons are eye-toggle buttons (one per password field)
    // They appear before the submit button
    const eyeButtons = allButtons.filter(b =>
      b.getAttribute('type') === 'button' && !b.textContent?.trim()
    )
    await user.click(eyeButtons[0])
    expect(currentPasswordInput).toHaveAttribute('type', 'text')
  })
})
