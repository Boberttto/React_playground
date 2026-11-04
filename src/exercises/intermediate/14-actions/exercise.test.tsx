import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetSubscribers } from './api'
import ExerciseDemo, { initialState, subscribeAction } from './Exercise'

beforeEach(() => resetSubscribers())

function formWith(email: string) {
  const data = new FormData()
  data.set('email', email)
  return data
}

describe('14 – subscribeAction (plain async function)', () => {
  it('requires an email', async () => {
    expect(await subscribeAction(initialState, formWith('   '))).toMatchObject({
      status: 'error',
      message: 'Email is required.',
    })
  })

  it('rejects malformed emails and keeps what was typed', async () => {
    expect(await subscribeAction(initialState, formWith('nope'))).toEqual({
      status: 'error',
      message: 'Please enter a valid email address.',
      email: 'nope',
    })
  })

  it('returns server errors as state', async () => {
    expect(await subscribeAction(initialState, formWith('ada@example.com'))).toEqual({
      status: 'error',
      message: 'ada@example.com is already subscribed.',
      email: 'ada@example.com',
    })
  })

  it('subscribes a new email', async () => {
    expect(await subscribeAction(initialState, formWith('grace@example.com'))).toEqual({
      status: 'success',
      message: 'Thanks! grace@example.com is now subscribed.',
      email: '',
    })
  })
})

describe('14 – NewsletterForm', () => {
  it('shows a validation error without calling the server', async () => {
    const user = userEvent.setup()
    render(<ExerciseDemo />)
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Email is required.')
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('disables the button while pending, then shows success and resets the field', async () => {
    const user = userEvent.setup()
    render(<ExerciseDemo />)
    const email = screen.getByRole('textbox', { name: 'Email' })
    await user.type(email, 'linus@example.com')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))

    // useFormStatus in the child SubmitButton sees the pending parent form.
    expect(await screen.findByRole('button', { name: 'Subscribing…' })).toBeDisabled()

    expect(await screen.findByRole('status')).toHaveTextContent('Thanks! linus@example.com is now subscribed.')
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeEnabled()
    expect(email).toHaveValue('')
  })

  it('shows server errors and keeps the typed email', async () => {
    const user = userEvent.setup()
    render(<ExerciseDemo />)
    const email = screen.getByRole('textbox', { name: 'Email' })
    await user.type(email, 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Subscribe' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('ada@example.com is already subscribed.')
    expect(email).toHaveValue('ada@example.com')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
