import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Modal } from './Exercise'

function Harness({ onClose = () => {}, onWrapperClick = () => {} }: { onClose?: () => void; onWrapperClick?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    // role="presentation": the wrapper only observes bubbling clicks, it is not a control.
    <div data-testid="app" role="presentation" onClick={onWrapperClick}>
      <button onClick={() => setOpen(true)}>Open dialog</button>
      <Modal
        open={open}
        title="Settings"
        onClose={() => {
          onClose()
          setOpen(false)
        }}
      >
        <label>
          Name <input />
        </label>
        <button>Save</button>
      </Modal>
    </div>
  )
}

async function openDialog() {
  const user = userEvent.setup()
  const utils = render(<Harness />)
  await user.click(screen.getByRole('button', { name: 'Open dialog' }))
  return { user, ...utils }
}

describe('21 – Modal', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('renders nothing while closed', () => {
    render(<Harness />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('is an accessible modal dialog named by its title', async () => {
    await openDialog()
    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('is portaled to document.body, outside the app tree', async () => {
    await openDialog()
    const dialog = screen.getByRole('dialog')
    expect(screen.getByTestId('app')).not.toContainElement(dialog)
    expect(document.body).toContainElement(dialog)
  })

  it('moves focus into the dialog when it opens', async () => {
    await openDialog()
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus()
  })

  it('traps focus with Tab and Shift+Tab', async () => {
    const { user } = await openDialog()
    const input = screen.getByRole('textbox', { name: 'Name' })
    const save = screen.getByRole('button', { name: 'Save' })
    const close = screen.getByRole('button', { name: 'Close' })

    await user.tab()
    expect(save).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab() // wraps to the first element
    expect(input).toHaveFocus()
    await user.tab({ shift: true }) // wraps to the last element
    expect(close).toHaveFocus()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const { user } = await openDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open dialog' })).not.toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open dialog' })).toHaveFocus()
  })

  it('closes on a backdrop click but not on a click inside', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Open dialog' }))

    await user.click(screen.getByRole('heading', { name: 'Settings' }))
    expect(onClose).not.toHaveBeenCalled()

    // The backdrop is the dialog's parent element.
    await user.click(screen.getByRole('dialog').parentElement!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('locks body scroll while open and restores it afterwards', async () => {
    const { user } = await openDialog()
    expect(document.body.style.overflow).toBe('hidden')
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(document.body.style.overflow).toBe('')
  })

  it('bubbles React events through the portal to React ancestors', async () => {
    const user = userEvent.setup()
    const onWrapperClick = vi.fn()
    render(<Harness onWrapperClick={onWrapperClick} />)
    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    onWrapperClick.mockClear()
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onWrapperClick).toHaveBeenCalledTimes(1)
  })
})
