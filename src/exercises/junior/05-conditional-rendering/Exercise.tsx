// 05 – Conditional Rendering. Instructions: see README.md (or the "Instructions" tab).
import { useState } from 'react'
import styles from './styles.module.scss'

export type User = { id: number; name: string }

// A discriminated union: `status` tells TypeScript which other fields exist.
export type UsersState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: User[] }

type NotificationBadgeProps = { count: number }

export function NotificationBadge({ count }: NotificationBadgeProps) {
  // TODO 1: this renders a "0" when count is 0. Fix it, cap at "99+", add an aria-label.
  return (
    <button className="btn">
      🔔 Notifications
      {count && <span className={styles.badge}>{count}</span>}
    </button>
  )
}

type WarningBannerProps = { message?: string }

export function WarningBanner({ message }: WarningBannerProps) {
  // TODO 2: render nothing at all when there's no message
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

export function UserList({ state }: UserListProps) {
  // TODO 3: early returns for loading, error (with a Retry button calling onRetry) and empty
  return (
    <ul aria-label="Users" className={styles.list}>
      {state.status === 'success' && state.data.map((user) => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}

const demoUsers: User[] = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
]

export default function ExerciseDemo() {
  const [count, setCount] = useState(0)
  // TODO 4: buttons to switch between loading / error / empty / data
  const usersState: UsersState = { status: 'success', data: demoUsers }

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
        <UserList state={usersState} onRetry={() => {}} />
      </section>
    </div>
  )
}
