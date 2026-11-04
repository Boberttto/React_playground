import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from './Exercise'

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Ada')
  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.selectOptions(screen.getByLabelText('Plan'), 'pro')
  await user.click(screen.getByRole('checkbox', { name: 'I accept the terms' }))
}

describe('04 – SignupForm', () => {
  it('has controlled, labelled fields', async () => {
    const user = userEvent.setup()
    render(<SignupForm onSubmit={() => {}} />)
    await fillValidForm(user)
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')
    expect(screen.getByLabelText('Plan')).toHaveValue('pro')
    expect(screen.getByRole('checkbox', { name: 'I accept the terms' })).toBeChecked()
  })

  it('disables submit until the form is valid', async () => {
    const user = userEvent.setup()
    render(<SignupForm onSubmit={() => {}} />)
    const submit = screen.getByRole('button', { name: 'Create account' })
    expect(submit).toBeDisabled()

    await fillValidForm(user)
    expect(submit).toBeEnabled()

    await user.clear(screen.getByLabelText('Email'))
    expect(submit).toBeDisabled()
  })

  it('does not show errors before a field is touched', () => {
    render(<SignupForm onSubmit={() => {}} />)
    expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
  })

  it('shows an accessible error after leaving an invalid field', async () => {
    const user = userEvent.setup()
    render(<SignupForm onSubmit={() => {}} />)
    const email = screen.getByLabelText('Email')
    await user.type(email, 'not-an-email')
    await user.tab()

    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription('Enter a valid email address')

    await user.clear(email)
    await user.type(email, 'ada@example.com')
    expect(email).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument()
  })

  it('validates name length, plan and terms', async () => {
    const user = userEvent.setup()
    render(<SignupForm onSubmit={() => {}} />)
    await user.type(screen.getByLabelText('Name'), ' A ')
    await user.tab()
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription(
      'Name must be at least 2 characters',
    )

    await user.click(screen.getByLabelText('Plan'))
    await user.tab()
    expect(screen.getByLabelText('Plan')).toHaveAccessibleDescription('Choose a plan')

    const terms = screen.getByRole('checkbox', { name: 'I accept the terms' })
    await user.click(terms)
    await user.click(terms)
    await user.tab()
    expect(terms).toHaveAccessibleDescription('You must accept the terms')
  })

  it('submits the values without reloading and shows a welcome message', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SignupForm onSubmit={onSubmit} />)
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      plan: 'pro',
      acceptTerms: true,
    })
    expect(screen.getByRole('status')).toHaveTextContent('Welcome aboard, Ada!')
  })

  it('prevents the default form submission', async () => {
    const user = userEvent.setup()
    render(<SignupForm onSubmit={() => {}} />)
    await fillValidForm(user)
    const form = screen.getByRole('button', { name: 'Create account' }).closest('form')!
    const event = createEvent.submit(form)
    fireEvent(form, event)
    expect(event.defaultPrevented).toBe(true)
  })
})
