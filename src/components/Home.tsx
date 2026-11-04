import { LEVELS, registry } from '../exercises/registry'
import { hrefTo } from '../router'
import { LevelBadge } from './LevelBadge'
import styles from './Home.module.scss'

export function Home() {
  return (
    <div className={styles.home}>
      <h1>React Playground</h1>
      <p className={styles.lead}>
        {registry.length} hands-on exercises from junior to senior, built on React 19. Each one has
        instructions, a starter file you edit, tests to check yourself, and a reference solution.
      </p>

      <ol className={styles.steps}>
        <li>Pick an exercise in the sidebar and read the <strong>Instructions</strong> tab.</li>
        <li>
          Open <code>src/exercises/&lt;level&gt;/&lt;exercise&gt;/Exercise.tsx</code> in your editor and
          solve the <code>TODO</code>s. The <strong>Playground</strong> tab hot-reloads.
        </li>
        <li>
          Run <code>npm test -- &lt;exercise-folder&gt;</code> until it's green.
        </li>
        <li>Compare with the <strong>Solution</strong>, then read the linked sources.</li>
      </ol>

      <p>
        Interview prep lives in <code>docs/interview/</code> (junior, intermediate, senior and trick
        questions).
      </p>

      <div className={styles.grid}>
        {LEVELS.map((level) => {
          const first = registry.find((e) => e.level === level)
          return (
            <a key={level} className={styles.card} href={first ? hrefTo(first.id) : undefined}>
              <LevelBadge level={level} />
              <span>{registry.filter((e) => e.level === level).length} exercises</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
