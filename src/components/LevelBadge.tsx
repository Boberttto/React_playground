import type { Level } from '../exercises/registry'
import styles from './LevelBadge.module.scss'

export function LevelBadge({ level }: { level: Level }) {
  return <span className={`${styles.badge} ${styles[level]}`}>{level}</span>
}
