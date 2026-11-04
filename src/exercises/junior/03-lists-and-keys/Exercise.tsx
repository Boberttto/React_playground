// 03 – Lists & Keys. Instructions: see README.md (or the "Instructions" tab).
import { useState } from 'react'
import styles from './styles.module.scss'

export type Todo = {
  id: string
  text: string
  done: boolean
}

type TodoAppProps = {
  initialTodos?: Todo[]
}

const sampleTodos: Todo[] = [
  { id: 'a', text: 'Learn JSX', done: true },
  { id: 'b', text: 'Learn useState', done: false },
  { id: 'c', text: 'Learn keys', done: false },
]

export function TodoApp({ initialTodos = sampleTodos }: TodoAppProps) {
  const [todos] = useState(initialTodos)
  // TODO 2: controlled "New todo" input + add on submit
  // TODO 5: `filter` state ('all' | 'active' | 'done')
  // TODO 6: derive `visibleTodos` and the "N items left" count here (no extra state!)

  return (
    <div className={styles.app}>
      {/* TODO 2: replace this handler with one that adds the todo (keep preventDefault!) */}
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <label className="visually-hidden" htmlFor="new-todo">
          New todo
        </label>
        <input id="new-todo" className="input" placeholder="What needs doing?" />
        <button type="submit" className="btn-primary">
          Add
        </button>
      </form>

      {/* TODO 5: All / Active / Done buttons with aria-pressed */}

      <ul className={styles.list}>
        {/* TODO 1: index keys break when items are removed — use a stable key */}
        {todos.map((todo, index) => (
          <li key={index} className={styles.item}>
            {/* TODO 3: checkbox labelled by the text   TODO 4: Delete button */}
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ExerciseDemo() {
  return <TodoApp />
}
