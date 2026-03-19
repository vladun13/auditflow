interface ScoreRingProps {
  score: number
  wcagLevel?: string | null
}

export function ScoreRing({ score, wcagLevel }: ScoreRingProps) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'
  const textColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      <svg width="160" height="160" viewBox="0 0 100 100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={8}
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className={`text-3xl font-bold ${textColor}`}>{score.toFixed(0)}</p>
        {wcagLevel && (
          <p className="text-sm text-gray-500">WCAG {wcagLevel}</p>
        )}
      </div>
    </div>
  )
}
