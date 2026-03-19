import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

// Mock sonner toast for PDF toast test
const mockToast = vi.fn()
vi.mock('sonner', () => ({
  toast: Object.assign(
    (...args: unknown[]) => mockToast(...args),
    { success: vi.fn(), error: vi.fn(), info: (...args: unknown[]) => mockToast(...args) },
  ),
}))

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

const criticalViolation = makeViolation({
  id: 'v-1',
  violation_type: 'missing-alt',
  impact: 'critical',
  wcag_criterion: '1.1.1',
  description: 'Images need alternative text for screen readers',
  ai_explanation: 'Screen readers cannot interpret images without alt text, making content inaccessible to blind users.',
  ai_fix_steps: '1. Add alt attribute to all img elements\n2. Use descriptive text that conveys the image purpose',
  page_url: 'https://example.com',
  affected_elements: 3,
  estimated_fix_hours: 0.5,
})

const seriousViolation = makeViolation({
  id: 'v-2',
  violation_type: 'low-contrast',
  impact: 'serious',
  wcag_criterion: '1.4.3',
  description: 'Text has insufficient color contrast',
  ai_explanation: 'Low contrast text is difficult to read for users with low vision.',
  ai_fix_steps: '1. Increase contrast ratio to at least 4.5:1',
  page_url: 'https://example.com/about',
  affected_elements: 5,
  estimated_fix_hours: 1,
})

describe('AuditDetail', () => {
  // -- Loading / error states --

  it('renders skeleton loading state with animate-pulse', () => {
    mockUseAudit.mockReturnValue({ audit: null, loading: true })
    renderAuditDetail()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows audit not found when audit is null and not loading', () => {
    mockUseAudit.mockReturnValue({ audit: null, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/audit not found/i)).toBeInTheDocument()
  })

  // -- AUDIT-02: Scanning state --

  it('shows scanning view when status is scanning', () => {
    const audit = makeAudit({ status: 'scanning', website_url: 'https://scan.com' })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/scanning in progress/i)).toBeInTheDocument()
  })

  it('does not render violation list during scanning', () => {
    const audit = makeAudit({ status: 'scanning' })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.queryByText('Critical')).not.toBeInTheDocument()
  })

  // -- AUDIT-01: Score ring --

  it('renders score ring with score value', () => {
    const audit = makeAudit({
      status: 'completed',
      wcag_score: 85,
      wcag_level: 'AA',
      violations: [criticalViolation],
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText('85')).toBeInTheDocument()
  })

  it('renders WCAG level label below score', () => {
    const audit = makeAudit({
      status: 'completed',
      wcag_score: 85,
      wcag_level: 'AA',
      violations: [criticalViolation],
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText('WCAG AA')).toBeInTheDocument()
  })

  // -- AUDIT-03: Violation cards with AI content --

  it('renders violation type in the list', () => {
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText('missing-alt')).toBeInTheDocument()
  })

  it('shows Why This Matters section when violation card is expanded', async () => {
    const user = userEvent.setup()
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    // Cards are collapsed by default; click to expand
    await user.click(screen.getByText('missing-alt'))
    expect(screen.getByText('Why This Matters')).toBeInTheDocument()
    expect(screen.getByText(criticalViolation.ai_explanation!)).toBeInTheDocument()
  })

  it('shows How to Fix section when violation card is expanded', async () => {
    const user = userEvent.setup()
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    await user.click(screen.getByText('missing-alt'))
    expect(screen.getByText('How to Fix')).toBeInTheDocument()
    // ai_fix_steps has newlines rendered with whitespace-pre-line; check partial content
    expect(screen.getByText(/Add alt attribute to all img elements/)).toBeInTheDocument()
  })

  // -- AUDIT-04: Severity filter tabs --

  it('renders severity filter tabs', () => {
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation, seriousViolation],
      critical_count: 1,
      serious_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /critical/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /serious/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /moderate/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /minor/i })).toBeInTheDocument()
  })

  it('filters violations when severity tab is clicked', async () => {
    const user = userEvent.setup()
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation, seriousViolation],
      critical_count: 1,
      serious_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    // Default tab is 'all' -- both violations visible
    expect(screen.getByText('missing-alt')).toBeInTheDocument()
    expect(screen.getByText('low-contrast')).toBeInTheDocument()

    // Click Critical tab
    await user.click(screen.getByRole('tab', { name: /critical/i }))

    // Now should show only critical violation
    expect(screen.getByText('missing-alt')).toBeInTheDocument()
    expect(screen.queryByText('low-contrast')).not.toBeInTheDocument()
  })

  // -- AUDIT-05: Download PDF --

  it('renders Download PDF button in header', () => {
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText('Download PDF')).toBeInTheDocument()
  })

  // -- Overview section --

  it('renders website URL as link in header', () => {
    const audit = makeAudit({
      status: 'completed',
      website_url: 'https://test.com',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText('https://test.com')).toBeInTheDocument()
  })

  it('renders stat cards with violation counts', () => {
    const audit = makeAudit({
      status: 'completed',
      wcag_score: 75,
      pages_scanned: 5,
      total_violations: 12,
      critical_count: 3,
      serious_count: 4,
      moderate_count: 3,
      minor_count: 2,
      violations: [criticalViolation],
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText('Pages Scanned')).toBeInTheDocument()
    expect(screen.getByText('Total Violations')).toBeInTheDocument()
  })

  // -- Navigation --

  it('navigates back to reports when Back button is clicked', async () => {
    const user = userEvent.setup()
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    await user.click(screen.getByText('Back to Reports'))
    expect(mockNavigate).toHaveBeenCalledWith('/reports')
  })

  // -- No violations --

  it('shows no violations message when violations array is empty', () => {
    const audit = makeAudit({ status: 'completed', violations: [], total_violations: 0 })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/no violations found/i)).toBeInTheDocument()
  })
})
