import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Reports } from './Reports'
import { makeAudit } from '@/test/helpers'

const mockUseAudits = vi.fn()
vi.mock('@/hooks/useAudits', () => ({
  useAudits: () => mockUseAudits(),
}))

const mockDelete = vi.fn()
vi.mock('@/lib/api', () => ({
  auditApi: { delete: (...args: unknown[]) => mockDelete(...args) },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// happy-dom doesn't define window.confirm — stub it globally
const confirmMock = vi.fn()
vi.stubGlobal('confirm', confirmMock)

beforeEach(() => {
  vi.clearAllMocks()
  confirmMock.mockReturnValue(false)
})

function renderReports() {
  return render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>,
  )
}

describe('Reports', () => {
  it('shows skeleton loading while fetching', () => {
    mockUseAudits.mockReturnValue({ audits: [], loading: true, refetch: vi.fn() })
    renderReports()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
  })

  it('shows empty state when no audits', () => {
    mockUseAudits.mockReturnValue({ audits: [], loading: false, refetch: vi.fn() })
    renderReports()
    expect(screen.getByText(/no audits found/i)).toBeInTheDocument()
    expect(screen.getByText(/run your first scan/i)).toBeInTheDocument()
  })

  it('renders audit list when audits exist', () => {
    mockUseAudits.mockReturnValue({
      audits: [makeAudit({ website_url: 'https://example.com', wcag_score: 85 })],
      loading: false,
      refetch: vi.fn(),
    })
    renderReports()
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
  })

  it('renders All Reports heading', () => {
    mockUseAudits.mockReturnValue({ audits: [], loading: false, refetch: vi.fn() })
    renderReports()
    expect(screen.getByText('All Reports')).toBeInTheDocument()
  })

  it('renders status filter buttons', () => {
    mockUseAudits.mockReturnValue({ audits: [], loading: false, refetch: vi.fn() })
    renderReports()
    // Button text includes count e.g. "All (0)" — use regex that matches the count variant
    expect(screen.getByText(/^all\s*\(/i)).toBeInTheDocument()
    expect(screen.getByText(/^completed\s*\(/i)).toBeInTheDocument()
    expect(screen.getByText(/^scanning\s*\(/i)).toBeInTheDocument()
    expect(screen.getByText(/^failed\s*\(/i)).toBeInTheDocument()
  })

  it('filters audits by status', async () => {
    const user = userEvent.setup()
    mockUseAudits.mockReturnValue({
      audits: [
        makeAudit({ id: 'a1', website_url: 'https://done.com', status: 'completed' }),
        makeAudit({ id: 'a2', website_url: 'https://running.com', status: 'scanning' }),
      ],
      loading: false,
      refetch: vi.fn(),
    })
    renderReports()

    // Click the "scanning (1)" filter button
    await user.click(screen.getByText(/^scanning\s*\(/i))

    expect(screen.queryByText('https://done.com')).not.toBeInTheDocument()
    expect(screen.getByText('https://running.com')).toBeInTheDocument()
  })

  it('navigates to audit detail on row click', async () => {
    const user = userEvent.setup()
    const audit = makeAudit({ id: 'audit-xyz', website_url: 'https://click.com' })
    mockUseAudits.mockReturnValue({ audits: [audit], loading: false, refetch: vi.fn() })
    renderReports()

    await user.click(screen.getByText('https://click.com'))
    expect(mockNavigate).toHaveBeenCalledWith('/audits/audit-xyz')
  })

  it('navigates to /scan when New Scan button clicked', async () => {
    const user = userEvent.setup()
    mockUseAudits.mockReturnValue({ audits: [], loading: false, refetch: vi.fn() })
    renderReports()

    await user.click(screen.getByRole('button', { name: /new scan/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/scan')
  })

  it('calls delete API and refetches on confirmed delete', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockDelete.mockResolvedValueOnce({})
    confirmMock.mockReturnValueOnce(true)

    mockUseAudits.mockReturnValue({
      audits: [makeAudit({ id: 'del-1', website_url: 'https://del.com' })],
      loading: false,
      refetch,
    })
    renderReports()

    const deleteBtn = screen.getByRole('button', { name: /delete audit/i })
    await user.click(deleteBtn)

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('del-1'))
    expect(refetch).toHaveBeenCalled()
  })

  it('does not call delete when confirm is cancelled', async () => {
    const user = userEvent.setup()
    // confirmMock defaults to false (set in beforeEach)

    mockUseAudits.mockReturnValue({
      audits: [makeAudit({ id: 'del-1' })],
      loading: false,
      refetch: vi.fn(),
    })
    renderReports()

    const deleteBtn = screen.getByRole('button', { name: /delete audit/i })
    await user.click(deleteBtn)

    expect(mockDelete).not.toHaveBeenCalled()
  })
})
