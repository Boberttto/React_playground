import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './Exercise'

function historyValues() {
  const list = screen.getByRole('list', { name: 'History' })
  return within(list)
    .queryAllByRole('listitem')
    .map((li) => li.textContent)
}

async function setStep(user: ReturnType<typeof userEvent.setup>, value: string) {
  const input = screen.getByLabelText('Step')
  await user.clear(input)
  await user.type(input, value)
}

describe('02 – Counter', () => {
  it('starts at 0 with an empty history', () => {
    render(<Counter />)
    expect(screen.getByRole('status')).toHaveTextContent('Count: 0')
    expect(historyValues()).toEqual([])
  })

  it('increments and decrements by the step', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await setStep(user, '5')
    expect(screen.getByLabelText('Step')).toHaveValue(5)

    await user.click(screen.getByRole('button', { name: 'Increment' }))
    await user.click(screen.getByRole('button', { name: 'Increment' }))
    expect(screen.getByRole('status')).toHaveTextContent('Count: 10')

    await user.click(screen.getByRole('button', { name: 'Decrement' }))
    expect(screen.getByRole('status')).toHaveTextContent('Count: 5')
  })

  it('"Add step × 3" applies the step three times (updater functions)', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await setStep(user, '2')
    await user.click(screen.getByRole('button', { name: 'Add step × 3' }))
    expect(screen.getByRole('status')).toHaveTextContent('Count: 6')
    expect(historyValues()).toEqual(['0', '2', '4'])
  })

  it('records previous values in history', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: 'Increment' }))
    await user.click(screen.getByRole('button', { name: 'Increment' }))
    expect(historyValues()).toEqual(['0', '1'])
  })

  it('undo restores the last value and is disabled when history is empty', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    const undo = screen.getByRole('button', { name: 'Undo' })
    expect(undo).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Add step × 3' }))
    expect(screen.getByRole('status')).toHaveTextContent('Count: 3')

    await user.click(undo)
    expect(screen.getByRole('status')).toHaveTextContent('Count: 2')
    expect(historyValues()).toEqual(['0', '1'])

    await user.click(undo)
    await user.click(undo)
    expect(screen.getByRole('status')).toHaveTextContent('Count: 0')
    expect(undo).toBeDisabled()
  })

  it('reset clears count and history', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: 'Add step × 3' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('status')).toHaveTextContent('Count: 0')
    expect(historyValues()).toEqual([])
  })
})
