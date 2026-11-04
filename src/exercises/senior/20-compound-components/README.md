# 20 – Compound components: accessible Tabs

**Level:** Senior · **Time:** ~60 min

## Goal
Build a reusable, accessible **Tabs** component with a *compound* API
(`<Tabs>`, `<Tabs.List>`, `<Tabs.Tab>`, `<Tabs.Panel>`). It shares state through context, supports
**controlled and uncontrolled** modes, and implements the **WAI-ARIA APG Tabs pattern**: roles,
ids, roving tabindex and arrow-key navigation.

## Concepts
- **Compound components** are a set of components that work together and share *implicit* state via
  context, like `<select>` and `<option>`. Compare:
  ```tsx
  <Tabs items={[{ label: 'A', content: … }]} />        // configuration API
  <Tabs><Tabs.List><Tabs.Tab value="a">A</Tabs.Tab></Tabs.List>…</Tabs>   // compound API
  ```
  The config API breaks down as soon as one tab needs an icon, a badge, a tooltip or a wrapper. The
  compound API hands the **markup** back to the consumer. That's **inversion of control**: the
  component owns *behaviour*, the user owns *structure*.
- **Headless components** go one step further and ship *no styles at all*, only behaviour and ARIA.
  Radix UI, React Aria, Headless UI and Ariakit are built this way. The hard parts (focus, keyboard,
  ARIA, ids) are solved once, and the design system stays free.
- **Controlled vs uncontrolled**, same as `<input value>` vs `<input defaultValue>`:
  - *uncontrolled*: `defaultValue` seeds internal state, and the component owns it from then on;
  - *controlled*: `value` comes from the parent and is the **single source of truth**. The component
    must not change it on its own. It just calls `onValueChange(next)`;
  - pick the mode from `value !== undefined`. Don't switch modes during a component's lifetime (React
    warns about exactly this for inputs).
- **The APG Tabs pattern**
  - `role="tablist"` (with an accessible name) contains `role="tab"` elements, and each controls a
    `role="tabpanel"`;
  - `aria-selected` on tabs, `aria-controls` from tab to panel, `aria-labelledby` from panel to tab. Ids
    come from `useId()`, which is unique per instance and stable across server and client;
  - **roving tabindex**: only the selected tab has `tabIndex=0`, and the others get `-1`. <kbd>Tab</kbd>
    enters the tablist once and then moves on to the panel. **Arrow keys** move between tabs (wrapping),
    and <kbd>Home</kbd> / <kbd>End</kbd> jump to the first / last one. Disabled tabs are skipped;
  - **automatic activation** (focus = select) suits panels that render instantly. *Manual* activation
    (arrows move focus, <kbd>Enter</kbd>/<kbd>Space</kbd> select) is better when showing a panel is slow.
  - the panel gets `tabIndex=0` so keyboard users can reach it even when it has no focusable content.
- **`hidden` vs unmounting**: keeping inactive panels mounted with `hidden` preserves their state (try
  typing in the Svelte tab). Unmounting saves memory. Both are valid, but choose deliberately. React 19.2's
  `<Activity mode="hidden">` gives you "hidden but preserved" for any subtree.
- **Static sub-components** (`Tabs.Tab`) are just properties on the function:
  `Object.assign(TabsRoot, { List, Tab, Panel })`. This keeps a single import and makes the
  relationship obvious.

## Tasks
Open `Exercise.tsx`. Clicking already works (uncontrolled only), but nothing is accessible yet.

1. `TabList`: add `role="tablist"`. The `aria-label` prop is already forwarded.
2. `Tab`: add `role="tab"`, `aria-selected`, and a roving `tabIndex` (`0` if selected, else `-1`).
3. Generate a `baseId` with `useId()` in `TabsRoot` and put it in context. Give each tab
   `id={baseId-tab-value}` and `aria-controls={baseId-panel-value}`.
4. Keyboard on `Tab`: <kbd>←</kbd>/<kbd>→</kbd> (wrapping), <kbd>Home</kbd>, <kbd>End</kbd>. Skip disabled
   tabs, move **focus** to the target, and **select** it. Call `preventDefault()` on handled keys.
5. `TabPanel`: `role="tabpanel"`, matching `id`, `aria-labelledby`, `tabIndex={0}`. Render every
   panel and hide the inactive ones with the `hidden` attribute.
6. Controlled mode: accept `value` and `onValueChange`. In the demo, wire the "Billing" tabs to `plan`
   and check that the outside button drives them.
7. `useTabsContext`: throw `` `<Tabs.${component}> must be rendered inside <Tabs>` `` when the context
   is missing. (Rename `_component` back to `component`.)

## Check yourself
```bash
npm test -- 20-compound-components
```
Also try it with a screen reader (VoiceOver: <kbd>⌘ F5</kbd>, NVDA on Windows). You should hear
*"Vue, tab, 2 of 4, selected"*.

## Hints
<details><summary>Hint 1 – finding sibling tabs</summary>

You don't need to register tabs in context. From the key event:
```ts
const list = e.currentTarget.closest('[role="tablist"]')
const tabs = Array.from(list!.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'))
const index = tabs.indexOf(e.currentTarget)
```
Store the value on the element (`data-value={value}`) to know what to select.
</details>
<details><summary>Hint 2 – wrapping</summary>

`next = (index + 1) % tabs.length`, `prev = (index - 1 + tabs.length) % tabs.length`.
</details>
<details><summary>Hint 3 – controlled mode</summary>

```ts
const isControlled = value !== undefined
const current = isControlled ? value : internalValue
function select(next: string) {
  if (!isControlled) setInternalValue(next)
  onValueChange?.(next)
}
```
</details>

## Going further
- Add an `activationMode: 'automatic' | 'manual'` prop.
- Add `orientation="vertical"` (Up/Down arrows, `aria-orientation`).
- DOM querying breaks if tabs are rendered in a portal. Replace it with a registration system (each
  `Tab` registers a ref in context, ordered by DOM position), as Radix's *Collection* does.
- Compare your API with Radix Tabs and React Aria `Tabs`. What do they expose that you don't?

## Sources
- [Tabs pattern – WAI-ARIA Authoring Practices Guide (W3C)](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [Developing a keyboard interface: roving tabindex – W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex)
- [Passing data deeply with context – react.dev](https://react.dev/learn/passing-data-deeply-with-context)
- [`useId` – react.dev](https://react.dev/reference/react/useId)
- [Controlled and uncontrolled components – react.dev](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)
- [Inversion of Control – Kent C. Dodds](https://kentcdodds.com/blog/inversion-of-control)
- [Compound Components with React Hooks – Kent C. Dodds](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [Radix UI Tabs (headless reference implementation)](https://www.radix-ui.com/primitives/docs/components/tabs)
