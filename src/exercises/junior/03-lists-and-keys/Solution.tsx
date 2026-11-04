import { useId, useState, type FormEvent } from 'react'
import styles from './styles.module.scss'

export type Todo = {
  id: string
  text: string
  done: boolean
}

type Filter = 'all' | 'active' | 'done'

type TodoAppProps = {
  initialTodos?: Todo[]
}

const sampleTodos: Todo[] = [
  { id: 'a', text: 'Learn JSX', done: true },
  { id: 'b', text: 'Learn useState', done: false },
  { id: 'c', text: 'Learn keys', done: false },
]

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

export function TodoApp({ initialTodos = sampleTodos }: TodoAppProps) {
  // `initialTodos` only seeds the state: later prop changes are ignored on purpose.
  const [todos, setTodos] = useState(initialTodos)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const inputId = useId() // unique even if the component is rendered twice on a page

  // Derived during render: always in sync with `todos` and `filter`, nothing to update.
  const visibleTodos = todos.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done,
  )
  const activeCount = todos.filter((t) => !t.done).length

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault() // otherwise the browser does a full-page form submission
    const text = draft.trim()
    if (!text) return
    // The id is created ONCE, here, so it stays stable for the todo's whole life.
    setTodos((ts) => [...ts, { id: crypto.randomUUID(), text, done: false }])
    setDraft('')
  }

  function toggle(id: string) {
    setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function remove(id: string) {
    setTodos((ts) => ts.filter((t) => t.id !== id))
  }

  return (
    <div className={styles.app}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor={inputId}>
          New todo
        </label>
        <input
          id={inputId}
          className="input"
          placeholder="What needs doing?"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Add
        </button>
      </form>

      {/* <fieldset> groups related controls (implicit role "group"), named by its legend. */}
      <fieldset className={styles.filters}>
        <legend className="visually-hidden">Filter todos</legend>
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            className="btn"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </fieldset>

      <ul className={styles.list}>
        {/* Stable key from the data: React keeps each <li> (and its checkbox) bound
            to the same todo even when others are removed or filtered out. */}
        {visibleTodos.map((todo) => (
          <li key={todo.id} className={styles.item}>
            <label className={todo.done ? styles.done : undefined}>
              <input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id)} />{' '}
              {todo.text}
            </label>
            <button
              type="button"
              className="btn"
              aria-label={`Delete ${todo.text}`}
              onClick={() => remove(todo.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <p className={styles.footer}>
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </p>
    </div>
  )
}

export default function SolutionDemo() {
  return <TodoApp />
}
