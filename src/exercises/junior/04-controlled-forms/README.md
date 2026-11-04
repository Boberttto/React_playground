# 04 – Controlled Forms

**Level:** Junior · **Time:** ~40 min

## Goal
Build an accessible signup form with **controlled** inputs (text, email, select, checkbox),
inline validation messages, a submit button that stays disabled until the form is valid,
and a submit handler that doesn't reload the page.

## Concepts
- A **controlled** input gets its value from React state (`value` / `checked`) and reports changes through `onChange`. React state is the single source of truth; the DOM just displays it.
  ```tsx
  <input value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} />
  <input type="checkbox" checked={values.acceptTerms} onChange={e => …e.target.checked} />
  <select value={values.plan} onChange={e => …e.target.value}>…</select>
  ```
  Passing `value` without `onChange` makes a read-only input (React warns). Switching between `undefined` and a string flips controlled ↔ uncontrolled (React warns too) — always initialise with `''` / `false`.
- One `values` object + a generic `handleChange` keeps a big form manageable. Use the input's `name` attribute as the key.
- **Validation is derived state.** `const errors = validate(values)` during render — don't store errors in state. Only *when to show them* is state: track which fields have been `touched` (blurred), so users aren't shouted at before they type.
- `<form onSubmit>` fires on Enter and on the submit button. Call `e.preventDefault()` or the browser performs a full-page navigation.
- **Accessible errors:** each input needs a real `<label>`; when invalid, set `aria-invalid="true"` and link the message with `aria-describedby="<error id>"`, so screen readers announce it with the field. Generate ids with `useId()`.
- React 19 also offers `<form action={fn}>` + `useActionState` for server-style forms; that's covered later. Controlled inputs are still the tool of choice for instant validation like here.

## Tasks
Open `Exercise.tsx`. The `onSubmit` prop receives `{ name, email, plan, acceptTerms }`.

1. Make all four fields controlled from the single `values` state (only **Name** is wired in the starter). Tip: write one `handleChange` that reads `e.target.name`, and uses `checked` for checkboxes.
2. Implement `validate(values)` returning an object of messages:
   - name: `Name must be at least 2 characters` (after trimming)
   - email: `Enter a valid email address` (a simple `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` is fine)
   - plan: `Choose a plan` (when it's `''`)
   - acceptTerms: `You must accept the terms`
3. Track `touched` fields (`onBlur`) and show a field's error **only once it's been touched**, in an element with an id.
4. On an invalid, touched field set `aria-invalid` and `aria-describedby` pointing to the message.
5. Disable the submit button while there is any error.
6. On submit: `preventDefault()`, call `onSubmit(values)` and replace the form with a status message `Welcome aboard, <name>!`.

## Check yourself
```bash
npm test -- 04-controlled-forms
```

## Hints
<details><summary>Hint 1 – one change handler for every field</summary>

```tsx
function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
  const { name, value } = e.target
  const next = e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
    ? e.target.checked
    : value
  setValues(v => ({ ...v, [name]: next }))
}
```
</details>
<details><summary>Hint 2 – is the form valid?</summary>

`const isValid = Object.keys(errors).length === 0` — derived, no state needed.
</details>
<details><summary>Hint 3 – wiring an error</summary>

```tsx
const showNameError = touched.name && errors.name
<input aria-invalid={showNameError ? true : undefined} aria-describedby={showNameError ? nameErrorId : undefined} />
{showNameError && <p id={nameErrorId}>{errors.name}</p>}
```
</details>

## Going further
- A disabled submit button gives no feedback on *why*. A common alternative: keep it enabled, and on submit mark every field as touched and move focus to the first invalid one. Try it.
- Rewrite with `<form action>` and `useActionState`, then compare.
- Test it with a screen reader (VoiceOver: <kbd>Cmd</kbd>+<kbd>F5</kbd>, NVDA on Windows).

## Sources
- [`<input>` (controlling an input with a state variable) – react.dev](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)
- [`<select>` – react.dev](https://react.dev/reference/react-dom/components/select)
- [Reacting to Input with State – react.dev](https://react.dev/learn/reacting-to-input-with-state)
- [`useId` – react.dev](https://react.dev/reference/react/useId)
- [`aria-invalid` – MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid)
- [`Event.preventDefault()` – MDN](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
