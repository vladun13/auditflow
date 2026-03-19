import type { Audit, Violation } from '@/types'

const SEVERITY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  critical: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  serious: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  moderate: { bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
  minor: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
}

const SCORE_COLORS: Record<string, string> = {
  green: '#16a34a',
  yellow: '#ca8a04',
  red: '#dc2626',
}

function getScoreHex(score: number): string {
  if (score >= 80) return SCORE_COLORS.green
  if (score >= 60) return SCORE_COLORS.yellow
  return SCORE_COLORS.red
}

interface PdfReportProps {
  audit: Audit
}

function ViolationCard({ violation }: { violation: Violation }) {
  const colors = SEVERITY_COLORS[violation.impact] ?? SEVERITY_COLORS.minor
  const fixSteps = violation.ai_fix_steps
    ? violation.ai_fix_steps.split('\n').filter(Boolean)
    : []

  return (
    <div
      style={{
        breakInside: 'avoid',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>
          {violation.violation_type}
        </span>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
        >
          {violation.impact}
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          WCAG {violation.wcag_criterion}
        </span>
      </div>

      {/* Why This Matters */}
      <div style={{ marginBottom: '10px' }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: '13px',
            color: '#374151',
            marginBottom: '4px',
          }}
        >
          Why This Matters
        </div>
        <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
          {violation.ai_explanation ?? 'No AI explanation available'}
        </div>
      </div>

      {/* How to Fix */}
      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: '13px',
            color: '#374151',
            marginBottom: '4px',
          }}
        >
          How to Fix
        </div>
        {fixSteps.length > 0 ? (
          <ol
            style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13px',
              color: '#4b5563',
              lineHeight: '1.6',
            }}
          >
            {fixSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        ) : (
          <div
            style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}
          >
            No fix steps available
          </div>
        )}
      </div>
    </div>
  )
}

export function PdfReport({ audit }: PdfReportProps) {
  const score = audit.wcag_score ?? 0
  const scoreColor = getScoreHex(score)
  const scanDate = new Date(audit.created_at).toLocaleDateString()
  const violations = audit.violations ?? []

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        backgroundColor: '#ffffff',
        color: '#111827',
        padding: '24px',
        maxWidth: '210mm',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '2px solid #4F46E5',
          paddingBottom: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            color: '#4F46E5',
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          AuditFlow Report
        </div>
        <div
          style={{ fontSize: '16px', color: '#111827', marginBottom: '4px' }}
        >
          {audit.website_url}
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280' }}>
          Scanned: {scanDate}
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280' }}>
          Report ID: {audit.id}
        </div>
      </div>

      {/* Score Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '20px',
          borderRadius: '10px',
          border: `2px solid ${scoreColor}`,
          marginBottom: '24px',
          backgroundColor: '#fafafa',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: scoreColor,
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div>
          <div
            style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}
          >
            {audit.wcag_level ? `WCAG ${audit.wcag_level}` : 'Not Rated'}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            Compliance Score
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {(
          [
            { label: 'Critical', count: audit.critical_count, key: 'critical' },
            { label: 'Serious', count: audit.serious_count, key: 'serious' },
            { label: 'Moderate', count: audit.moderate_count, key: 'moderate' },
            { label: 'Minor', count: audit.minor_count, key: 'minor' },
          ] as const
        ).map(({ label, count, key }) => {
          const colors = SEVERITY_COLORS[key]
          return (
            <div
              key={key}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '12px 8px',
                borderRadius: '8px',
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: colors.text,
                }}
              >
                {count}
              </div>
              <div style={{ fontSize: '12px', color: colors.text }}>
                {label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Violations List */}
      <div>
        <div
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '16px',
          }}
        >
          Violations ({violations.length})
        </div>

        {violations.length > 0 ? (
          violations.map((violation) => (
            <ViolationCard key={violation.id} violation={violation} />
          ))
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '32px',
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            No violations found
          </div>
        )}
      </div>
    </div>
  )
}
