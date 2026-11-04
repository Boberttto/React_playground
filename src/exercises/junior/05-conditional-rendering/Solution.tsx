import { useState } from 'react'
import styles from './styles.module.scss'

export type User = { id: number; name: string }

// A discriminated union: `status` tells TypeScript which other fields exist,
// and "loading AND error at the same time" simply can't be expressed.
export type UsersState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: User[] }

type NotificationBadgeProps = { count: number }

export function NotificationBadge({ count }: NotificationBadgeProps) {
  // Compute display values up-front: plain variables beat nested ternaries in JSX.
  const hasUnread = count > 0
  const label = count > 99 ? '99+' : String(count)

  return (
    <button
      className="btn"
      // Screen readers get a full sentence instead of "Notifications 5".
      aria-label={hasUnread ? `Notifications (${count} unread)` : 'Notifications'}
    >
      🔔 Notifications
      {/* `hasUnread` is a boolean, so `false` renders nothing — `count && …` would render "0". */}
      {hasUnread && (
        <span className={styles.badge} aria-hidden="true">
          {label}
        </span>
      )}
    </button>
  )
}

type WarningBannerProps = { message?: string }

export function WarningBanner({ message }: WarningBannerProps) {
  // Returning null renders nothing. Hooks above this line would still run.
  if (!message) return null

  return (
    <div role="alert" className={styles.warning}>
      {message}
    </div>
  )
}

type UserListProps = {
  state: UsersState
  onRetry: () => void
}

export function UserList({ state, onRetry }: UserListProps) {
  // Early returns: each state is handled once, and the happy path stays un-nested.
  if (state.status === 'loading') {
    // <output> has the implicit role "status" (polite live region).
    return <output>Loading users…</output>
  }

  if (state.status === 'error') {
    // TypeScript has narrowed `state` here, so `state.error` is available.
    return (
      <div role="alert" className={styles.error}>
        <p>Could not load users: {state.error}</p>
        <button className="btn" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  // Only 'success' is left.
  if (state.data.length === 0) {
    return <p className={styles.empty}>No users yet.</p>
  }

  return (
    <ul aria-label="Users" className={styles.list}>
      {state.data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}

const demoUsers: User[] = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
]

const demoStates: Record<string, UsersState> = {
  Loading: { status: 'loading' },
  Error: { status: 'error', error: 'Network request failed' },
  Empty: { status: 'success', data: [] },
  Data: { status: 'success', data: demoUsers },
}

export default function SolutionDemo() {
  const [count, setCount] = useState(0)
  const [stateName, setStateName] = useState('Data')
  const usersState = demoStates[stateName]

  return (
    <div className={styles.demo}>
      <section className={styles.panel}>
        <div className={styles.row}>
          <NotificationBadge count={count} />
          <button className="btn" onClick={() => setCount((c) => Math.max(0, c - 1))}>
            −1
          </button>
          <button className="btn" onClick={() => setCount((c) => c + 1)}>
            +1
          </button>
          <button className="btn" onClick={() => setCount(150)}>
            150
          </button>
        </div>
        <WarningBanner message={count > 10 ? 'You have a lot of unread notifications.' : undefined} />
      </section>

      <section className={styles.panel}>
        <fieldset className={styles.row}>
          <legend className="visually-hidden">Simulate state</legend>
          {Object.keys(demoStates).map((name) => (
            <button
              key={name}
              className="btn"
              aria-pressed={stateName === name}
              onClick={() => setStateName(name)}
            >
              {name}
            </button>
          ))}
        </fieldset>
        <UserList state={usersState} onRetry={() => setStateName('Loading')} />
      </section>
    </div>
  )
}
