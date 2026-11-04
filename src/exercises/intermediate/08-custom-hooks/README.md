# 08 – Custom Hooks

**Level:** Intermediate · **Time:** ~35 min

## Goal
Extract reusable logic into two custom hooks — `useDebounce` and `useLocalStorage` — then
combine them into a search box that only filters after you stop typing and remembers your
last query across page reloads.

## Concepts
- A custom hook is just a function whose name starts with `use` and that calls other hooks. The `use` prefix lets React (and the linter) check the **Rules of Hooks**.
- **Rules of Hooks:** only call hooks at the top level of a component or another hook — never inside conditions, loops, or event handlers — so React can match each call to its state by call order.
- Hooks share **logic**, not **state**. Two components calling `useLocalStorage('x', …)` each get their own `useState`; they don't magically sync.
- **Lazy initial state:** `useState(() => expensive())` runs the initializer only on the first render. Reading `localStorage` + `JSON.parse` on every render would be wasteful.
- Effects synchronise React with an external system (a timer, `localStorage`). An effect's **cleanup** runs before the next effect and on unmount — perfect for cancelling a pending timeout.

## Tasks
Open `Exercise.tsx`.

1. **`useDebounce(value, delay)`** — return a copy of `value` that only updates once `value` has stopped changing for `delay` ms.
   - Keep the debounced value in state, initialised with `value`.
   - In an effect, start a `setTimeout` that copies `value` into state after `delay` ms.
   - Return a cleanup that clears the timeout, so a new keystroke cancels the pending update.
2. **`useLocalStorage(key, initialValue)`** — a drop-in replacement for `useState` that persists to `localStorage`.
   - Use **lazy initial state**: read `localStorage.getItem(key)` and `JSON.parse` it; fall back to `initialValue` when the key is missing **or the JSON is invalid**.
   - Whenever `value` changes, write `JSON.stringify(value)` back with `localStorage.setItem`.
   - Return `[value, setValue]` exactly like `useState` (so the updater form `setValue(v => …)` keeps working).
3. In `ExerciseDemo`:
   - Store the query with `useLocalStorage('playground:search', '')`.
   - Filter the list with `useDebounce(query, 300)` instead of `query`.

## Check yourself
```bash
npm test -- 08-custom-hooks
```

## Hints
<details><summary>Hint 1 – the debounce effect</summary>

```ts
useEffect(() => {
  const id = setTimeout(() => setDebounced(value), delay)
  return () => clearTimeout(id)
}, [value, delay])
```
Every time `value` changes, React runs the cleanup (cancelling the old timer) before starting a new one.
</details>
<details><summary>Hint 2 – lazy init with a fallback</summary>

```ts
const [value, setValue] = useState<T>(() => {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? initialValue : (JSON.parse(raw) as T)
  } catch {
    return initialValue
  }
})
```
`localStorage` can also throw (private mode, quota, disabled storage) — the `try` covers that too.
</details>
<details><summary>Hint 3 – keeping the useState signature</summary>

Return `[value, setValue] as const` so TypeScript infers a tuple, not an array of `T | Dispatch`.
</details>

## Going further
- **Sync across tabs:** listen to the `storage` event on `window` (it fires in *other* tabs when a key changes) and update state when `event.key === key`. Remember to remove the listener in the cleanup.
- What happens in your hook if the `key` argument changes between renders? How would you handle it?
- Look at `useSyncExternalStore` — it's the "official" way to subscribe to an external store such as `localStorage`.
- Write a `useDebouncedCallback(fn, delay)` variant that debounces a function instead of a value.

## Sources
- [Reusing Logic with Custom Hooks – react.dev](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Rules of Hooks – react.dev](https://react.dev/reference/rules/rules-of-hooks)
- [`useState`: avoiding recreating the initial state – react.dev](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)
- [Synchronizing with Effects – react.dev](https://react.dev/learn/synchronizing-with-effects)
- [`Window: storage` event – MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
- [`renderHook` – Testing Library](https://testing-library.com/docs/react-testing-library/api#renderhook)
