import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { NewScan } from './NewScan'

const mockUseAuth = vi.fn()
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

const mockUseCredits = vi.fn()
vi.mock('@/hooks/useCredits', () => ({
  useCredits: () => mockUseCredits(),
}))

const mockCreate = vi.fn()
const mockStartScan = vi.fn()
vi.mock('@/lib/api', () => ({
  auditApi: {
    create: (...args: unknown[]) => mockCreate(...args),
    startScan: (...args: unknown[]) => mockStartScan(...args),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  mockUseAuth.mockReturnValue({ user: { id: 'u-1' } })
  mockUseCredits.mockReturnValue({ credits: 5, loading: false })
})

function renderNewScan(path = '/scan') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/scan" element={<NewScan />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('NewScan', () => {
  // ── SCAN-01: 2-column layout ────────────────────────────────────────────────

  it('renders the page heading', () => {
    renderNewScan()
    expect(screen.getByText('New Accessibility Scan')).toBeInTheDocument()
  })

  it('renders the URL input and Start Scan button', () => {
    renderNewScan()
    expect(screen.getByLabelText(/website url/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start scan/i })).toBeInTheDocument()
  })

  it('renders WCAG principles checklist in right panel', () => {
    renderNewScan()
    expect(screen.getByText('Perceivable')).toBeInTheDocument()
    expect(screen.getByText('Operable')).toBeInTheDocument()
    expect(screen.getByText('Understandable')).toBeInTheDocument()
    expect(screen.getByText('Robust')).toBeInTheDocument()
  })

  it('renders 2-column grid layout', () => {
    const { container } = renderNewScan()
    const grid = container.querySelector('.grid.lg\\:grid-cols-2')
    expect(grid).toBeInTheDocument()
  })

  // ── SCAN-02: Scan progress ────────────────────────────────────────────────

  it('shows scan progress steps when scanning', async () => {
    const user = userEvent.setup()
    mockCreate.mockImplementation(() => new Promise(() => {})) // never resolves

    renderNewScan()
    await user.type(screen.getByLabelText(/website url/i), 'https://example.com')
    await user.click(screen.getByRole('button', { name: /start scan/i }))

    await waitFor(() => {
      expect(screen.getByText('Crawling pages')).toBeInTheDocument()
      expect(screen.getByText('Running axe-core')).toBeInTheDocument()
      expect(screen.getByText('Generating AI fixes')).toBeInTheDocument()
    })
  })

  // ── SCAN-03: Zero credits ────────────────────────────────────────────────

  it('shows credit balance when credits available', () => {
    renderNewScan()
    expect(screen.getByText(/5 credits remaining/i)).toBeInTheDocument()
  })

  it('shows no credits remaining warning when credits are 0', () => {
    mockUseCredits.mockReturnValue({ credits: 0, loading: false })
    renderNewScan()
    // Phase 2 target: "No credits remaining" banner
    expect(screen.getByText(/no credits/i)).toBeInTheDocument()
  })

  it('disables Start Scan button when no credits (disabled state)', () => {
    mockUseCredits.mockReturnValue({ credits: 0, loading: false })
    renderNewScan()
    expect(screen.getByRole('button', { name: /start scan/i })).toBeDisabled()
  })

  it('shows upgrade link when no credits', () => {
    mockUseCredits.mockReturnValue({ credits: 0, loading: false })
    renderNewScan()
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
  })

  // ── SCAN-04: URL pre-fill ────────────────────────────────────────────────

  it('pre-fills URL from query param', () => {
    renderNewScan('/scan?url=https://prefilled.com')
    expect(screen.getByLabelText(/website url/i)).toHaveValue('https://prefilled.com')
  })

  it('pre-fills URL from sessionStorage (auditflow_pending_url)', () => {
    sessionStorage.setItem('auditflow_pending_url', 'https://session-url.com')
    renderNewScan()
    expect(screen.getByLabelText(/website url/i)).toHaveValue('https://session-url.com')
    // sessionStorage should be cleared after reading
    expect(sessionStorage.getItem('auditflow_pending_url')).toBeNull()
  })

  it('prefers query param over sessionStorage', () => {
    sessionStorage.setItem('auditflow_pending_url', 'https://session-url.com')
    renderNewScan('/scan?url=https://param-url.com')
    expect(screen.getByLabelText(/website url/i)).toHaveValue('https://param-url.com')
  })

  // ── Form validation and submission ──────────────────────────────────────

  it('shows validation error for non-http/https URL', async () => {
    const user = userEvent.setup()
    renderNewScan()

    await user.type(screen.getByLabelText(/website url/i), 'ftp://example.com')
    await user.click(screen.getByRole('button', { name: /start scan/i }))

    await waitFor(() =>
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument()
    )
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('submits form and navigates on success', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValueOnce({ data: { audit_id: 'new-audit-1' } })
    mockStartScan.mockResolvedValueOnce({ error: null })

    renderNewScan()
    await user.type(screen.getByLabelText(/website url/i), 'https://example.com')
    await user.click(screen.getByRole('button', { name: /start scan/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/audits/new-audit-1'))
  })

  it('shows API error when create fails', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValueOnce({ data: null, error: 'Quota exceeded' })

    renderNewScan()
    await user.type(screen.getByLabelText(/website url/i), 'https://example.com')
    await user.click(screen.getByRole('button', { name: /start scan/i }))

    await waitFor(() => expect(screen.getByText('Quota exceeded')).toBeInTheDocument())
  })

  it('navigates to /login when user is null on submit', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({ user: null })

    renderNewScan()
    await user.type(screen.getByLabelText(/website url/i), 'https://example.com')
    await user.click(screen.getByRole('button', { name: /start scan/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
  })
})
