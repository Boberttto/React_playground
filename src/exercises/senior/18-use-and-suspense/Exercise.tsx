// 18 – use() & Suspense. Instructions: see README.md (or the "Instructions" tab).
/* eslint-disable react/only-export-components -- the tests import these non-component exports from this module; fast refresh of an exercise file is not a concern */
import { createContext, startTransition, useState } from 'react'
import { fetchPosts, fetchUser, type Post, type User } from './api'
// TODO 5 will need: import { ErrorBoundary } from './ErrorBoundary'
import styles from './styles.module.scss'

/* ------------------------------------------------------------------ */
/* 1. A promise cache: the same id must always give the SAME promise    */
/* ------------------------------------------------------------------ */

// TODO 1: cache the promises in a Map keyed by id, so repeated calls (= re-renders)
//         return the same promise object. Bonus: evict an entry when its promise rejects.
export function getUser(id: number): Promise<User> {
  return fetchUser(id)
}

export function getPosts(userId: number): Promise<Post[]> {
  return fetchPosts(userId)
}

/* ------------------------------------------------------------------ */
/* 2. Reading promises with use()                                       */
/* ------------------------------------------------------------------ */

function UserHeader(_props: { userPromise: Promise<User> }) {
  // TODO 2: const user = use(userPromise), then render <h2>{user.name}</h2> and <p>{user.bio}</p>
  return <h2>TODO: user name</h2>
}

function PostList(_props: { postsPromise: Promise<Post[]> }) {
  // TODO 3: const posts = use(postsPromise), then render them in a <ul aria-label="Posts">
  return <p>TODO: posts</p>
}

type ProfilePageProps = {
  userPromise: Promise<User>
  postsPromise: Promise<Post[]>
  onRetry?: () => void
}

export function ProfilePage(props: ProfilePageProps) {
  // TODO 4: outer <Suspense fallback={<p>Loading profile…</p>}> around everything,
  //         inner <Suspense fallback={<p>Loading posts…</p>}> around <PostList>.
  // TODO 5: wrap it all in <ErrorBoundary> showing a role="alert" with the error message
  //         and a "Try again" button (reset), passing onReset={props.onRetry}.
  return (
    <article className={styles.profile}>
      <UserHeader userPromise={props.userPromise} />
      <h3>Posts</h3>
      <PostList postsPromise={props.postsPromise} />
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* 3. use(Context) can be called conditionally                          */
/* ------------------------------------------------------------------ */

export type Theme = 'light' | 'dark'
export const ThemeContext = createContext<Theme>('light')

export function ThemedNote({ show }: { show: boolean }) {
  if (!show) return null
  // TODO 6: read ThemeContext with use() HERE, after the early return
  //         (useContext would break the Rules of Hooks at this spot).
  return <p className={styles.note}>Theme: unknown</p>
}

/* ------------------------------------------------------------------ */

export default function ExerciseDemo() {
  const [userId, setUserId] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const [showNote, setShowNote] = useState(true)

  return (
    <ThemeContext value="dark">
      <div className={styles.stack}>
        <div className={styles.toolbar}>
          {[1, 2, 404].map((id) => (
            <button
              key={id}
              type="button"
              className="btn"
              aria-pressed={userId === id}
              // A Transition keeps the current profile on screen while the next one loads.
              onClick={() => startTransition(() => setUserId(id))}
            >
              User {id}
            </button>
          ))}
          <label className={styles.check}>
            <input type="checkbox" checked={showNote} onChange={(e) => setShowNote(e.target.checked)} /> Show theme
            note
          </label>
        </div>
        <ThemedNote show={showNote} />
        {/* Called during render: only OK because getUser/getPosts return cached promises. */}
        <ProfilePage
          key={`${userId}-${attempt}`}
          userPromise={getUser(userId)}
          postsPromise={getPosts(userId)}
          onRetry={() => setAttempt((a) => a + 1)}
        />
      </div>
    </ThemeContext>
  )
}
