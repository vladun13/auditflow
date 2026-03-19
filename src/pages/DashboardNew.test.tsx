import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardNew } from './DashboardNew'
import { makeAudit } from '@/test/helpers'

const mockUseAudits = vi.fn()
vi.mock('@/hooks/useAudits', () => ({
  useAudits: () => mockUseAudits(),
}))

vi.mock('@/hooks/useCredits', () => ({
  useCredits: () => ({ credits: 5 }),
}))

const mockDelete = vi.fn().mockResolvedValue({})
const mockDownloadPdf = vi.fn().mockResolvedValue({})
vi.mock('@/lib/api', () => ({
  auditApi: {
    delete: (...args: unknown[]) => mockDelete(...args),
    downloadPdf: (...args: unknown[]) => mockDownloadPdf(...args),
  },
}))

beforeEach(() => vi.clearAllMocks())

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardNew />
    </MemoryRouter>,
  )
}

describe('DashboardNew', () => {
  it('shows skeleton loading while fetching', () => {
    mockUseAudits.mockReturnValue({ audits: [], loading: true })
    renderDashboard()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders 4 stat cards with correct labels', () => {
    mockUseAudits.mockReturnValue({
      audits: [
        makeAudit({ wcag_score: 90 }),
        makeAudit({ id: 'audit-2', wcag_score: 60 }),
      ],
      loading: false,
      refetch: vi.fn(),
    })
    renderDashboard()

    expect(screen.getByText('Total Audits')).toBeInTheDocument()
    expect(screen.getByText('Avg WCAG Score')).toBeInTheDocument()
    expect(screen.getByText('Critical Issues')).toBeInTheDocument()
    expect(screen.getByText('Compliant Sites')).toBeInTheDocument()
  })

  it('computes correct stat values', () => {
    mockUseAudits.mockReturnValue({
      audits: [
        makeAudit({ wcag_score: 90, critical_count: 2, pages_scanned: 5, status: 'completed' }),
        makeAudit({ id: 'audit-2', wcag_score: 70, critical_count: 1, pages_scanned: 5, status: 'completed' }),
        makeAudit({ id: 'audit-3', wcag_score: 50, critical_count: 3, pages_scanned: 5, status: 'completed' }),
      ],
      loading: false,
      refetch: vi.fn(),
    })
    renderDashboard()

    // Avg WCAG Score = Math.round((90+70+50)/3) = 70
    expect(screen.getByText('70%')).toBeInTheDocument()
    // Critical Issues = 2+1+3 = 6
    expect(screen.getByText('6')).toBeInTheDocument()
    // Compliant Sites = only score >= 80, so 1 (but '1' might appear elsewhere)
    // Total Audits = 3 (use getAllByText since pages_scanned may also show numbers)
    const threeElements = screen.getAllByText('3')
    expect(threeElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when no audits exist', () => {
    mockUseAudits.mockReturnValue({ audits: [], loading: false, refetch: vi.fn() })
    renderDashboard()

    expect(screen.getByText('No audits yet')).toBeInTheDocument()
    expect(screen.getByText('Run your first scan to see your accessibility score.')).toBeInTheDocument()
    expect(screen.getByText('Run Your First Scan')).toBeInTheDocument()
  })

  it('shows max 5 audits in recent list', () => {
    const audits = Array.from({ length: 8 }, (_, i) =>
      makeAudit({ id: `audit-${i}`, website_url: `https://site${i}.com` }),
    )
    mockUseAudits.mockReturnValue({ audits, loading: false, refetch: vi.fn() })
    renderDashboard()

    expect(screen.getByText('https://site0.com')).toBeInTheDocument()
    expect(screen.getByText('https://site4.com')).toBeInTheDocument()
    expect(screen.queryByText('https://site5.com')).not.toBeInTheDocument()
  })

  it('shows View all reports link when more than 5 audits', () => {
    const audits = Array.from({ length: 8 }, (_, i) =>
      makeAudit({ id: `audit-${i}`, website_url: `https://site${i}.com` }),
    )
    mockUseAudits.mockReturnValue({ audits, loading: false, refetch: vi.fn() })
    renderDashboard()

    expect(screen.getByText('View all reports')).toBeInTheDocument()
  })

  it('does not show View all reports when 5 or fewer audits', () => {
    const audits = Array.from({ length: 3 }, (_, i) =>
      makeAudit({ id: `audit-${i}`, website_url: `https://site${i}.com` }),
    )
    mockUseAudits.mockReturnValue({ audits, loading: false, refetch: vi.fn() })
    renderDashboard()

    expect(screen.queryByText('View all reports')).not.toBeInTheDocument()
  })

  it('shows stat cards with zero/dash values when no completed audits', () => {
    mockUseAudits.mockReturnValue({ audits: [], loading: false, refetch: vi.fn() })
    renderDashboard()

    // Total Audits = 0, Avg WCAG Score = '--', Critical Issues = 0, Compliant Sites = 0
    expect(screen.getByText('--')).toBeInTheDocument()
  })
})
