import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './DashboardLayout'

const mockSignOut = vi.fn()
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ signOut: mockSignOut }),
}))

const mockUseCredits = vi.fn()
vi.mock('@/hooks/useCredits', () => ({
  useCredits: () => mockUseCredits(),
}))

// Sidebar uses useLocation — stub it out
vi.mock('@/components/sidebar', () => ({
  Sidebar: () => <nav data-testid="sidebar">Sidebar</nav>,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => vi.clearAllMocks())

function renderLayout(credits: number | null = 5) {
  mockUseCredits.mockReturnValue({ credits, loading: false })
  return render(
    <MemoryRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<div>Page Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('DashboardLayout', () => {
  it('renders sidebar', () => {
    renderLayout()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('renders credit balance in header', () => {
    renderLayout(7)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Credits:')).toBeInTheDocument()
  })

  it('shows — when credits are null', () => {
    renderLayout(null)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders Buy Credits button', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: /buy credits/i })).toBeInTheDocument()
  })

  it('navigates to /pricing when Buy Credits clicked', async () => {
    const user = userEvent.setup()
    renderLayout()
    await user.click(screen.getByRole('button', { name: /buy credits/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/pricing')
  })

  it('calls signOut and navigates to / on logout', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValueOnce(undefined)
    renderLayout()

    await user.click(screen.getByRole('button', { name: /logout/i }))
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders outlet content', () => {
    renderLayout()
    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })
})
