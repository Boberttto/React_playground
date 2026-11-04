// 17 – useOptimistic. Instructions: see README.md (or the "Instructions" tab).
import { startTransition, useState } from 'react'
import { sendMessage, toggleLike, type Message } from './api'
import styles from './styles.module.scss'

/* ------------------------------------------------------------------ */
/* Part A — LikeButton                                                 */
/* ------------------------------------------------------------------ */

type LikeState = { liked: boolean; count: number }

type LikeButtonProps = {
  initialLiked?: boolean
  initialCount?: number
  saveLike?: (liked: boolean) => Promise<boolean>
}

export function LikeButton({ initialLiked = false, initialCount = 0, saveLike = toggleLike }: LikeButtonProps) {
  const [like, setLike] = useState<LikeState>({ liked: initialLiked, count: initialCount })
  const [error, setError] = useState<string | null>(null)
  // TODO 1: derive an optimistic copy of `like` with useOptimistic(like)

  function handleClick() {
    const next: LikeState = { liked: !like.liked, count: like.count + (like.liked ? -1 : 1) }
    setError(null)
    startTransition(async () => {
      // TODO 2: show `next` optimistically, right now
      try {
        await saveLike(next.liked)
        // TODO 3: the confirmed update after `await` must be wrapped in startTransition again
        setLike(next)
      } catch {
        // TODO 4: show "Could not save your like." — the optimistic value rolls back on its own
      }
    })
  }

  // TODO 5: render the OPTIMISTIC value, not `like`
  return (
    <div className={styles.like}>
      <button type="button" className="btn" aria-pressed={like.liked} onClick={handleClick}>
        <span aria-hidden="true">{like.liked ? '♥' : '♡'}</span> Like · {like.count}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Part B — MessageThread                                              */
/* ------------------------------------------------------------------ */

type ThreadProps = {
  initialMessages?: Message[]
  send?: (text: string) => Promise<Message>
}

export function MessageThread({ initialMessages = [], send = sendMessage }: ThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [error, setError] = useState<string | null>(null)
  // TODO 6: useOptimistic(messages, reducer) → append { id, text, sending: true }

  // A form *action*: React calls it inside a Transition with the form's FormData,
  // and resets the (uncontrolled) form once it completes.
  async function sendAction(formData: FormData) {
    const text = String(formData.get('message') ?? '').trim()
    if (!text) return
    setError(null)
    // TODO 7: add the optimistic message
    try {
      const saved = await send(text)
      setMessages((prev) => [...prev, saved]) // TODO 8: wrap in startTransition
    } catch {
      // TODO 9: show an error alert — the optimistic message disappears automatically
    }
  }

  return (
    <section className={styles.thread} aria-label="Messages">
      <ul className={styles.messages}>
        {messages.map((m) => (
          <li key={m.id} className={styles.message}>
            <span>{m.text}</span>
          </li>
        ))}
      </ul>
      {error && <p role="alert">{error}</p>}
      <form action={sendAction} className={styles.form}>
        <label className={styles.field}>
          Message
          <input className="input" name="message" autoComplete="off" />
        </label>
        <button type="submit" className="btn-primary">
          Send
        </button>
      </form>
    </section>
  )
}

export default function ExerciseDemo() {
  return (
    <div className={styles.stack}>
      <LikeButton initialCount={41} />
      <MessageThread initialMessages={[{ id: 'seed', text: 'Welcome! Type "fail" to simulate an error.' }]} />
    </div>
  )
}
