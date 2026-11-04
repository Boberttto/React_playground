import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs } from './Exercise'

function Fruits(props: { defaultValue?: string; value?: string; onValueChange?: (v: string) => void }) {
  return (
    <Tabs {...props}>
      <Tabs.List aria-label="Fruits">
        <Tabs.Tab value="apple">Apple</Tabs.Tab>
        <Tabs.Tab value="banana">Banana</Tabs.Tab>
        <Tabs.Tab value="cherry" disabled>
          Cherry
        </Tabs.Tab>
        <Tabs.Tab value="date">Date</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="apple">Apple panel</Tabs.Panel>
      <Tabs.Panel value="banana">Banana panel</Tabs.Panel>
      <Tabs.Panel value="cherry">Cherry panel</Tabs.Panel>
      <Tabs.Panel value="date">Date panel</Tabs.Panel>
    </Tabs>
  )
}

const tab = (name: string) => screen.getByRole('tab', { name })

describe('20 – Tabs (compound components)', () => {
  it('exposes tablist / tab / tabpanel roles wired together', () => {
    render(<Fruits defaultValue="apple" />)
    expect(screen.getByRole('tablist', { name: 'Fruits' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(tab('Apple')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Banana')).toHaveAttribute('aria-selected', 'false')

    // Only the active panel is exposed, and it's labelled by its tab.
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveAccessibleName('Apple')
    expect(panel).toHaveTextContent('Apple panel')
    expect(tab('Apple')).toHaveAttribute('aria-controls', panel.id)
  })

  it('keeps inactive panels mounted but hidden', () => {
    render(<Fruits defaultValue="apple" />)
    expect(screen.getByText('Banana panel')).not.toBeVisible()
  })

  it('selects a tab on click', async () => {
    const user = userEvent.setup()
    render(<Fruits defaultValue="apple" />)
    await user.click(tab('Banana'))
    expect(tab('Banana')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Banana panel')
  })

  it('uses a roving tabindex: Tab enters the selected tab, then the panel', async () => {
    const user = userEvent.setup()
    render(<Fruits defaultValue="banana" />)
    expect(tab('Banana')).toHaveAttribute('tabindex', '0')
    expect(tab('Apple')).toHaveAttribute('tabindex', '-1')
    await user.tab()
    expect(tab('Banana')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('tabpanel')).toHaveFocus()
  })

  it('moves focus and selection with arrows (wrapping, skipping disabled), Home and End', async () => {
    const user = userEvent.setup()
    render(<Fruits defaultValue="apple" />)
    await user.click(tab('Apple'))

    await user.keyboard('{ArrowRight}')
    expect(tab('Banana')).toHaveFocus()
    expect(tab('Banana')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowRight}') // skips disabled Cherry
    expect(tab('Date')).toHaveFocus()

    await user.keyboard('{ArrowRight}') // wraps to the first
    expect(tab('Apple')).toHaveFocus()

    await user.keyboard('{ArrowLeft}') // wraps to the last
    expect(tab('Date')).toHaveFocus()

    await user.keyboard('{Home}')
    expect(tab('Apple')).toHaveFocus()
    await user.keyboard('{End}')
    expect(tab('Date')).toHaveFocus()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Date panel')
  })

  it('supports controlled mode (value + onValueChange)', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(<Fruits value="apple" onValueChange={onValueChange} />)

    await user.click(tab('Banana'))
    expect(onValueChange).toHaveBeenCalledWith('banana')
    // The parent didn't update `value`, so the selection must NOT move.
    expect(tab('Apple')).toHaveAttribute('aria-selected', 'true')

    rerender(<Fruits value="date" onValueChange={onValueChange} />)
    expect(tab('Date')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Date panel')
  })

  it('throws a helpful error when a part is used outside <Tabs>', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Tabs.Tab value="x">X</Tabs.Tab>)).toThrow(/inside <Tabs>/)
  })
})
