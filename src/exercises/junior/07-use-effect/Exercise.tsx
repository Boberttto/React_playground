// 07 – useEffect. Instructions: see README.md (or the "Instructions" tab).
import { useEffect, useState } from 'react'
import styles from './styles.module.scss'

export type User = {
  id: number
  name: string
  email: string
  website?: string
  company?: { name: string }
}

const API_URL = 'https://jsonplaceholder.typicode.com/users'

type UserProfileProps = { userId: number }

export function UserProfile({ userId }: UserProfileProps) {
  // TODO 1: model loading / error / success with a discriminated union instead
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // TODO 2: show "loading" again when userId changes (see README for two ways)
    // TODO 3: handle HTTP errors (res.ok) and network errors
    // TODO 4: create an AbortController, pass its signal to fetch,
    //         abort in the cleanup, and never set state from a stale request
    fetch(`${API_URL}/${userId}`)
      .then((res) => res.json())
      .then((data: User) => setUser(data))
  }, [userId])

  // TODO 1: render <output>Loading user…</output> and <p role="alert">Could not load user (…)</p>
  if (!user) return null

  return (
    <article className={styles.profile}>
      <h2>{user.name}</h2>
      <dl>
        <dt>Email</dt>
        <dd>{user.email}</dd>
      </dl>
    </article>
  )
}

export default function ExerciseDemo() {
  const [userId, setUserId] = useState(1)

  return (
    <div className={styles.demo}>
      <div className={styles.controls}>
        <button className="btn" onClick={() => setUserId((id) => Math.max(1, id - 1))}>
          ← Previous
        </button>
        <span className={styles.userId}>User #{userId}</span>
        <button className="btn" onClick={() => setUserId((id) => Math.min(10, id + 1))}>
          Next →
        </button>
        <button className="btn" onClick={() => setUserId(404)}>
          Missing user
        </button>
      </div>
      <UserProfile userId={userId} />
    </div>
  )
}
