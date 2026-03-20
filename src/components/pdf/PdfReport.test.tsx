import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PdfReport } from './PdfReport'
import { makeAudit, makeViolation } from '@/test/helpers'

describe('PdfReport', () => {
  it('renders audit report heading', () => {
    const audit = makeAudit()
    render(<PdfReport audit={audit} />)

    expect(screen.getByText('WCAG Accessibility Audit Report')).toBeInTheDocument()
  })

  it('renders the audit website URL', () => {
    const audit = makeAudit({ website_url: 'https://test-site.com' })
    render(<PdfReport audit={audit} />)

    expect(screen.getByText('https://test-site.com')).toBeInTheDocument()
  })

  it('renders scan date label from created_at', () => {
    const audit = makeAudit({ created_at: '2024-03-01T12:00:00Z' })
    render(<PdfReport audit={audit} />)

    expect(screen.getByText(/Scan Date:/)).toBeInTheDocument()
  })

  it('renders the audit ID', () => {
    const audit = makeAudit({ id: 'abc-123' })
    render(<PdfReport audit={audit} />)

    expect(screen.getByText('Report ID: abc-123')).toBeInTheDocument()
  })

  it('renders WCAG score number and compliance level', () => {
    const audit = makeAudit({ wcag_score: 85, wcag_level: 'AA' })
    render(<PdfReport audit={audit} />)

    expect(screen.getByText(/85%/)).toBeInTheDocument()
    expect(screen.getByText(/AA/)).toBeInTheDocument()
  })

  it('renders four severity stat labels', () => {
    const audit = makeAudit({
      critical_count: 3,
      serious_count: 5,
      moderate_count: 2,
      minor_count: 7,
    })
    render(<PdfReport audit={audit} />)

    expect(screen.getByText(/Critical/)).toBeInTheDocument()
    expect(screen.getByText(/Serious/)).toBeInTheDocument()
    expect(screen.getByText(/Moderate/)).toBeInTheDocument()
    expect(screen.getByText(/Minor/)).toBeInTheDocument()
  })

  it('renders violation cards with type, impact, AI explanation, and fix steps', () => {
    const violations = [
      makeViolation({
        violation_type: 'color-contrast',
        impact: 'serious',
        ai_explanation: 'Low contrast makes text hard to read.',
        ai_fix_steps: '1. Increase contrast ratio\n2. Use darker text color',
      }),
      makeViolation({
        id: 'v-2',
        violation_type: 'missing-alt',
        impact: 'critical',
        ai_explanation: 'Images need alt text for screen readers.',
        ai_fix_steps: '1. Add alt attribute to img tags',
      }),
    ]
    const audit = makeAudit({ violations })
    render(<PdfReport audit={audit} />)

    expect(screen.getByText(/color-contrast/)).toBeInTheDocument()
    expect(screen.getAllByText(/Serious/i).length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByText('Low contrast makes text hard to read.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Increase contrast ratio')).toBeInTheDocument()

    expect(screen.getByText(/missing-alt/)).toBeInTheDocument()
    expect(screen.getAllByText(/Critical/i).length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByText('Images need alt text for screen readers.'),
    ).toBeInTheDocument()
  })

  it('does not render violations section when violations array is empty', () => {
    const audit = makeAudit({ violations: [] })
    render(<PdfReport audit={audit} />)

    expect(screen.queryByText('Detailed Violations Section')).not.toBeInTheDocument()
  })

  it('falls back to description when AI fields are null', () => {
    const violations = [
      makeViolation({
        ai_explanation: null,
        ai_fix_steps: null,
      }),
    ]
    const audit = makeAudit({ violations })
    render(<PdfReport audit={audit} />)

    // Falls back to violation.description
    expect(
      screen.getByText('Elements must have sufficient color contrast'),
    ).toBeInTheDocument()
    // No numbered steps section
    expect(screen.queryByText('Step-by-Step Remediation Instructions')).not.toBeInTheDocument()
  })
})
