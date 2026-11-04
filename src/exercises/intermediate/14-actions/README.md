# 14 – Actions: forms the React 19 way

**Level:** Intermediate · **Time:** ~45 min

## Goal
Build a newsletter sign-up form with **React 19 Actions**: pass an async function to
`<form action>`, track its result and pending state with `useActionState`, and let a nested
submit button read the form's status with `useFormStatus` — no `onSubmit`, no
`preventDefault`, no manual `isLoading` flag.

## Concepts
- **Action** = a function (sync or async) triggered by a transition. `<form action={fn}>` calls `fn(formData)` on submit — React handles `preventDefault` for you.
- `const [state, formAction, isPending] = useActionState(action, initialState)` wraps an action: your action receives `(previousState, formData)` and **returns the next state** (a success message, an error…). `isPending` is `true` while it runs.
- `useFormStatus()` (from `react-dom`) gives `{ pending, data, method, action }` of the **parent `<form>`** — so a reusable `<SubmitButton>` can disable itself without any props. It must be rendered *inside* the form.
- After a successful action, React **resets uncontrolled fields** of the form automatically. To keep what the user typed after an error, feed it back via `defaultValue` from the returned state.
- Validate on the "server" side (in the action) and return errors as **state**, not exceptions: expected failures are part of the UI. Reserve `throw` for unexpected ones (they go to the nearest error boundary).

## Tasks
Open `Exercise.tsx` (the fake backend is in `api.ts`).

1. Implement `subscribeAction(prevState, formData)`:
   - Read and trim the `email` field.
   - Empty → return an error state with **`Email is required.`**
   - Not shaped like `x@y.z` → **`Please enter a valid email address.`**
   - Otherwise `await subscribeToNewsletter(email)` and return a success state with **`Thanks! <email> is now subscribed.`**
   - If it throws an `ApiError`, return its `message` as an error; for any other error return **`Something went wrong. Please try again.`**
   - Error states keep the `email` so the field can be refilled; success clears it.
2. In `NewsletterForm`, call `useActionState(subscribeAction, initialState)` and pass the returned action to `<form action={…}>` (remove the `onSubmit` placeholder).
3. Use `defaultValue={state.email}` on the input, and render the message: errors in a `role="alert"` paragraph (set `aria-invalid` on the input too), success in an `<output>` element (its implicit role is `status`, a polite live region).
4. In `SubmitButton`, use `useFormStatus()` to disable the button and show **`Subscribing…`** while pending.

## Check yourself
```bash
npm test -- 14-actions
```

## Hints
<details><summary>Hint 1 – the action signature</summary>

```ts
export async function subscribeAction(
  _prevState: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get('email') ?? '').trim()
  …
}
```
The `_` prefix tells TypeScript (and readers) the parameter is intentionally unused.
</details>
<details><summary>Hint 2 – distinguishing expected errors</summary>

```ts
try {
  await subscribeToNewsletter(email)
} catch (error) {
  const message = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
  return { status: 'error', message, email }
}
```
</details>
<details><summary>Hint 3 – useFormStatus import</summary>

`import { useFormStatus } from 'react-dom'` — note: **react-dom**, not react. It only works in a component rendered inside a `<form>`.
</details>

## Going further
- Add `useOptimistic` to a comment list: show the new comment instantly, roll back if the action fails.
- Give the form a `permalink` (third `useActionState` argument) and read about progressive enhancement with Server Functions.
- Show which email is being submitted using `useFormStatus().data?.get('email')`.
- Debounce-check availability while typing (exercise 08) and compare with validating in the action.

## Sources
- [React 19: Actions – react.dev](https://react.dev/blog/2024/12/05/react-19#actions)
- [`useActionState` – react.dev](https://react.dev/reference/react/useActionState)
- [`useFormStatus` – react.dev](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [`<form>` (the `action` prop) – react.dev](https://react.dev/reference/react-dom/components/form)
- [`aria-invalid` – MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid)
