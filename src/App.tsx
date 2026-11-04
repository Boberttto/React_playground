import { ExerciseView } from './components/ExerciseView'
import { Home } from './components/Home'
import { Sidebar } from './components/Sidebar'
import { findExercise } from './exercises/registry'
import { useHashPath } from './router'
import styles from './App.module.scss'

export default function App() {
  const path = useHashPath()
  const exercise = findExercise(path)

  return (
    <div className={styles.layout}>
      <Sidebar currentPath={path} />
      <main className={styles.main}>
        {/* key resets the view's tab state when switching exercise */}
        {exercise ? <ExerciseView key={exercise.id} exercise={exercise} /> : <Home />}
      </main>
    </div>
  )
}
