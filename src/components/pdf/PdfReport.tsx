import type { Audit, Violation } from '@/types'

// ─── Color maps ──────────────────────────────────────────────────────────────

const IMPACT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  critical: { bg: '#fff1f2', text: '#dc2626', border: '#fecaca', dot: '#ef4444' },
  serious:  { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa', dot: '#f97316' },
  moderate: { bg: '#fefce8', text: '#ca8a04', border: '#fef08a', dot: '#eab308' },
  minor:    { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', dot: '#3b82f6' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function wcagPrinciple(criterion: string): 1 | 2 | 3 | 4 {
  const n = parseFloat(criterion)
  if (n >= 1 && n < 2) return 1
  if (n >= 2 && n < 3) return 2
  if (n >= 3 && n < 4) return 3
  return 4
}

function formatHours(h: number | null): string {
  if (h == null) return '—'
  if (h < 1) return '< 1 hr'
  if (h === 1) return '1 hour'
  return `${h} hours`
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Sub-components (all inline-style for PDF fidelity) ──────────────────────

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
      <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
        <path d="M0 0 L8 0 L16 12 L8 24 L0 24 L8 12 Z" fill="#4F46E5" />
        <path d="M12 0 L20 0 L28 12 L20 24 L12 24 L20 12 Z" fill="#818CF8" />
      </svg>
      <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>AuditFlow</span>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '14px',
      fontWeight: 700,
      color: '#111827',
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as const,
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '6px',
      marginBottom: '14px',
      marginTop: '28px',
    }}>
      {children}
    </div>
  )
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '14px 16px',
      marginBottom: '14px',
      backgroundColor: '#f9fafb',
      fontSize: '13px',
      lineHeight: '1.8',
      color: '#374151',
    }}>
      {children}
    </div>
  )
}

function CodeBox({ label, code }: { label?: string; code: string }) {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '10px',
      overflow: 'hidden',
    }}>
      {label && (
        <div style={{
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#374151',
        }}>
          {label}
        </div>
      )}
      <div style={{
        padding: '10px 12px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#374151',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-all' as const,
        backgroundColor: '#ffffff',
      }}>
        {code}
      </div>
    </div>
  )
}

function TimePill({ hours }: { hours: number | null }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #c7d2fe', borderRadius: '20px', padding: '4px 12px', backgroundColor: '#eef2ff', marginTop: '4px' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
      <span style={{ fontSize: '12px', color: '#4338CA', fontWeight: 500 }}>{formatHours(hours)}</span>
    </div>
  )
}

function ImpactDot({ impact }: { impact: string }) {
  const c = IMPACT_COLORS[impact] ?? IMPACT_COLORS.minor
  return <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.dot, marginRight: '5px', verticalAlign: 'middle' }} />
}

// ─── Violation block ──────────────────────────────────────────────────────────

