# 13 – Error Boundaries & Suspense

**Level:** Intermediate · **Time:** ~40 min

## Goal
Make a UI resilient: write your own **error boundary** so one crashing widget doesn't blank the
whole page, then **code-split** a heavy component with `lazy()` and show a fallback with
`<Suspense>` while it downloads.

## Concepts
- An **error boundary** is a class component implementing `static getDerivedStateFromError(error)` (switch to the fallback UI during render) and optionally `componentDidCatch(error, info)` (side effects: logging, reporting to Sentry…). There is still no hook equivalent.
- A boundary catches errors thrown **while rendering**, in lifecycle methods and effects of the components **below** it. It does **not** catch errors:
  - in **event handlers** (use `try/catch` and state),
  - in **async code** (`setTimeout`, a `fetch().then`) — unless you re-throw them during render (e.g. via `use(promise)` or a state setter),
  - during server rendering, or in the boundary **itself**.
- **Reset**: clearing the error state re-renders the children from scratch (they are remounted, so their state is lost — usually what you want).
- `lazy(() => import('./HeavyChart'))` turns a module into a component whose code is only fetched on first render. While it loads it **suspends**, and the nearest `<Suspense fallback={…}>` shows the fallback.
- If the import fails (offline, new deployment), the error is thrown during render → an error boundary around the `Suspense` can show "couldn't load, retry".

## Tasks
Open `Exercise.tsx`.

1. Complete the `ErrorBoundary` class:
   - `static getDerivedStateFromError(error)` returns the new state `{ error }`.
   - `componentDidCatch(error, info)` calls the optional `onError` prop.
   - A `reset` method (an arrow-function class field) sets `error` back to `null`.
   - `render()` returns `this.props.fallback({ error, reset })` when there is an error, `children` otherwise.
2. In the demo, the `ErrorFallback` component renders a `role="alert"` box with **`Something went wrong: <message>`** and a **`Try again`** button calling `reset`. Pass it as the boundary's `fallback`: `fallback={(props) => <ErrorFallback {...props} />}`.
   Render it as an **element** — never call a component as a function (`fallback={ErrorFallback}` would run its hooks inside the class's `render`).
3. Replace the static `import HeavyChart` with `lazy()`. Wrap the dynamic import with `simulateSlowNetwork` from `./network` (600 ms of fake latency) so you can actually see the fallback.
4. Wrap the chart in `<Suspense fallback={<p>Loading chart…</p>}>`.

## Check yourself
```bash
npm test -- 13-error-boundaries-suspense
```

## Hints
<details><summary>Hint 1 – boundary skeleton</summary>

```tsx
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  reset = () => this.setState({ error: null })
  …
}
```
An arrow-function field keeps `this` bound when `reset` is passed around as a callback.
</details>
<details><summary>Hint 2 – lazy + a fake delay</summary>

```ts
const HeavyChart = lazy(() => simulateSlowNetwork(import('./HeavyChart')))
```
Declare it at **module level**, never inside a component — otherwise every render creates a new
lazy component and its state resets.
</details>

## Going further
- Add a `resetKeys` prop: reset automatically when one of the keys changes (e.g. the route).
- Look at React 19's `onCaughtError` / `onUncaughtError` options on `createRoot` for global reporting.
- Put a boundary *around* `<Suspense>` and make the import fail (`Promise.reject(new Error('offline'))`) to see the "chunk failed to load" case.
- Compare with the `react-error-boundary` package, which wraps this pattern with hooks (`useErrorBoundary`).

## Sources
- [Catching rendering errors with an Error Boundary – react.dev](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [`static getDerivedStateFromError` – react.dev](https://react.dev/reference/react/Component#static-getderivedstatefromerror)
- [`lazy` – react.dev](https://react.dev/reference/react/lazy)
- [`<Suspense>` – react.dev](https://react.dev/reference/react/Suspense)
- [`createRoot` options (`onCaughtError`, `onUncaughtError`) – react.dev](https://react.dev/reference/react-dom/client/createRoot#parameters)
- [Dynamic `import()` – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
