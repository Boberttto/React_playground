// Pretend this is a big charting library: we only want to download it when it's shown.
// It lives in its own file so `import('./HeavyChart')` can become a separate chunk.
import { useId } from 'react'
import styles from './styles.module.scss'

const SALES = [
  { month: 'Jan', value: 42 },
  { month: 'Feb', value: 58 },
  { month: 'Mar', value: 35 },
  { month: 'Apr', value: 71 },
  { month: 'May', value: 64 },
  { month: 'Jun', value: 88 },
]

export default function HeavyChart() {
  const max = Math.max(...SALES.map((s) => s.value))
  const barWidth = 40
  const gap = 12
  const height = 120
  const captionId = useId()

  return (
    // The caption names the figure for assistive tech; the SVG itself is decorative.
    <figure className={styles.chart} aria-labelledby={captionId}>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${SALES.length * (barWidth + gap)} ${height + 20}`}
      >
        {SALES.map((s, i) => {
          const h = (s.value / max) * height
          const x = i * (barWidth + gap)
          return (
            <g key={s.month}>
              <rect x={x} y={height - h} width={barWidth} height={h} rx={4} className={styles.bar} />
              <text x={x + barWidth / 2} y={height + 15} textAnchor="middle" className={styles.label}>
                {s.month}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption id={captionId}>Monthly sales chart</figcaption>
    </figure>
  )
}
