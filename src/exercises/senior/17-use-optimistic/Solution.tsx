// 17 – useOptimistic (solution).
import { startTransition, useOptimistic, useState } from 'react'
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
  // `optimisticLike` === `like` when no Action is running. While an Action is pending it
  // shows whatever we set with `setOptimisticLike`. When the Action ends it snaps back to
  // `like`, which by then holds the confirmed value… or the old one if the request failed.
  // Rollback is automatic, so there's no "previous value" to store and restore.
  const [optimisticLike, setOptimisticLike] = useOptimistic(like)

  function handleClick() {
    const next: LikeState = { liked: !like.liked, count: like.count + (like.liked ? -1 : 1) }
    setError(null)
    // Optimistic updates must happen inside an Action (a Transition). An async function passed
    // to startTransition IS an Action, and `isPending`-style state lasts until it settles.
    startTransition(async () => {
      setOptimisticLike(next) // rendered immediately, even though we're in a Transition
      try {
        await saveLike(next.liked)
        // After an `await`, React (today) loses track of the surrounding Transition, so the
        // update must be wrapped again. Otherwise it's urgent, and could commit before the
        // Action finishes, causing a flicker between the optimistic and the real value.
        startTransition(() => setLike(next))
      } catch {
        setError('Could not save your like.')
      }
    })
  }

  return (
    <div className={styles.like}>
      <button type="button" className="btn" aria-pressed={optimisticLike.liked} onClick={handleClick}>
        <span aria-hidden="true">{optimisticLike.liked ? '♥' : '♡'}</span> Like · {optimisticLike.count}
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

type ShownMessage = Message & { sending?: boolean }

export function MessageThread({ initialMessages = [], send = sendMessage }: ThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [error, setError] = useState<string | null>(null)

  // The reducer form: (currentState, optimisticValue) => optimisticState.
  // React RE-RUNS it on top of the latest `messages` whenever they change during the Action,
  // so a message that arrives from elsewhere meanwhile isn't lost.
  const [optimisticMessages, addOptimisticMessage] = useOptimistic<ShownMessage[], string>(
    messages,
    (current: ShownMessage[], text: string): ShownMessage[] => [
      ...current,
      { id: `optimistic-${current.length}`, text, sending: true },
    ],
  )

  // `<form action={fn}>` runs fn inside a Transition, so we're already in an Action here.
  async function sendAction(formData: FormData) {
    const text = String(formData.get('message') ?? '').trim()
    if (!text) return
    setError(null)
    addOptimisticMessage(text)
    try {
      const saved = await send(text)
      startTransition(() => setMessages((prev) => [...prev, saved]))
    } catch (err) {
      // No manual rollback: when this Action settles, `optimisticMessages` goes back to
      // `messages`, which never received the failed message.
      setError(err instanceof Error ? err.message : 'Could not send the message.')
    }
  }

  return (
    <section className={styles.thread} aria-label="Messages">
      <ul className={styles.messages}>
        {optimisticMessages.map((m) => (
          <li key={m.id} className={m.sending ? `${styles.message} ${styles.sending}` : styles.message}>
            <span>{m.text}</span>
            {m.sending && <small className={styles.badge}>Sending…</small>}
          </li>
        ))}
      </ul>
      {error && <p role="alert">{error}</p>}
      {/* Uncontrolled input + form action: React resets the form after the Action. */}
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

export default function SolutionDemo() {
  return (
    <div className={styles.stack}>
      <LikeButton initialCount={41} />
      <MessageThread initialMessages={[{ id: 'seed', text: 'Welcome! Type "fail" to simulate an error.' }]} />
    </div>
  )
}
