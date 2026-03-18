import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PaymentHistory } from './PaymentHistory'

const mockUsePayments = vi.fn()
vi.mock('@/hooks/usePayments', () => ({
  usePayments: () => mockUsePayments(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => vi.clearAllMocks())

function renderPaymentHistory() {
  return render(
    <MemoryRouter>
      <PaymentHistory />
    </MemoryRouter>,
  )
}

describe('PaymentHistory', () => {
  it('shows loading skeleton while loading', () => {
    mockUsePayments.mockReturnValue({ payments: [], loading: true })
    renderPaymentHistory()
    expect(screen.getByText('Payment History')).toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows empty state when no payments', () => {
    mockUsePayments.mockReturnValue({ payments: [], loading: false })
    renderPaymentHistory()
    expect(screen.getByText(/no payments yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buy credits/i })).toBeInTheDocument()
  })

  it('navigates to /settings/plans when Buy Credits clicked', async () => {
    const user = userEvent.setup()
    mockUsePayments.mockReturnValue({ payments: [], loading: false })
    renderPaymentHistory()

    await user.click(screen.getByRole('button', { name: /buy credits/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/settings/plans')
  })

  it('renders payment rows when payments exist', () => {
    mockUsePayments.mockReturnValue({
      payments: [
        {
          id: 'p-1',
          amount: 29900,
          plan: 'pro',
          status: 'completed',
          credits: 5,
          currency: 'usd',
          created_at: '2024-06-15T00:00:00Z',
        },
      ],
      loading: false,
    })
    renderPaymentHistory()

    expect(screen.getByText('pro')).toBeInTheDocument()
    expect(screen.getByText('$299.00')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    mockUsePayments.mockReturnValue({
      payments: [
        { id: 'p-1', amount: 14900, plan: 'basic', status: 'completed', credits: 1, currency: 'usd', created_at: '2024-01-01T00:00:00Z' },
      ],
      loading: false,
    })
    renderPaymentHistory()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Plan')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders multiple payment rows', () => {
    mockUsePayments.mockReturnValue({
      payments: [
        { id: 'p-1', amount: 14900, plan: 'basic', status: 'completed', credits: 1, currency: 'usd', created_at: '2024-01-01T00:00:00Z' },
        { id: 'p-2', amount: 29900, plan: 'pro', status: 'completed', credits: 5, currency: 'usd', created_at: '2024-02-01T00:00:00Z' },
      ],
      loading: false,
    })
    renderPaymentHistory()
    expect(screen.getByText('basic')).toBeInTheDocument()
    expect(screen.getByText('pro')).toBeInTheDocument()
  })
})
