/**
 * CharBadge - Character count indicator with color coding.
 *
 * Green  : count is between min and max (in range)
 * Amber  : count is within 10% of the max limit, or below min
 * Red    : count exceeds max
 * Gray   : count is 0 (empty)
 */

interface CharBadgeProps {
  /** Current character count */
  count: number
  /** Minimum recommended characters. Defaults to 0. */
  min?: number
  /** Maximum recommended characters */
  max: number
  /** Optional label shown before the count */
  label?: string
}

export function CharBadge({ count, min = 0, max, label }: CharBadgeProps) {
  const threshold = Math.floor(max * 0.9)

  let colorClass: string
  if (count === 0) {
    colorClass = 'bg-gray-100 text-gray-500'
  } else if (count > max) {
    colorClass = 'bg-red-100 text-red-700'
  } else if (count < min || count > threshold) {
    colorClass = 'bg-yellow-100 text-yellow-700'
  } else {
    colorClass = 'bg-green-100 text-green-700'
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label && <span>{label}</span>}
      <span>{count}</span>
      <span className="text-[10px] opacity-70">/ {max}</span>
    </span>
  )
}
