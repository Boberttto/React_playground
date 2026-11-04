// 20 – Compound components. Instructions: see README.md (or the "Instructions" tab).
/* eslint-disable react/only-export-components -- the tests import these non-component exports from this module; fast refresh of an exercise file is not a concern */
import { createContext, use, useState, type ReactNode } from 'react'
import styles from './styles.module.scss'

type TabsContextValue = {
  value: string
  select: (value: string) => void
  // TODO 3: add a `baseId` (from useId) so Tab and Panel can reference each other
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(_component: string) {
  const ctx = use(TabsContext)
  // TODO 7: throw a helpful error when used outside <Tabs>:
  //         `<Tabs.${component}> must be rendered inside <Tabs>`
  return ctx as TabsContextValue
}

type TabsProps = {
  children: ReactNode
  defaultValue?: string
  // TODO 6: controlled mode — `value?: string` and `onValueChange?: (value: string) => void`
}

function TabsRoot({ children, defaultValue = '' }: TabsProps) {
  const [value, setValue] = useState(defaultValue)
  return (
    <TabsContext value={{ value, select: setValue }}>
      <div className={styles.tabs}>{children}</div>
    </TabsContext>
  )
}

type TabListProps = { children: ReactNode; 'aria-label'?: string }

function TabList({ children, ...aria }: TabListProps) {
  // TODO 1: role="tablist"
  return (
    <div className={styles.list} {...aria}>
      {children}
    </div>
  )
}

type TabProps = { value: string; children: ReactNode; disabled?: boolean }

function Tab({ value, children, disabled }: TabProps) {
  const ctx = useTabsContext('Tab')
  const selected = ctx.value === value
  // TODO 2: role="tab", aria-selected, roving tabIndex (0 if selected, else -1)
  // TODO 3: id + aria-controls pointing at the matching panel
  // TODO 4: keyboard — ArrowRight/ArrowLeft (wrapping), Home, End; skip disabled tabs;
  //         move focus AND select (automatic activation)
  return (
    <button
      type="button"
      className={selected ? `${styles.tab} ${styles.selected}` : styles.tab}
      disabled={disabled}
      onClick={() => ctx.select(value)}
    >
      {children}
    </button>
  )
}

type TabPanelProps = { value: string; children: ReactNode }

function TabPanel({ value, children }: TabPanelProps) {
  const ctx = useTabsContext('Panel')
  // TODO 5: role="tabpanel", id, aria-labelledby, tabIndex={0}.
  //         Keep every panel mounted and use the `hidden` attribute instead (preserves state).
  if (ctx.value !== value) return null
  return <div className={styles.panel}>{children}</div>
}

// The compound API: <Tabs>, <Tabs.List>, <Tabs.Tab>, <Tabs.Panel>.
export const Tabs = Object.assign(TabsRoot, { List: TabList, Tab, Panel: TabPanel })

export default function ExerciseDemo() {
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
      {/* TODO 6: pass value={plan} onValueChange={setPlan} once controlled mode exists */}
      <Tabs defaultValue={plan}>
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
