import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuditDetail } from './AuditDetail'
import { makeAudit, makeViolation } from '@/test/helpers'

const mockUseAudit = vi.fn()
vi.mock('@/hooks/useAudit', () => ({
  useAudit: () => mockUseAudit(),
}))

vi.mock('@/lib/api', () => ({
  auditApi: { downloadPdf: vi.fn().mockResolvedValue({}) },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => vi.clearAllMocks())

function renderAuditDetail(id = 'audit-1') {
  return render(
    <MemoryRouter initialEntries={[`/audits/${id}`]}>
      <Routes>
        <Route path="/audits/:id" element={<AuditDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AuditDetail', () => {
  it('shows skeleton loading state', () => {
    mockUseAudit.mockReturnValue({ audit: null, loading: true })
    renderAuditDetail()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
  })

  it('shows not found when audit is null and not loading', () => {
    mockUseAudit.mockReturnValue({ audit: null, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/audit not found/i)).toBeInTheDocument()
  })

  it('shows scanning state when status is scanning', () => {
    const audit = makeAudit({ status: 'scanning', website_url: 'https://scan.com' })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/scanning in progress/i)).toBeInTheDocument()
    expect(screen.getByText('https://scan.com')).toBeInTheDocument()
  })

  it('renders audit URL in header', () => {
    const audit = makeAudit({ website_url: 'https://test.com', status: 'completed' })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText('https://test.com')).toBeInTheDocument()
  })

  it('renders stat cards: pages scanned, total violations, status', () => {
    const audit = makeAudit({
      status: 'completed',
      pages_scanned: 5,
      total_violations: 12,
      wcag_score: 75,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    expect(screen.getByText('Pages Scanned')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Total Violations')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders violation cards when violations exist', () => {
    const violation = makeViolation({ violation_type: 'Missing alt text', impact: 'critical' })
    const audit = makeAudit({ status: 'completed', violations: [violation] })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    expect(screen.getByText('Missing alt text')).toBeInTheDocument()
    expect(screen.getByText('critical')).toBeInTheDocument()
  })

  it('shows empty violations message when no violations', () => {
    const audit = makeAudit({ status: 'completed', violations: [], total_violations: 0 })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/no violations found/i)).toBeInTheDocument()
  })

  it('renders severity breakdown labels', () => {
    const audit = makeAudit({ status: 'completed' })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('Serious')).toBeInTheDocument()
    expect(screen.getByText('Moderate')).toBeInTheDocument()
    expect(screen.getByText('Minor')).toBeInTheDocument()
  })

  it('renders impact filter buttons', () => {
    const audit = makeAudit({ status: 'completed', total_violations: 3 })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /critical/i })).toBeInTheDocument()
  })

  it('renders Download PDF and Back to Reports buttons', () => {
    const audit = makeAudit({ status: 'completed' })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back to reports/i })).toBeInTheDocument()
  })
})
