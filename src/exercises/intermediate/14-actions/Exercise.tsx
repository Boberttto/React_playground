// 14 – Actions. Instructions: see README.md (or the "Instructions" tab).
// Tests import the action from this file, so it exports non-components on purpose.
// oxlint-disable react/only-export-components
import styles from './styles.module.scss'

export type SubscribeState = {
  status: 'idle' | 'success' | 'error'
  message: string
  email: string
}

export const initialState: SubscribeState = { status: 'idle', message: '', email: '' }

// TODO 1: validate, call subscribeToNewsletter (./api), map ApiError / unknown errors to state
export async function subscribeAction(_prevState: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const email = String(formData.get('email') ?? '').trim()
  return { status: 'idle', message: '', email }
}

// TODO 4: useFormStatus() → disabled + "Subscribing…" while the parent form is pending
export function SubmitButton() {
  return (
    <button className="btn-primary" type="submit">
      Subscribe
    </button>
  )
}

// TODO 2: useActionState(subscribeAction, initialState) + <form action={…}>
// TODO 3: defaultValue={state.email}, role="alert" error / <output> success, aria-invalid
export function NewsletterForm() {
  return (
    <form className={styles.form} noValidate onSubmit={(e) => e.preventDefault()}>
      <label className={styles.field}>
        Email
        <input className="input" name="email" type="email" autoComplete="email" />
      </label>
      <SubmitButton />
    </form>
  )
}

export default function ExerciseDemo() {
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
