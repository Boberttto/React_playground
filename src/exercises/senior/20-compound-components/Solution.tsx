// 20 – Compound components (solution).
/* eslint-disable react/only-export-components -- the tests import these non-component exports from this module; fast refresh of an exercise file is not a concern */
import { createContext, use, useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import styles from './styles.module.scss'

// Compound components share IMPLICIT state through context. The user composes the markup
// (order, wrappers, extra elements) and the components still coordinate. Compare with a
// "config" API like <Tabs items={[{ label, content }]} />, which is rigid as soon as one tab
// needs an icon, a badge or a tooltip.
type TabsContextValue = {
  value: string
  select: (value: string) => void
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(component: string) {
  const ctx = use(TabsContext)
  // Fail loudly and early: a Tab outside Tabs is a programming error, not a state to render.
  if (!ctx) throw new Error(`<Tabs.${component}> must be rendered inside <Tabs>`)
  return ctx
}

// Ids must be valid and unique per Tabs instance → useId (stable across server and client).
const tabId = (baseId: string, value: string) => `${baseId}-tab-${value}`
const panelId = (baseId: string, value: string) => `${baseId}-panel-${value}`

type TabsProps = {
  children: ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

function TabsRoot({ children, defaultValue = '', value: controlledValue, onValueChange }: TabsProps) {
  // Controlled vs uncontrolled, like <input value> vs <input defaultValue>:
  // when `value` is provided, the parent is the single source of truth and our internal
  // state is ignored. We ALWAYS report changes via onValueChange, in both modes.
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const baseId = useId()

  function select(next: string) {
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
  }

  // (No useMemo for the context value: the React Compiler memoizes this object.)
  return (
    <TabsContext value={{ value, select, baseId }}>
      <div className={styles.tabs}>{children}</div>
    </TabsContext>
  )
}

type TabListProps = { children: ReactNode; 'aria-label'?: string; 'aria-labelledby'?: string }

function TabList({ children, ...aria }: TabListProps) {
  // The tablist needs an accessible name (aria-label or aria-labelledby), forwarded from props.
  return (
    <div role="tablist" className={styles.list} {...aria}>
      {children}
    </div>
  )
}

type TabProps = { value: string; children: ReactNode; disabled?: boolean }

function Tab({ value, children, disabled }: TabProps) {
  const { value: selectedValue, select, baseId } = useTabsContext('Tab')
  const selected = selectedValue === value

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    // Read siblings from the DOM rather than registering tabs in context: DOM order IS visual
    // order, even if the user wraps tabs in extra elements or renders them conditionally.
    const list = e.currentTarget.closest('[role="tablist"]')
    if (!list) return
    const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'))
    const index = tabs.indexOf(e.currentTarget)
    const last = tabs.length - 1
    const keyToIndex: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1, // wraps
      ArrowLeft: index === 0 ? last : index - 1, // wraps
      Home: 0,
      End: last,
    }
    const targetIndex = keyToIndex[e.key]
    if (targetIndex === undefined) return
    e.preventDefault() // Home/End would otherwise scroll the page
    const target = tabs[targetIndex]
    target.focus()
    // "Automatic activation": focusing a tab selects it. The APG recommends this when panels
    // render instantly. Use manual activation (Enter/Space) if showing a panel is slow.
    select(target.dataset.value!)
  }

  return (
    <button
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      aria-selected={selected}
      aria-controls={panelId(baseId, value)}
      // Roving tabindex: only the selected tab is in the Tab sequence. Tab moves focus from the
      // tablist straight into the panel, and arrows move between tabs.
      tabIndex={selected ? 0 : -1}
      data-value={value}
      disabled={disabled}
      className={selected ? `${styles.tab} ${styles.selected}` : styles.tab}
      onClick={() => select(value)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  )
}

type TabPanelProps = { value: string; children: ReactNode }

function TabPanel({ value, children }: TabPanelProps) {
  const { value: selectedValue, baseId } = useTabsContext('Panel')
  const selected = selectedValue === value
  // Every panel stays mounted (so inputs keep their state) and `hidden` removes the inactive
  // ones from layout AND the accessibility tree. tabIndex={0} makes the panel itself
  // focusable, which the APG recommends when it has no focusable content of its own.
  return (
    <div
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={tabId(baseId, value)}
      hidden={!selected}
      tabIndex={0}
      className={styles.panel}
    >
      {children}
    </div>
  )
}

export const Tabs = Object.assign(TabsRoot, { List: TabList, Tab, Panel: TabPanel })

export default function SolutionDemo() {
  const [plan, setPlan] = useState('monthly')
  return (
    <div className={styles.stack}>
      <h3>Uncontrolled</h3>
      <Tabs defaultValue="react">
        <Tabs.List aria-label="Libraries">
          <Tabs.Tab value="react">React</Tabs.Tab>
          <Tabs.Tab value="vue">Vue</Tabs.Tab>
          <Tabs.Tab value="angular" disabled>
            Angular
          </Tabs.Tab>
          <Tabs.Tab value="svelte">Svelte</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="react">A library for web and native user interfaces.</Tabs.Panel>
        <Tabs.Panel value="vue">The progressive JavaScript framework.</Tabs.Panel>
        <Tabs.Panel value="angular">The web development framework for building the future.</Tabs.Panel>
        <Tabs.Panel value="svelte">
          <label>
            Notes (type, switch tabs, come back) <input className="input" />
          </label>
        </Tabs.Panel>
      </Tabs>

      <h3>Controlled (parent owns the value: {plan})</h3>
      <Tabs value={plan} onValueChange={setPlan}>
        <Tabs.List aria-label="Billing">
          <Tabs.Tab value="monthly">Monthly</Tabs.Tab>
          <Tabs.Tab value="yearly">Yearly</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="monthly">€10 / month</Tabs.Panel>
        <Tabs.Panel value="yearly">€100 / year (2 months free)</Tabs.Panel>
      </Tabs>
      <button type="button" className="btn" onClick={() => setPlan('yearly')}>
        Pick yearly from outside
      </button>
    </div>
  )
}
