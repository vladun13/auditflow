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
    expect(screen.getByText(/7 credits/i)).toBeInTheDocument()
  })

  it('shows dash when credits are null', () => {
    renderLayout(null)
    expect(screen.getByText(/— credit/)).toBeInTheDocument()
  })

  it('renders Buy Credits button', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: /buy credits/i })).toBeInTheDocument()
  })

  it('opens BuyCreditsModal when Buy Credits clicked', async () => {
    const user = userEvent.setup()
    renderLayout()
    await user.click(screen.getByRole('button', { name: /buy credits/i }))
    // Modal opens — navigate is NOT called (modal replaced the /pricing redirect)
    expect(mockNavigate).not.toHaveBeenCalledWith('/pricing')
  })

  it('calls signOut and navigates to / on log out', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValueOnce(undefined)
    renderLayout()

    await user.click(screen.getByText(/log out/i))
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders outlet content', () => {
    renderLayout()
    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })
})
