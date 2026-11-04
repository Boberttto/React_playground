# 05 – Conditional Rendering

**Level:** Junior · **Time:** ~30 min

## Goal
Build three small components that render different UI depending on their props:
a `NotificationBadge`, a `WarningBanner` that sometimes renders nothing, and a `UserList`
that handles **loading / error / empty / data** states. You'll practise `&&`, ternaries,
early returns, returning `null`, and modelling UI states with a TypeScript discriminated union.

## Concepts
- JSX is just JavaScript, so you choose what to render with regular JS: `if` + early `return`, the ternary `cond ? <A /> : <B />`, and `cond && <A />`.
- **The `&&` pitfall with `0`.** `a && b` returns `a` when `a` is falsy. React renders nothing for `false`, `null`, `undefined` and `''`… but it **renders numbers**, including `0`:
  ```tsx
  {count && <span>{count}</span>}     // count = 0 → renders "0" 😬
  {count > 0 && <span>{count}</span>} // boolean on the left → renders nothing
  ```
  Rule of thumb: make the left side of `&&` a real boolean (`> 0`, `!!x`, `x != null`), or use a ternary.
- **Returning `null`** from a component renders nothing (the component still exists, its hooks still run). It's how a component "hides itself".
- **Early returns** keep multi-state components flat: handle `loading`, then `error`, then `empty`, and the main markup is left at the end without nesting.
- **Discriminated unions** model mutually exclusive states. With `{ status: 'loading' } | { status: 'error'; error: string } | { status: 'success'; data: User[] }`, impossible combos (loading *and* error) can't be represented, and TypeScript narrows `state.data` only after you check `state.status === 'success'`.
- Accessibility: announce loading with a `status` live region (polite — the `<output>` element has this role natively) and errors with `role="alert"` (assertive).

## Tasks
Open `Exercise.tsx`.

1. **`NotificationBadge({ count })`** renders a button named **Notifications**. Inside it, show a badge with the count only when `count > 0` (fix the `0` bug in the starter). Above `99`, show `99+`. Give the button an `aria-label` of `Notifications (N unread)` when there are unread ones.
2. **`WarningBanner({ message })`** returns `null` when `message` is missing or empty; otherwise a `role="alert"` box with the message.
3. **`UserList({ state, onRetry })`** with early returns:
   - `loading` → `<output>Loading users…</output>` (`<output>` has the implicit role `status`)
   - `error` → a `role="alert"` box with `Could not load users: <error>` and a **Retry** button calling `onRetry`
   - `success` with an empty array → `No users yet.`
   - `success` with data → a `<ul aria-label="Users">` of names
4. In the demo, add buttons to switch between the four states (the starter already has a badge stepper).

## Check yourself
```bash
npm test -- 05-conditional-rendering
```

## Hints
<details><summary>Hint 1 – narrowing the union</summary>

```tsx
if (state.status === 'loading') return …
if (state.status === 'error') return … // state.error is typed here
// from here on TypeScript knows status === 'success'
if (state.data.length === 0) return …
```
</details>
<details><summary>Hint 2 – the badge label</summary>

`const label = count > 99 ? '99+' : String(count)` — compute it before the `return`; plain variables are often clearer than nested ternaries in JSX.
</details>

## Going further
- Add an `idle` status (nothing requested yet). TypeScript will point out every place that must handle it if you use an exhaustive `switch` with a `never` check.
- Where else can `0` sneak in? `{items.length && <List />}` is the classic one.
- Compare returning `null` vs CSS `display: none` vs the `hidden` attribute: which ones keep state, which ones keep the DOM?

## Sources
- [Conditional Rendering – react.dev](https://react.dev/learn/conditional-rendering)
- [Conditional Rendering: pitfall with `&&` and `0` – react.dev](https://react.dev/learn/conditional-rendering#logical-and-operator-)
- [Logical AND (`&&`) – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND)
- [Narrowing: discriminated unions – TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
- [ARIA `status` role – MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role)
- [ARIA `alert` role – MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role)
