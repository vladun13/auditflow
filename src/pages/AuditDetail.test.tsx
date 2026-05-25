import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
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

// Hoist mock references so they can be used in vi.mock factories
const { mockToast, mockToastError, mockGeneratePdf } = vi.hoisted(() => ({
  mockToast: vi.fn(),
  mockToastError: vi.fn(),
  mockGeneratePdf: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('sonner', () => ({
  toast: Object.assign(
    (...args: unknown[]) => mockToast(...args),
    { success: vi.fn(), error: mockToastError, info: (...args: unknown[]) => mockToast(...args) },
  ),
}))

vi.mock('@/lib/pdf', () => ({
  generatePdf: (...args: unknown[]) => mockGeneratePdf(...args),
}))

vi.mock('@/components/pdf/PdfReport', () => ({
  PdfReport: ({ audit }: { audit: { id: string } }) => (
    <div data-testid="pdf-report">{audit.id}</div>
  ),
}))

beforeEach(() => vi.clearAllMocks())

function renderAuditDetail(id = 'audit-1') {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={[`/audits/${id}`]}>
        <Routes>
          <Route path="/audits/:id" element={<AuditDetail />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>,
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

  it('shows failed state when audit status is failed', () => {
    const audit = makeAudit({ status: 'failed', website_url: 'https://fail.com' })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/scan failed/i)).toBeInTheDocument()
  })

  // -- AUDIT-02: Scanning state --

  it('shows scanning view when status is scanning', () => {
    const audit = makeAudit({ status: 'scanning', website_url: 'https://scan.com' })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/scanning in progress/i)).toBeInTheDocument()
  })

  it('shows scan step indicators: Crawling pages, Scanning your site, Generating AI fixes', () => {
    const audit = makeAudit({ status: 'scanning' })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText('Crawling pages')).toBeInTheDocument()
    expect(screen.getByText('Scanning your site')).toBeInTheDocument()
    expect(screen.getByText('Generating AI fixes')).toBeInTheDocument()
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
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('renders WCAG compliance label based on score', () => {
    const audit = makeAudit({
      status: 'completed',
      wcag_score: 85,
      wcag_level: 'AA',
      violations: [criticalViolation],
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/WCAG AA/i)).toBeInTheDocument()
  })

  // -- AUDIT-03: Violation cards --

  it('renders violation description in the issues list', () => {
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText(criticalViolation.description)).toBeInTheDocument()
  })

  it('shows AI explanation in violation details panel', () => {
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/Screen readers cannot interpret images/)).toBeInTheDocument()
  })

  it('shows How to Fix panel with first violation auto-selected', () => {
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText('How to Fix it')).toBeInTheDocument()
    expect(screen.getByText(/Add alt attribute to all img elements/)).toBeInTheDocument()
  })

  // -- AUDIT-04: Severity filter tabs --

  it('renders severity filter buttons for non-empty impact groups', () => {
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation, seriousViolation],
      critical_count: 1,
      serious_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    expect(screen.getByRole('button', { name: /critical/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /serious/i })).toBeInTheDocument()
  })

  it('filters violations when severity button is clicked', async () => {
    const user = userEvent.setup()
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation, seriousViolation],
      critical_count: 1,
      serious_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    // Critical tab active by default — critical violation description shown in sidebar
    expect(screen.getByText(criticalViolation.description)).toBeInTheDocument()

    // Click Serious tab
    await user.click(screen.getByRole('button', { name: /serious/i }))

    // Now serious violation is in sidebar, critical is filtered out
    await waitFor(() => {
      expect(screen.getByText(seriousViolation.description)).toBeInTheDocument()
      expect(screen.queryByText(criticalViolation.description)).not.toBeInTheDocument()
    })
  })

  // -- AUDIT-05: Download PDF --

  it('renders PDF icon button in overview header', () => {
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    // The PDF button has accessible text "PDF"
    expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument()
  })

  it('calls generatePdf when PDF button is clicked on completed audit', async () => {
    const user = userEvent.setup()
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    await user.click(screen.getByRole('button', { name: 'PDF' }))

    await waitFor(() => {
      expect(mockGeneratePdf).toHaveBeenCalledOnce()
    })
    expect(mockGeneratePdf.mock.calls[0][0]).toBeInstanceOf(HTMLElement)
    expect(mockGeneratePdf.mock.calls[0][1]).toBe('auditflow-report-audit-1.pdf')
  })

  it('disables PDF button while PDF is being generated', async () => {
    const user = userEvent.setup()
    // Never-resolving promise to keep loading state
    mockGeneratePdf.mockReturnValue(new Promise(() => {}))
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    await user.click(screen.getByRole('button', { name: 'PDF' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled()
    })
  })

  it('shows error toast when PDF generation fails', async () => {
    const user = userEvent.setup()
    mockGeneratePdf.mockRejectedValue(new Error('canvas error'))
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()

    await user.click(screen.getByRole('button', { name: 'PDF' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to generate PDF. Please try again.')
    })
  })

  it('renders hidden PdfReport component for completed audit', () => {
    const audit = makeAudit({
      status: 'completed',
      violations: [criticalViolation],
      critical_count: 1,
    })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByTestId('pdf-report')).toBeInTheDocument()
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

  it('renders violation severity labels in criteria card', () => {
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
    expect(screen.getByText('Critical Issues')).toBeInTheDocument()
    expect(screen.getByText('Serious Issues')).toBeInTheDocument()
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

    await user.click(screen.getByText('Back to Home'))
    expect(mockNavigate).toHaveBeenCalledWith('/reports')
  })

  // -- No violations --

  it('shows no issues message when violations array is empty', () => {
    const audit = makeAudit({ status: 'completed', violations: [], total_violations: 0 })
    mockUseAudit.mockReturnValue({ audit, loading: false })
    renderAuditDetail()
    expect(screen.getByText(/No Issues Found/i)).toBeInTheDocument()
  })
})
