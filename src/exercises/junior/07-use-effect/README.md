# 07 – useEffect

**Level:** Junior · **Time:** ~45 min

## Goal
Fetch a user from `https://jsonplaceholder.typicode.com/users/:id` and show loading, error
and success states. When the id changes quickly, make sure an old, slow response can never
overwrite a newer one, by cancelling requests with an `AbortController` in the Effect cleanup.
You'll also learn when **not** to use an Effect.

## Concepts
- **What an Effect is for:** synchronising a component with something *outside* React (network, timers, subscriptions, browser APIs, a non-React widget). It runs **after** the render is committed to the screen.
  ```tsx
  useEffect(() => {
    // setup: start synchronising with the current props/state
    return () => {
      // cleanup: stop synchronising (runs before the next setup, and on unmount)
    }
  }, [dependencies]) // re-run when any of these change
  ```
- **Dependencies are not a choice.** Every reactive value (props, state, values derived from them) the Effect reads must be in the array. The linter (`react/exhaustive-deps`) tells you which. If you want fewer re-runs, change the code, not the array.
- **Race conditions.** Click *Next* twice quickly: requests for users 2 and 3 are both in flight. If 2 is slower, it lands *last* and you display the wrong user. The fix: the cleanup of the run for id 2 marks it as stale **before** the run for id 3 starts.
  - `AbortController`: `fetch(url, { signal })` and `controller.abort()` in the cleanup. The request is actually cancelled (see the Network tab) and the promise rejects with an `AbortError`, which you must ignore, not display.
  - The `ignore` flag pattern (`let ignore = false; … return () => { ignore = true }`) works for anything promise-based, even APIs that can't be cancelled. You can combine both.
- **`fetch` only rejects on network failure.** A 404 or 500 resolves normally; check `res.ok` yourself.
- **StrictMode in development** mounts each component, unmounts it and mounts it again, so your Effect runs **setup → cleanup → setup**. You'll see two requests in the Network tab (the first one cancelled). This is intentional: it surfaces missing cleanups. It does **not** happen in production. Don't "fix" it with a `useRef` guard; write a proper cleanup instead.
- In real apps, prefer a data-fetching library (TanStack Query, SWR) or your framework's loader: they handle caching, deduplication and races for you. Doing it by hand once is how you understand what they solve.

### You Might Not Need an Effect
Effects are an escape hatch. Many "I'll use an Effect" situations are better solved without one:

| Situation | ❌ With an Effect | ✅ Without |
| --- | --- | --- |
| A value computed from props/state | `useEffect(() => setFullName(first + ' ' + last), [first, last])` | `const fullName = first + ' ' + last` during render (an extra render and a stale frame avoided) |
| Expensive derived value | Effect + state | `useMemo` (or nothing: the React Compiler memoises for you) |
| Reacting to a user action (submit, click) | Set a flag in state, then an Effect watches the flag and POSTs | Do the work directly in the **event handler**: you know exactly what happened there |
| Resetting state when a prop changes | `useEffect(() => setComment(''), [userId])` | Give the component a `key={userId}` so React resets it |
| Notifying a parent of a change | `useEffect(() => onChange(value), [value])` | Call `onChange` in the same handler that updates the state (or lift the state up, see 06) |

Ask: *"Is this code running because the component was **displayed**, or because the user **did** something?"* Displayed → Effect. Did something → event handler.

## Tasks
Open `Exercise.tsx`. The starter "works" on a fast network, but it has no loading or error state and it's racy.

1. Replace `user | null` with a discriminated union `{ status: 'loading' } | { status: 'error'; error: string } | { status: 'success'; user: User }`, and render:
   - loading → `<output>Loading user…</output>` (implicit role `status`)
   - error → `<p role="alert">Could not load user (<message>)</p>`, e.g. `Could not load user (HTTP 404)`
   - success → an `<h2>` with the name, then the email.
2. Show `loading` again whenever `userId` changes. Two options:
   - simple: `setState({ status: 'loading' })` at the top of the Effect. It works, but costs an extra render, and the linter flags it (`set-state-in-effect`);
   - better (used in the solution): store the `userId` the result belongs to (`{ userId, status, … }`) and **derive** `loading` during render when `result?.userId !== userId`. No extra state update needed.
3. Throw `new Error(`HTTP ${res.status}`)` when `!res.ok`, and catch network errors.
4. Create an `AbortController` in the Effect, pass `signal` to `fetch`, call `abort()` in the cleanup. Ignore the `AbortError`, and never call `setState` for a request whose signal is aborted.
5. In the playground (StrictMode is on), open DevTools → Network, reload and click *Next* quickly. Observe the cancelled requests.

## Check yourself
```bash
npm test -- 07-use-effect
```
The tests replace `fetch` with a mock whose responses are resolved by hand, in any order, so the race condition is reproduced deterministically.

## Hints
<details><summary>Hint 1 – async inside an Effect</summary>

The Effect callback itself can't be `async` (it must return a cleanup function, not a promise). Declare an async function inside and call it:

```tsx
useEffect(() => {
  const controller = new AbortController()
  async function load() { /* await fetch(url, { signal: controller.signal }) … */ }
  void load()
  return () => controller.abort()
}, [userId])
```
</details>
<details><summary>Hint 2 – ignoring stale results</summary>

`controller.signal.aborted` is `true` once the cleanup ran. Check it before every `setState`, including in the `catch` (that's where the `AbortError` lands).
</details>
<details><summary>Hint 3 – typing the caught error</summary>

`catch (error)` gives you `unknown`. Use `error instanceof Error ? error.message : String(error)`.
</details>

## Going further
- Show the previous user (dimmed) while the next one loads, instead of a spinner. With the derived-loading approach it's a few lines.
- Extract a reusable `useFetch<T>(url)` custom hook (intermediate track).
- React 19's `use(promise)` + `<Suspense>` lets you read a promise during render. Why must the promise come from a cache and not be created during render?

## Sources
- [Synchronizing with Effects – react.dev](https://react.dev/learn/synchronizing-with-effects)
- [You Might Not Need an Effect – react.dev](https://react.dev/learn/you-might-not-need-an-effect)
- [`useEffect` reference (fetching data with Effects) – react.dev](https://react.dev/reference/react/useEffect#fetching-data-with-effects)
- [`<StrictMode>` – react.dev](https://react.dev/reference/react/StrictMode)
- [`AbortController` – MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Using the Fetch API (checking that the fetch was successful) – MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_response_status)
