import { LEVELS, registry } from '../exercises/registry'
import { hrefTo } from '../router'
import { ThemeToggle } from './ThemeToggle'
import styles from './Sidebar.module.scss'

export function Sidebar({ currentPath }: { currentPath: string }) {
  return (
    <nav className={styles.sidebar} aria-label="Exercises">
      <div className={styles.header}>
        <a href={hrefTo('')} className={styles.brand}>
          ⚛ React Playground
        </a>
        <ThemeToggle />
      </div>
      {LEVELS.map((level) => (
        <section key={level} className={styles.group}>
          <h2 className={`${styles.groupTitle} ${styles[level]}`}>{level}</h2>
          <ol className={styles.list}>
            {registry
              .filter((e) => e.level === level)
              .map((e) => (
                <li key={e.id}>
                  <a
                    href={hrefTo(e.id)}
                    className={styles.link}
                    aria-current={currentPath === e.id ? 'page' : undefined}
                  >
                    <span className={styles.num}>{String(e.number).padStart(2, '0')}</span>
                    {e.title.replace(/^\d+\s*[-–.]\s*/, '')}
                  </a>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </nav>
  )
}
