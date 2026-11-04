# 11 – Refs

**Level:** Intermediate · **Time:** ~40 min

## Goal
Use refs for the two jobs they're made for — **reaching DOM nodes** and **remembering mutable
values without re-rendering** — then build a custom input that exposes a small imperative API
with `useImperativeHandle`, using React 19's "ref as a prop".

## Concepts
- `useRef(initial)` returns a stable `{ current }` box. Changing `ref.current` does **not** trigger a re-render — that's the difference with state.
- **DOM refs:** `<input ref={inputRef} />` → `inputRef.current` is the `<input>` element after commit. Use it for focus, scroll, measuring, media playback… things React has no prop for.
- **Mutable values:** an interval id, a previous value, a "did mount" flag — anything that must survive renders but isn't displayed. Don't read or write `ref.current` **during render** (only in effects and event handlers).
- **React 19: `ref` is a regular prop** for function components. `forwardRef` is no longer needed: `function FancyInput({ ref, ...props })`.
- `useImperativeHandle(ref, () => ({ focus, clear }))` lets a component expose a **small, intentional API** instead of its raw DOM node.
- **Ref callbacks** (`ref={(node) => …}`) can now **return a cleanup function** (React 19), called when the node is detached — handy to keep a `Map` of item nodes in sync.

## Tasks
Open `Exercise.tsx`.

1. **`FocusInput`** — clicking **`Focus the input`** focuses the `Name` text field.
2. **`Stopwatch`** — Start / Stop / Reset buttons and a `role="timer"` display (`0.0 s`).
   - Store the interval id in a ref (it isn't displayed, so it shouldn't be state).
   - Start ticks every 100 ms; clicking Start twice must **not** run two intervals.
   - Stop clears the interval; Reset stops and sets the time back to `0.0 s`.
   - Clear the interval when the component unmounts.
3. **`FancyInput`** — receive `ref` as a prop (no `forwardRef`) and use `useImperativeHandle` to expose `{ focus(), clear() }` built on an internal `<input>` ref.
4. **`JumpList`** — a long list and a `Jump to item` select. Keep each `<li>` in a `Map` via a **ref callback that returns a cleanup** (delete the entry), and call `scrollIntoView` on the chosen item.

## Check yourself
```bash
npm test -- 11-refs
```

## Hints
<details><summary>Hint 1 – typing a DOM ref</summary>

`const inputRef = useRef<HTMLInputElement>(null)` then `inputRef.current?.focus()`.
</details>
<details><summary>Hint 2 – guarding the interval</summary>

```ts
const intervalRef = useRef<number | null>(null)
function start() {
  if (intervalRef.current !== null) return // already running
  intervalRef.current = window.setInterval(() => setElapsed((ms) => ms + 100), 100)
}
```
</details>
<details><summary>Hint 3 – ref as a prop + imperative handle</summary>

```tsx
export type FancyInputHandle = { focus: () => void; clear: () => void }
export function FancyInput({ label, ref }: { label: string; ref?: Ref<FancyInputHandle> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => { if (inputRef.current) inputRef.current.value = '' },
  }), [])
  …
}
```
</details>
<details><summary>Hint 4 – ref callback with cleanup</summary>

```tsx
<li ref={(node) => {
  if (node) itemsRef.current.set(item, node)
  return () => { itemsRef.current.delete(item) }
}}>
```
</details>

## Going further
- Display milliseconds using `performance.now()` deltas instead of counting ticks (intervals drift).
- Add a `select()` method to `FancyInput`'s handle. Why is exposing the whole DOM node a worse API?
- Read "You Might Not Need an Effect" and ask yourself: which of these could be done in an event handler instead of an effect?

## Sources
- [Referencing Values with Refs – react.dev](https://react.dev/learn/referencing-values-with-refs)
- [Manipulating the DOM with Refs – react.dev](https://react.dev/learn/manipulating-the-dom-with-refs)
- [`useRef` – react.dev](https://react.dev/reference/react/useRef)
- [`useImperativeHandle` – react.dev](https://react.dev/reference/react/useImperativeHandle)
- [React 19: `ref` as a prop and cleanup functions for refs – react.dev](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)
- [`Element.scrollIntoView()` – MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView)
