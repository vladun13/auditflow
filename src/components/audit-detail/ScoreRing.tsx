interface ScoreRingProps { score: number }

export function ScoreRing({ score }: ScoreRingProps) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f'
  return (
    <div className="relative flex items-center justify-center w-[120px] h-[120px]">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f0f0f0" strokeWidth="12" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-gray-900">{score.toFixed(0)}%</p>
      </div>
    </div>
  )
}
