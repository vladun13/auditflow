import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardNew } from './DashboardNew'
import { makeAudit } from '@/test/helpers'

const mockUseAudits = vi.fn()
vi.mock('@/hooks/useAudits', () => ({
  useAudits: () => mockUseAudits(),
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
  it('shows loading spinner while fetching', () => {
    mockUseAudits.mockReturnValue({ audits: [], loading: true })
    renderDashboard()
    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument()
  })

  it('renders stat cards when audits are loaded', async () => {
    mockUseAudits.mockReturnValue({
      audits: [makeAudit({ wcag_score: 90 }), makeAudit({ id: 'audit-2', wcag_score: 60 })],
      loading: false,
    })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Total Audits')).toBeInTheDocument()
      expect(screen.getByText('Avg. Score')).toBeInTheDocument()
      expect(screen.getByText('Critical Issues')).toBeInTheDocument()
      expect(screen.getByText('Compliant Sites')).toBeInTheDocument()
    })
  })

  it('shows empty state when no audits exist', () => {
    mockUseAudits.mockReturnValue({ audits: [], loading: false })
    renderDashboard()
    expect(screen.getByText(/no audits yet/i)).toBeInTheDocument()
    expect(screen.getByText(/run your first scan/i)).toBeInTheDocument()
  })

  it('shows recent audits list when audits exist', () => {
    mockUseAudits.mockReturnValue({
      audits: [makeAudit({ website_url: 'https://example.com', wcag_score: 78 })],
      loading: false,
    })
    renderDashboard()
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
    expect(screen.getByText('Recent Audits')).toBeInTheDocument()
  })

  it('shows max 5 recent audits', () => {
    const audits = Array.from({ length: 8 }, (_, i) =>
      makeAudit({ id: `audit-${i}`, website_url: `https://site${i}.com` }),
    )
    mockUseAudits.mockReturnValue({ audits, loading: false })
    renderDashboard()

    // Only first 5 should appear in "Recent Audits" section
    expect(screen.getByText('https://site0.com')).toBeInTheDocument()
    expect(screen.getByText('https://site4.com')).toBeInTheDocument()
    expect(screen.queryByText('https://site5.com')).not.toBeInTheDocument()
  })

  it('renders quick action cards', () => {
    mockUseAudits.mockReturnValue({ audits: [], loading: false })
    renderDashboard()
    expect(screen.getByText('Start New Audit')).toBeInTheDocument()
    expect(screen.getByText('View All Reports')).toBeInTheDocument()
  })

  it('calculates correct total audits count', () => {
    // critical_count: 0 avoids "3" appearing in both Total Audits and Critical Issues cards
    const audits = [
      makeAudit({ critical_count: 0 }),
      makeAudit({ id: 'audit-2', critical_count: 0 }),
      makeAudit({ id: 'audit-3', critical_count: 0 }),
    ]
    mockUseAudits.mockReturnValue({ audits, loading: false })
    renderDashboard()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
