# 18 – use() & Suspense: data, errors and reveal order

**Level:** Senior · **Time:** ~50 min

## Goal
Load a user profile and their posts **without `useEffect`**. Read promises with React 19's
**`use()`**, declare loading states with nested **`<Suspense>`** boundaries, catch rejections with an
**error boundary**, and read a context *conditionally* with `use(Context)`.

## Concepts
- **`use(promise)`** reads the value of a promise during render:
  - *pending* → the component **suspends**, and the nearest `<Suspense>` shows its `fallback`;
  - *fulfilled* → returns the value synchronously;
  - *rejected* → **throws** the reason, and the nearest error boundary renders its fallback.
- **Why the promise must not be created during render.** A render that suspends is **thrown away**:
  the component never committed, so there's no state, no ref and no memo to keep anything in. When the
  promise settles, React renders the component again *from scratch*. If that render calls
  `fetchUser(id)` again, it gets a **new pending promise**, suspends again, and loops forever (React
  even warns: *"A component was suspended by an uncached promise"*). So promises must come from
  something that **outlives the render**:
  - a **cache** keyed by the request (what you'll build), as data libraries do;
  - a parent that already committed (state, or a Server Component passing a promise down);
  - a router loader or framework.
  `useMemo` doesn't help here either. Its cache is discarded with the suspended render.
- **Start fetches early, read them late.** `ProfilePage` receives *both* promises already started, so
  the requests run in parallel. If `PostList` fetched only after `UserHeader` resolved, you'd create a
  **waterfall**.
- **Suspense boundaries are your loading-state design tool.**
  - Everything inside one boundary is revealed **together**.
  - A nested boundary lets the outer content appear while the inner part still loads.
  - Nested boundaries reveal **outside-in**: inner content never appears before its parent boundary's
    content, even if its data arrived first. That avoids layout jumping in random order.
  - Already-visible content won't be replaced by a fallback if the update is a **Transition** (see
    exercise 16, and the user switcher in the demo).
- **Errors are boundaries too.** A rejected promise is thrown like any render error. There's still no
  hook to *catch* render errors: `getDerivedStateFromError` is class-only (`ErrorBoundary.tsx` is
  provided). `use` can't be wrapped in `try/catch`, and React will tell you so.
  To retry, evict the failed promise from the cache and re-render with a new one.
- **`use(Context)`** works like `useContext` but, like all of `use`, it can be called **conditionally**:
  after an early return, inside `if`, or in loops. `use` is the only "hook" exempt from that rule,
  because React doesn't track it by call order. In React 19 you can also render
  `<ThemeContext value="dark">` instead of `<ThemeContext.Provider>`.

## Tasks
Open `Exercise.tsx` (`api.ts` and `ErrorBoundary.tsx` are provided).

1. **Cache** `getUser` and `getPosts` in a `Map` so the same id returns the **same** promise. Bonus:
   evict the entry when the promise rejects, so "Try again" really refetches.
2. In `UserHeader`, read the user with `use(userPromise)`. Render `<h2>{name}</h2>` and the bio.
3. In `PostList`, read the posts with `use()` and render them in `<ul aria-label="Posts">`.
   Try doing task 2 *before* task 1. The playground stays on "Loading…" forever and the console
   fills with `[api] GET` lines. That's the uncached-promise loop.
4. Add an outer `<Suspense fallback={<p>Loading profile…</p>}>` around the article, and an inner
   `<Suspense fallback={<p>Loading posts…</p>}>` around `<PostList>`.
5. Wrap everything in `<ErrorBoundary>`. Its `fallback` renders `role="alert"` with the error message
   and a **Try again** button that calls `reset`. Pass `onReset={onRetry}`. Click **User 404** in the
   playground.
6. In `ThemedNote`, call `use(ThemeContext)` *after* the early return and display `Theme: {theme}`.

## Check yourself
```bash
npm test -- 18-use-and-suspense
```
The tests pass promises they settle by hand, so they can check each intermediate state, including
that posts stay hidden when they arrive *before* the user.

## Hints
<details><summary>Hint 1 – the cache</summary>

```ts
const userCache = new Map<number, Promise<User>>()
export function getUser(id: number) {
  let p = userCache.get(id)
  if (!p) {
    p = fetchUser(id)
    p.catch(() => userCache.delete(id))
    userCache.set(id, p)
  }
  return p
}
```
</details>
<details><summary>Hint 2 – boundary order</summary>

`ErrorBoundary` › `Suspense (profile)` › `article` › [`UserHeader`, `Suspense (posts)` › `PostList`].
Should the error boundary be inside or outside the Suspense? Try both with User 404.
</details>
<details><summary>Hint 3 – tests show nothing at all</summary>

Did you name the list `aria-label="Posts"` and render the name in an `<h2>`? The tests use
accessible queries.
</details>

## Going further
- Give `PostList` its **own** error boundary, so a posts failure keeps the header visible.
- Replace the hand-written cache with TanStack Query's `useSuspenseQuery`, then compare.
- Read about `<Suspense>` with **Server Components** and streaming SSR. The same boundaries decide
  which HTML chunks stream first.
- `use` can't be called in `try/catch`. Why would that conflict with how suspension works?

## Sources
- [`use` – react.dev](https://react.dev/reference/react/use)
- [`<Suspense>` – react.dev](https://react.dev/reference/react/Suspense)
- [`<Suspense>`: revealing nested content as it loads – react.dev](https://react.dev/reference/react/Suspense#revealing-nested-content-as-it-loads)
- [Catching rendering errors with an error boundary – react.dev](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React v19: `use` and `<Context>` as a provider – react.dev blog](https://react.dev/blog/2024/12/05/react-19)
- [You Might Not Need an Effect: fetching data – react.dev](https://react.dev/learn/you-might-not-need-an-effect#fetching-data)
