import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Login } from './Login'

const mockSignIn = vi.fn()
const mockSignInWithGoogle = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
  }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Login - AUTH-01 sessionStorage URL preservation', () => {
  it('renders login form with email and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('redirects to /scan with URL when sessionStorage has auditflow_pending_url', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({ error: null })
    sessionStorage.setItem('auditflow_pending_url', 'https://test.com')

    renderLogin()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/scan?url=https%3A%2F%2Ftest.com')
    })
  })

  it('redirects to /dashboard when no pending URL in sessionStorage', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({ error: null })

    renderLogin()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('clears sessionStorage after reading auditflow_pending_url via removeItem', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({ error: null })
    sessionStorage.setItem('auditflow_pending_url', 'https://test.com')

    renderLogin()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })

    // After login, the pending URL should have been removed from sessionStorage
    expect(sessionStorage.getItem('auditflow_pending_url')).toBeNull()
  })

  it('shows error message when sign in fails', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } })

    renderLogin()
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
