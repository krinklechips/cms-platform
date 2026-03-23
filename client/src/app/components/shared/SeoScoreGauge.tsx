/**
 * SeoScoreGauge - Reusable circular score gauge for SEO scores.
 *
 * Renders a circular ring gauge with color coding:
 *   red   < 50
 *   amber   50-79
 *   green   80+
 *
 * Two sizes: "lg" for dashboard hero widgets, "sm" for inline cards/tables.
 */

interface SeoScoreGaugeProps {
  /** Score value between 0 and 100 */
  score: number
  /** Visual size preset. Defaults to "lg". */
  size?: 'sm' | 'lg'
}

export function SeoScoreGauge({ score, size = 'lg' }: SeoScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))

  // --- size tokens ---
  const isSmall = size === 'sm'
  const svgSize = isSmall ? 64 : 128
  const radius = isSmall ? 26 : 54
  const strokeWidth = isSmall ? 6 : 10
  const center = svgSize / 2

  const circumference = 2 * Math.PI * radius
  const progress = (clamped / 100) * circumference
  const offset = circumference - progress

  // --- color tokens ---
  const color =
    clamped >= 80 ? '#22c55e' : clamped >= 50 ? '#eab308' : '#ef4444'
  const bgColor =
    clamped >= 80 ? 'bg-green-50' : clamped >= 50 ? 'bg-yellow-50' : 'bg-red-50'
  const textColor =
    clamped >= 80 ? 'text-green-700' : clamped >= 50 ? 'text-yellow-700' : 'text-red-700'
  const label = clamped >= 80 ? 'Good' : clamped >= 50 ? 'Needs Work' : 'Poor'

  if (isSmall) {
    return (
      <div className={`inline-flex flex-col items-center justify-center rounded-lg p-2 ${bgColor}`}>
        <div className="relative" style={{ width: svgSize, height: svgSize }}>
          <svg
            className="-rotate-90"
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-gray-200"
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${textColor}`}>{clamped}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center rounded-xl p-6 ${bgColor}`}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          className="-rotate-90"
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${textColor}`}>{clamped}</span>
        </div>
      </div>
      <span className={`mt-2 text-sm font-medium ${textColor}`}>{label}</span>
    </div>
  )
}
