// 04 – Controlled Forms. Instructions: see README.md (or the "Instructions" tab).
import { useState, type FormEvent } from 'react'
import styles from './styles.module.scss'

export type SignupValues = {
  name: string
  email: string
  plan: '' | 'free' | 'pro' | 'team'
  acceptTerms: boolean
}

type SignupFormProps = {
  onSubmit: (values: SignupValues) => void
}

const initialValues: SignupValues = { name: '', email: '', plan: '', acceptTerms: false }

export function SignupForm({ onSubmit }: SignupFormProps) {
  const [values, setValues] = useState(initialValues)
  // TODO 2: const errors = validate(values)   (derived — not state!)
  // TODO 3: `touched` state, updated on blur
  // TODO 6: `submitted` state to show the welcome message

  function handleSubmit(_e: FormEvent<HTMLFormElement>) {
    // TODO 6: the page reloads in a real browser — prevent it, then show the message
    onSubmit(values)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="signup-name">Name</label>
        <input
          id="signup-name"
          className="input"
          name="name"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
        />
        {/* TODO 3–4: error message + aria-invalid + aria-describedby */}
      </div>

      <div className={styles.field}>
        <label htmlFor="signup-email">Email</label>
        {/* TODO 1: controlled */}
        <input id="signup-email" className="input" name="email" type="email" />
      </div>

      <div className={styles.field}>
        <label htmlFor="signup-plan">Plan</label>
        {/* TODO 1: controlled */}
        <select id="signup-plan" className="input" name="plan">
          <option value="">Select a plan…</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.checkbox}>
          {/* TODO 1: controlled (checked, not value) */}
          <input type="checkbox" name="acceptTerms" /> I accept the terms
        </label>
      </div>

      {/* TODO 5: disabled while the form is invalid */}
      <button type="submit" className="btn-primary">
        Create account
      </button>
    </form>
  )
}

export default function ExerciseDemo() {
  return <SignupForm onSubmit={(values) => console.log('submitted', values)} />
}
