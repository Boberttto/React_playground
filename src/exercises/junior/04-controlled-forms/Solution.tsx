import { useId, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react'
import styles from './styles.module.scss'

export type SignupValues = {
  name: string
  email: string
  plan: '' | 'free' | 'pro' | 'team'
  acceptTerms: boolean
}

type Field = keyof SignupValues
type Errors = Partial<Record<Field, string>>

type SignupFormProps = {
  onSubmit: (values: SignupValues) => void
}

const initialValues: SignupValues = { name: '', email: '', plan: '', acceptTerms: false }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Pure function of the values: easy to reason about, easy to unit-test,
// and called during render so errors can never be out of sync.
function validate(values: SignupValues): Errors {
  const errors: Errors = {}
  if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters'
  if (!EMAIL_RE.test(values.email)) errors.email = 'Enter a valid email address'
  if (values.plan === '') errors.plan = 'Choose a plan'
  if (!values.acceptTerms) errors.acceptTerms = 'You must accept the terms'
  return errors
}

export function SignupForm({ onSubmit }: SignupFormProps) {
  const [values, setValues] = useState(initialValues)
  // Only "has the user visited this field?" is real state; the errors are derived.
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [submittedName, setSubmittedName] = useState<string | null>(null)
  const id = useId() // prefix for unique, SSR-safe ids

  const errors = validate(values)
  const isValid = Object.keys(errors).length === 0

  // One handler for every field, keyed by the input's `name` attribute.
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = e.target
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value
    setValues((v) => ({ ...v, [target.name]: value }))
  }

  function handleBlur(e: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const name = e.target.name
    setTouched((t) => ({ ...t, [name]: true }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault() // stay in the SPA: no full-page navigation
    if (!isValid) return // defensive: Enter can submit even if the button is disabled in some setups
    onSubmit(values)
    setSubmittedName(values.name.trim())
  }

  // Returns the a11y props + error element for a field, so the JSX stays readable.
  function errorFor(field: Field) {
    const message = touched[field] ? errors[field] : undefined
    const errorId = `${id}-${field}-error`
    return {
      inputProps: {
        'aria-invalid': message ? true : undefined,
        'aria-describedby': message ? errorId : undefined,
        onBlur: handleBlur,
      },
      message: message && (
        <p id={errorId} className={styles.error}>
          {message}
        </p>
      ),
    }
  }

  if (submittedName !== null) {
    return (
      // <output> has the implicit role "status", so screen readers announce it.
      <output className={styles.success}>Welcome aboard, {submittedName}!</output>
    )
  }

  const name = errorFor('name')
  const email = errorFor('email')
  const plan = errorFor('plan')
  const terms = errorFor('acceptTerms')

  return (
    // noValidate: we render our own messages instead of the browser's bubbles.
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor={`${id}-name`}>Name</label>
        <input
          id={`${id}-name`}
          className="input"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          {...name.inputProps}
        />
        {name.message}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-email`}>Email</label>
        <input
          id={`${id}-email`}
          className="input"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          {...email.inputProps}
        />
        {email.message}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-plan`}>Plan</label>
        <select
          id={`${id}-plan`}
          className="input"
          name="plan"
          value={values.plan}
          onChange={handleChange}
          {...plan.inputProps}
        >
          <option value="">Select a plan…</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </select>
        {plan.message}
      </div>

      <div className={styles.field}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="acceptTerms"
            checked={values.acceptTerms}
            onChange={handleChange}
            {...terms.inputProps}
          />{' '}
          I accept the terms
        </label>
        {terms.message}
      </div>

      <button type="submit" className="btn-primary" disabled={!isValid}>
        Create account
      </button>
    </form>
  )
}

export default function SolutionDemo() {
  return <SignupForm onSubmit={(values) => console.log('submitted', values)} />
}