function ViolationBlock({ violation, index }: { violation: Violation; index: number }) {
  const c = IMPACT_COLORS[violation.impact] ?? IMPACT_COLORS.minor

  // Parse ai_fix_steps into lines
  const rawSteps = violation.ai_fix_steps ?? ''
  const allLines = rawSteps.split('\n').map(l => l.trim()).filter(Boolean)

  // Heuristically split into numbered steps vs code examples
  const numberedSteps = allLines.filter(l => /^\d+\./.test(l))
  const codeLines = allLines.filter(l => !(/^\d+\./.test(l)) && l.length > 0)

  return (
    <div style={{ marginBottom: '32px', breakInside: 'avoid' as const }}>
      {/* Title */}
      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
        {index}. {violation.violation_type}
      </div>

      {/* Meta info box */}
      <InfoBox>
        <div><strong>WCAG Criterion:</strong> {violation.wcag_criterion}</div>
        <div>
          <strong>Impact Level:</strong>{' '}
          <ImpactDot impact={violation.impact} />
          <span style={{ color: c.text, fontWeight: 600 }}>{capitalize(violation.impact)}</span>
        </div>
        <div><strong>Total Affected Elements:</strong> {violation.affected_elements}</div>
      </InfoBox>

      {/* Affected page */}
      {violation.page_url && (
        <>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>Affected Page</div>
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '8px 12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span style={{ fontSize: '12px', color: '#2563eb', fontFamily: 'monospace', wordBreak: 'break-all' as const }}>{violation.page_url}</span>
          </div>
        </>
      )}

      {/* Description / AI Explanation */}
      {violation.ai_explanation ? (
        <>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>AI-Generated Explanation</div>
          <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6', marginBottom: '14px' }}>
            {violation.ai_explanation}
          </div>
        </>
      ) : violation.description ? (
        <>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Explanation</div>
          <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6', marginBottom: '14px' }}>
            {violation.description}
          </div>
        </>
      ) : null}

      {/* Fix steps */}
      {numberedSteps.length > 0 && (
        <>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Step-by-Step Remediation Instructions</div>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#374151', lineHeight: '1.7' }}>
            {numberedSteps.map((step, i) => (
              <li key={i}>{step.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        </>
      )}

      {/* Code snippets from fix steps */}
      {codeLines.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <CodeBox label="Example Fix" code={codeLines.join('\n')} />
        </div>
      )}

      {/* Estimated fix time */}
      {violation.estimated_fix_hours != null && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Estimated Remediation Time</div>
          <TimePill hours={violation.estimated_fix_hours} />
        </div>
      )}
    </div>
  )
}

// ─── Summary table ────────────────────────────────────────────────────────────

function SummaryTable({ audit }: { audit: Audit }) {
  const violations = audit.violations ?? []

  const impacts: Array<{ key: 'critical' | 'serious' | 'moderate' | 'minor'; label: string }> = [
    { key: 'critical', label: 'Critical' },
    { key: 'serious',  label: 'Serious' },
    { key: 'moderate', label: 'Moderate' },
    { key: 'minor',    label: 'Minor' },
  ]

  const rows = impacts
    .map(({ key, label }) => {
      const items = violations.filter(v => v.impact === key)
      if (items.length === 0) return null
      const totalHours = items.reduce((s, v) => s + (v.estimated_fix_hours ?? 0), 0)
      return { key, label, count: items.length, hours: totalHours }
    })
    .filter(Boolean) as Array<{ key: string; label: string; count: number; hours: number }>

  const totalHours = rows.reduce((s, r) => s + r.hours, 0)

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>Summary</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' as const, border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Impact Level</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Issues</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Estimated Hours</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const c = IMPACT_COLORS[row.key]
            return (
              <tr key={row.key} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ border: `1px solid ${c.border}`, color: c.text, borderRadius: '6px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>
                    {row.label}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', color: '#374151' }}>{row.count}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ border: '1px solid #e5e7eb', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', color: '#374151', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {row.hours < 1 ? '< 1 hr' : `${row.hours} hrs`}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Total fix time */}
      <div style={{ marginTop: '10px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1e40af' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        <strong>Total Estimated Fix Time:</strong>&nbsp;{totalHours < 1 ? '< 1 hr' : `${totalHours} hours`}
      </div>
    </div>
  )
}

// ─── WCAG Scorecard ───────────────────────────────────────────────────────────

function WcagScorecard({ audit }: { audit: Audit }) {
  const violations = audit.violations ?? []

  const principles = [
    { num: 1 as const, name: '1. Perceivable' },
    { num: 2 as const, name: '2. Operable' },
    { num: 3 as const, name: '3. Understandable' },
    { num: 4 as const, name: '4. Robust' },
  ]

  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>WCAG Compliance Scorecard</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' as const, border: '1px solid #e5e7eb', fontSize: '13px', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Impact Level</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Status</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' as const, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Level</th>
          </tr>
        </thead>
        <tbody>
          {principles.map(p => {
            const count = violations.filter(v => wcagPrinciple(v.wcag_criterion) === p.num).length
            const status = count === 0 ? 'Compliant' : count <= 2 ? 'Mostly Compliant' : 'Partial'
            const statusColor = count === 0 ? '#16a34a' : count <= 2 ? '#2563eb' : '#6b7280'
            const statusBg = count === 0 ? '#f0fdf4' : count <= 2 ? '#eff6ff' : '#f9fafb'
            const statusBorder = count === 0 ? '#bbf7d0' : count <= 2 ? '#bfdbfe' : '#e5e7eb'

            return (
              <tr key={p.num} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px 12px', color: '#374151' }}>{p.name}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ border: `1px solid ${statusBorder}`, backgroundColor: statusBg, color: statusColor, borderRadius: '6px', padding: '2px 10px', fontSize: '12px', fontWeight: 500 }}>
                    {status}
                  </span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', color: '#374151' }}>
                    {audit.wcag_level ?? 'AA'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

interface PdfReportProps {
  audit: Audit
}

export function PdfReport({ audit }: PdfReportProps) {
  const violations = audit.violations ?? []
  const score = audit.wcag_score ?? 0
  const scanDate = new Date(audit.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const compliance = score >= 85 ? 'Full Compliance' : score >= 70 ? 'Partial Compliance' : 'Non-Compliant'

  const impactPills = [
    { key: 'critical', label: 'Critical', count: audit.critical_count ?? 0 },
    { key: 'serious',  label: 'Serious',  count: audit.serious_count ?? 0 },
    { key: 'moderate', label: 'Moderate', count: audit.moderate_count ?? 0 },
    { key: 'minor',    label: 'Minor',    count: audit.minor_count ?? 0 },
  ]

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#ffffff', color: '#111827', padding: '32px 36px', maxWidth: '210mm', margin: '0 auto' }}>

      {/* Logo + Title */}
      <Logo />
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        WCAG Accessibility Audit Report
      </div>

      {/* Executive Summary */}
      <SectionHeading>Executive Summary</SectionHeading>

      <InfoBox>
        <div><strong>Website URL:</strong>{' '}
          <a href={audit.website_url} style={{ color: '#4F46E5', textDecoration: 'none' }}>{audit.website_url}</a>
        </div>
        <div><strong>Scan Date:</strong> {scanDate}</div>
        <div><strong>WCAG Score:</strong> {score}% – Level {audit.wcag_level ?? 'AA'} ({compliance})</div>
        <div><strong>Pages Scanned:</strong> {audit.pages_scanned}</div>
        <div><strong>Total Violations:</strong> {audit.total_violations}</div>
      </InfoBox>

      {/* Violations by impact level */}
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Violations by Impact Level</div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' as const }}>
        {impactPills.map(p => {
          const c = IMPACT_COLORS[p.key]
          return (
            <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${c.border}`, borderRadius: '20px', padding: '5px 12px', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.dot, display: 'inline-block' }} />
              <span style={{ color: '#374151' }}>{p.label}:</span>
              <span style={{ color: c.text }}>{p.count}</span>
            </div>
          )
        })}
      </div>

      {/* Detailed Violations Section */}
      {violations.length > 0 && (
        <>
          <SectionHeading>Detailed Violations Section</SectionHeading>
          {violations.map((v, i) => (
            <ViolationBlock key={v.id} violation={v} index={i + 1} />
          ))}
        </>
      )}

      {/* Summary + Scorecard */}
      {violations.length > 0 && (
        <>
          <SectionHeading>Summary & Scorecard</SectionHeading>
          <SummaryTable audit={audit} />
          <WcagScorecard audit={audit} />
        </>
      )}

      {/* Footer */}
      <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '12px', fontSize: '11px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' as const }}>
        <span>Generated by AuditFlow — {new Date().toLocaleDateString()}</span>
        <span>Report ID: {audit.id}</span>
      </div>
    </div>
  )
}
