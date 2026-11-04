import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoApp, type Todo } from './Exercise'

const todos: Todo[] = [
  { id: '1', text: 'Write tests', done: false },
  { id: '2', text: 'Ship it', done: true },
]

function todoCheckboxes() {
  return screen.queryAllByRole('checkbox').map((c) => c.closest('label')?.textContent?.trim())
}

describe('03 – TodoApp', () => {
  it('renders each todo as a labelled checkbox reflecting `done`', () => {
    render(<TodoApp initialTodos={todos} />)
    expect(screen.getByRole('checkbox', { name: 'Write tests' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Ship it' })).toBeChecked()
  })

  it('adds a trimmed todo on submit and clears the input', async () => {
    const user = userEvent.setup()
    render(<TodoApp initialTodos={[]} />)
    const input = screen.getByLabelText('New todo')

    await user.type(input, '  Buy milk  {Enter}')
    expect(screen.getByRole('checkbox', { name: 'Buy milk' })).toBeInTheDocument()
    expect(input).toHaveValue('')

    await user.type(input, 'Walk dog')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(todoCheckboxes()).toEqual(['Buy milk', 'Walk dog'])
  })

  it('ignores empty input', async () => {
    const user = userEvent.setup()
    render(<TodoApp initialTodos={[]} />)
    await user.type(screen.getByLabelText('New todo'), '   {Enter}')
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('toggles a todo', async () => {
    const user = userEvent.setup()
    render(<TodoApp initialTodos={todos} />)
    const box = screen.getByRole('checkbox', { name: 'Write tests' })
    await user.click(box)
    expect(box).toBeChecked()
  })

  it('deletes a todo', async () => {
    const user = userEvent.setup()
    render(<TodoApp initialTodos={todos} />)
    await user.click(screen.getByRole('button', { name: 'Delete Write tests' }))
    expect(todoCheckboxes()).toEqual(['Ship it'])
  })

  it('filters All / Active / Done and marks the active filter', async () => {
    const user = userEvent.setup()
    render(<TodoApp initialTodos={todos} />)
    const all = screen.getByRole('button', { name: 'All' })
    const active = screen.getByRole('button', { name: 'Active' })
    const done = screen.getByRole('button', { name: 'Done' })
    expect(all).toHaveAttribute('aria-pressed', 'true')

    await user.click(active)
    expect(active).toHaveAttribute('aria-pressed', 'true')
    expect(all).toHaveAttribute('aria-pressed', 'false')
    expect(todoCheckboxes()).toEqual(['Write tests'])

    await user.click(done)
    expect(todoCheckboxes()).toEqual(['Ship it'])

    await user.click(all)
    expect(todoCheckboxes()).toEqual(['Write tests', 'Ship it'])
  })

  it('keeps the filtered view in sync when a todo changes (derived, not stored)', async () => {
    const user = userEvent.setup()
    render(<TodoApp initialTodos={todos} />)
    await user.click(screen.getByRole('button', { name: 'Active' }))
    await user.click(screen.getByRole('checkbox', { name: 'Write tests' }))
    // It's done now, so it leaves the "Active" view immediately.
    expect(todoCheckboxes()).toEqual([])

    await user.type(screen.getByLabelText('New todo'), 'New one{Enter}')
    expect(todoCheckboxes()).toEqual(['New one'])
  })

  it('shows how many items are left', async () => {
    const user = userEvent.setup()
    render(<TodoApp initialTodos={todos} />)
    expect(screen.getByText('1 item left')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Ship it' }))
    expect(screen.getByText('2 items left')).toBeInTheDocument()
  })
})
