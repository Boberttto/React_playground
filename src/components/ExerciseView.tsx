import { Suspense, useEffect, useState } from 'react'
import type { ExerciseEntry } from '../exercises/registry'
import { ErrorBoundary } from './ErrorBoundary'
import { LevelBadge } from './LevelBadge'
import { Markdown } from './Markdown'
import styles from './ExerciseView.module.scss'

const TABS = ['instructions', 'playground', 'solution', 'solution code'] as const
type Tab = (typeof TABS)[number]

export function ExerciseView({ exercise }: { exercise: ExerciseEntry }) {
  const [tab, setTab] = useState<Tab>('instructions')
  const { Exercise, Solution } = exercise

  return (
    <article className={styles.view}>
      <header className={styles.header}>
        <LevelBadge level={exercise.level} />
        <code className={styles.path}>src/exercises/{exercise.id}/Exercise.tsx</code>
      </header>

      <div role="tablist" aria-label="Exercise sections" className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls="exercise-panel"
            className={styles.tab}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="exercise-panel" aria-labelledby={`tab-${tab}`} className={styles.panel}>
        {tab === 'instructions' && <Markdown>{exercise.readme}</Markdown>}
        {(tab === 'playground' || tab === 'solution') && (
          // `key` remounts the boundary (clearing any error) when switching tabs.
          <ErrorBoundary key={tab}>
            <Suspense fallback={<p>Loading…</p>}>
              <div className={styles.stage}>{tab === 'playground' ? <Exercise /> : <Solution />}</div>
            </Suspense>
          </ErrorBoundary>
        )}
        {tab === 'solution code' && <SolutionSource load={exercise.loadSolutionSource} />}
      </div>
    </article>
  )
}

function SolutionSource({ load }: { load: () => Promise<string> }) {
  const [source, setSource] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false // avoids a race if `load` changes before the promise resolves
    load().then((s) => {
      if (!ignore) setSource(s)
    })
    return () => {
      ignore = true
    }
  }, [load])

  if (source === null) return <p>Loading…</p>
  return (
    <details className={styles.spoiler}>
      <summary>Spoiler — try the exercise first! Click to reveal.</summary>
      <pre>
        <code>{source}</code>
      </pre>
    </details>
  )
}
