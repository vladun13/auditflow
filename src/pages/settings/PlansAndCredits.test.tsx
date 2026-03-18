import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'sonner'
import { PlansAndCredits } from './PlansAndCredits'

const mockUseCredits = vi.fn()
vi.mock('@/hooks/useCredits', () => ({
  useCredits: () => mockUseCredits(),
}))

const mockCreateCheckout = vi.fn()
vi.mock('@/lib/api', () => ({
  paymentApi: { createCheckout: (...args: unknown[]) => mockCreateCheckout(...args) },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  vi.clearAllMocks()
  mockUseCredits.mockReturnValue({ credits: 3, loading: false })
})

function renderPlansAndCredits() {
  return render(
    <MemoryRouter>
      <PlansAndCredits />
    </MemoryRouter>,
  )
}

describe('PlansAndCredits', () => {
  it('renders Plans & Credits heading', () => {
    renderPlansAndCredits()
    expect(screen.getByText('Plans & Credits')).toBeInTheDocument()
  })

  it('shows credit balance', () => {
    renderPlansAndCredits()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Available credits')).toBeInTheDocument()
  })

  it('shows — when credits are loading', () => {
    mockUseCredits.mockReturnValue({ credits: null, loading: true })
    renderPlansAndCredits()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders all 3 credit packs', () => {
    renderPlansAndCredits()
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('shows prices for each pack', () => {
    renderPlansAndCredits()
    expect(screen.getByText('$149')).toBeInTheDocument()
    expect(screen.getByText('$299')).toBeInTheDocument()
    expect(screen.getByText('$499')).toBeInTheDocument()
  })

  it('shows Most Popular badge on Pro pack', () => {
    renderPlansAndCredits()
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('calls createCheckout with plan id on buy click', async () => {
    const user = userEvent.setup()
    mockCreateCheckout.mockResolvedValueOnce({ data: { url: 'https://checkout.example.com' } })
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    })

    renderPlansAndCredits()
    await user.click(screen.getByRole('button', { name: /buy basic/i }))

    await waitFor(() => expect(mockCreateCheckout).toHaveBeenCalledWith('basic'))
  })

  it('shows toast error when checkout fails', async () => {
    const user = userEvent.setup()
    mockCreateCheckout.mockResolvedValueOnce({ data: null, error: 'Payment unavailable' })

    renderPlansAndCredits()
    await user.click(screen.getByRole('button', { name: /buy pro/i }))

    await waitFor(() =>
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Payment unavailable')
    )
  })

  it('navigates to credit history when View history clicked', async () => {
    const user = userEvent.setup()
    renderPlansAndCredits()

    await user.click(screen.getByRole('button', { name: /view history/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/settings/credits')
  })
})
