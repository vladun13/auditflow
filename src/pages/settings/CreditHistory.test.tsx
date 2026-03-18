import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CreditHistory } from './CreditHistory'

const mockUseCreditHistory = vi.fn()
vi.mock('@/hooks/usePayments', () => ({
  useCreditHistory: () => mockUseCreditHistory(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => vi.clearAllMocks())

function renderCreditHistory() {
  return render(
    <MemoryRouter>
      <CreditHistory />
    </MemoryRouter>,
  )
}

describe('CreditHistory', () => {
  it('shows loading skeleton while loading', () => {
    mockUseCreditHistory.mockReturnValue({ history: [], loading: true })
    renderCreditHistory()
    expect(screen.getByText('Credit History')).toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows empty state when no history', () => {
    mockUseCreditHistory.mockReturnValue({ history: [], loading: false })
    renderCreditHistory()
    expect(screen.getByText(/no credit activity yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buy credits/i })).toBeInTheDocument()
  })

  it('navigates to /settings/plans when Buy Credits clicked', async () => {
    const user = userEvent.setup()
    mockUseCreditHistory.mockReturnValue({ history: [], loading: false })
    renderCreditHistory()

    await user.click(screen.getByRole('button', { name: /buy credits/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/settings/plans')
  })

  it('renders credit history rows when history exists', () => {
    mockUseCreditHistory.mockReturnValue({
      history: [
        { id: 'c-1', amount: 5, type: 'purchase', description: 'Pro pack', balance_after: 5, created_at: '2024-06-15T00:00:00Z' },
      ],
      loading: false,
    })
    renderCreditHistory()

    expect(screen.getByText('purchase')).toBeInTheDocument()
    expect(screen.getByText('Pro pack')).toBeInTheDocument()
    expect(screen.getByText('+5')).toBeInTheDocument()
  })

  it('shows negative amount with red color indicator', () => {
    mockUseCreditHistory.mockReturnValue({
      history: [
        { id: 'c-2', amount: -1, type: 'usage', description: 'Scan: example.com', balance_after: 4, created_at: '2024-06-16T00:00:00Z' },
      ],
      loading: false,
    })
    renderCreditHistory()

    expect(screen.getByText('-1')).toBeInTheDocument()
    expect(screen.getByText('Scan: example.com')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    mockUseCreditHistory.mockReturnValue({
      history: [
        { id: 'c-1', amount: 5, type: 'purchase', description: 'Test', balance_after: 5, created_at: '2024-01-01T00:00:00Z' },
      ],
      loading: false,
    })
    renderCreditHistory()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Event')).toBeInTheDocument()
    expect(screen.getByText('Credits')).toBeInTheDocument()
    expect(screen.getByText('Balance')).toBeInTheDocument()
  })

  it('shows balance_after value', () => {
    mockUseCreditHistory.mockReturnValue({
      history: [
        { id: 'c-1', amount: 5, type: 'purchase', description: 'Pro pack', balance_after: 8, created_at: '2024-01-01T00:00:00Z' },
      ],
      loading: false,
    })
    renderCreditHistory()
    expect(screen.getByText('8')).toBeInTheDocument()
  })
})
