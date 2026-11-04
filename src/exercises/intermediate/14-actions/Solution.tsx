// Tests import the action from this file, so it exports non-components on purpose.
// oxlint-disable react/only-export-components
import { useActionState, useId } from 'react'
import { useFormStatus } from 'react-dom'
import { ApiError, subscribeToNewsletter } from './api'
import styles from './styles.module.scss'

export type SubscribeState = {
  status: 'idle' | 'success' | 'error'
  message: string
  email: string // what to refill the field with
}

export const initialState: SubscribeState = { status: 'idle', message: '', email: '' }

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// A plain async function: no React in here, so it's easy to unit test (see the tests)
// and could later become a Server Function almost unchanged.
// useActionState passes the previous state first; we don't need it, hence the `_`.
export async function subscribeAction(_prevState: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get('email') ?? '').trim()

  // Expected failures are *returned* as state — they're part of the UI, not exceptions.
  if (!email) return { status: 'error', message: 'Email is required.', email }
  if (!EMAIL_SHAPE.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.', email }
  }

  try {
    await subscribeToNewsletter(email)
  } catch (error) {
    // Only show server messages we trust; never leak arbitrary error details to users.
    const message = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
    return { status: 'error', message, email }
  }

  // email: '' → after success the field stays empty (React also resets the form).
  return { status: 'success', message: `Thanks! ${email} is now subscribed.`, email: '' }
}

export function SubmitButton() {
  // Reads the status of the closest parent <form> — no props needed, so this button is
  // reusable in any form. (It must be rendered *inside* the form to work.)
  const { pending } = useFormStatus()
  return (
    <button className="btn-primary" type="submit" disabled={pending}>
      {pending ? 'Subscribing…' : 'Subscribe'}
    </button>
  )
}

export function NewsletterForm() {
  // state: whatever the action last returned; formAction: pass it to <form action>;
  // isPending: true while the action runs (handy outside the form, here for aria-busy).
  const [state, formAction, isPending] = useActionState(subscribeAction, initialState)
  const messageId = useId()
  const hasError = state.status === 'error'

  return (
    // `action` instead of onSubmit: React calls preventDefault, builds the FormData and
    // runs the action in a transition. noValidate: we validate in the action, like a server.
    <form className={styles.form} action={formAction} noValidate aria-busy={isPending}>
      <label className={styles.field}>
        Email
        <input
          className="input"
          name="email"
          type="email"
          autoComplete="email"
          // React resets uncontrolled fields after the action; defaultValue decides what
          // they reset *to* — the typed email after an error, '' after success.
          defaultValue={state.email}
          aria-invalid={hasError}
          aria-describedby={state.message ? messageId : undefined}
        />
      </label>
      <SubmitButton />

      {hasError && (
        <p id={messageId} role="alert" className={styles.error}>
          {state.message}
        </p>
      )}
      {state.status === 'success' && (
        // <output> = semantic "result of a user action", implicit role="status" (polite live region).
        <output id={messageId} className={styles.success}>
          {state.message}
        </output>
      )}
    </form>
  )
}

export default function SolutionDemo() {
  return (
    <section className={styles.card}>
      <h3 className={styles.title}>Join the newsletter</h3>
      <p className={styles.muted}>
        Try an empty field, <code>nope</code>, <code>ada@example.com</code> (taken), <code>x@spam.test</code>{' '}
        (blocked) or your own address.
      </p>
      <NewsletterForm />
    </section>
  )
}
