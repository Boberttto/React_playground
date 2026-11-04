import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationBadge, UserList, WarningBanner } from './Exercise'

describe('05 – NotificationBadge', () => {
  it('renders no badge (and no stray "0") when count is 0', () => {
    render(<NotificationBadge count={0} />)
    const button = screen.getByRole('button', { name: 'Notifications' })
    expect(button).not.toHaveTextContent('0')
  })

  it('shows the count and an accessible label when there are unread notifications', () => {
    render(<NotificationBadge count={5} />)
    const button = screen.getByRole('button', { name: 'Notifications (5 unread)' })
    expect(button).toHaveTextContent('5')
  })

  it('caps the badge at 99+', () => {
    render(<NotificationBadge count={150} />)
    const button = screen.getByRole('button', { name: 'Notifications (150 unread)' })
    expect(button).toHaveTextContent('99+')
    expect(button).not.toHaveTextContent('150')
  })
})

describe('05 – WarningBanner', () => {
  it('renders nothing without a message', () => {
    const { container, rerender } = render(<WarningBanner />)
    expect(container).toBeEmptyDOMElement()
    rerender(<WarningBanner message="" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders an alert with the message', () => {
    render(<WarningBanner message="Disk almost full" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Disk almost full')
  })
})

describe('05 – UserList', () => {
  it('shows a loading status', () => {
    render(<UserList state={{ status: 'loading' }} onRetry={() => {}} />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading users…')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows the error with a working Retry button', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<UserList state={{ status: 'error', error: 'Boom' }} onRetry={onRetry} />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Could not load users: Boom')
    await user.click(within(alert).getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows an empty state', () => {
    render(<UserList state={{ status: 'success', data: [] }} onRetry={() => {}} />)
    expect(screen.getByText('No users yet.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('lists the users', () => {
    render(
      <UserList
        state={{ status: 'success', data: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Alan' }] }}
        onRetry={() => {}}
      />,
    )
    const items = within(screen.getByRole('list', { name: 'Users' })).getAllByRole('listitem')
    expect(items.map((li) => li.textContent)).toEqual(['Ada', 'Alan'])
  })
})
