# 16 – Concurrency: useTransition & useDeferredValue

**Level:** Senior · **Time:** ~45 min

## Goal
Keep the UI responsive while expensive or not-yet-loaded content is prepared. Part A turns a
janky tab switcher into a smooth one with **`useTransition`**. Part B keeps a search box over
10 000 items snappy with **`useDeferredValue`**, and shows a "stale" indicator while results catch up.

## Concepts
- **Two kinds of updates.** *Urgent* updates (typing, clicking, pressing) must reflect immediately.
  *Transition* updates (switching a view, showing results) can lag a little. Since React 18, rendering
  is **concurrent**: React can prepare a new UI in the background, **yield** to the browser between
  components (every ~5 ms) so events keep being handled, and **abandon** a render that became
  obsolete. Before React 18, a render started was a render finished, and the main thread was blocked.
- **Priorities are lanes.** Every update gets a lane (sync/discrete for clicks and keys, default,
  transition, deferred…). React always works on the most urgent lane first. An urgent update
  arriving mid-transition interrupts it. React handles the keystroke, then restarts the transition
  with fresh state.
- **`useTransition()` → `[isPending, startTransition]`**. State updates inside
  `startTransition(() => …)` are non-urgent. `isPending` is `true` from the click until the
  transition commits, so you can show a subtle indicator.
  - **Suspense + transitions.** A transition that suspends does *not* replace already-visible content
    with the nearest `<Suspense>` fallback. React keeps the old screen (with `isPending`) until the new
    one is ready. Without a transition, clicking *Posts* blanks the panel to "Loading posts…".
  - The function passed to `startTransition` runs synchronously. Only the state updates inside it are
    marked. (In React 19 it may be `async`: that's an **Action**, covered in exercise 17.)
  - You can't use a transition for a controlled input's value. Its update must be urgent, or typing breaks.
- **`useDeferredValue(value)`** is the "I don't own the setter" version. During the urgent render it
  returns the **previous** value. Then React schedules a background render with the new one. Unlike
  debounce/throttle, there's no fixed delay: on a fast machine the lag is invisible, and on a slow one
  React keeps skipping obsolete intermediate values.
  - `query !== deferredQuery` tells you the results are **stale**, so dim them and set `aria-busy`.
  - It only helps if the urgent render can **skip** the slow subtree. The docs say to wrap it in `memo`.
    In this project the **React Compiler** memoizes `<SearchResults query={deferredQuery} …/>` for you
    (see exercise 15), which is why no `memo` call appears.
  - Concurrency doesn't make rendering faster, it makes it *interruptible*. Fifty slow rows are still slow.
    That's why the slowness here is split across many small components: React can only yield
    **between** components, never inside one.

## Tasks
Open `Exercise.tsx`.

**Part A – TabSwitcher**
1. Call `useTransition()` to get `isPending` and `startTransition`.
2. In `selectTab`, wrap `setTab(next)` in `startTransition`.
3. While `isPending`, render `<span role="status">Switching…</span>` next to the buttons, and add
   `styles.pending` to the panel. Try it: click **Posts**. The About tab stays (dimmed) until posts
   arrive, with no flash of "Loading posts…". Then click **Slow** and immediately **Contact**. The slow
   render is abandoned. Remove the transition again to feel the difference.

**Part B – ProductSearch**

4. Create `deferredQuery = useDeferredValue(query)`.
5. Compute `isStale` (`query !== deferredQuery`).
6. Pass `deferredQuery` (not `query`) to `SearchResults`, and add `styles.pending` to the results while
   stale. Type fast: the input never lags, and the list dims, then catches up.

## Check yourself
```bash
npm test -- 16-concurrency
```
Tests can't feel jank, so they check what concurrency makes *observable*:
- Part A: after clicking a tab whose data is still loading, the **old tab is still on screen**, no
  Suspense fallback is shown, and the pending status is visible.
- Part B: a `MutationObserver` records that the results region **was** `aria-busy="true"` for one
  commit (the urgent render) before settling back to `false`.

Note the awaited `act(() => user.click(…))` in the test. When an interaction makes a component suspend,
React needs an *async* act scope to retry the render once the promise resolves.

## Hints
<details><summary>Hint 1 – startTransition</summary>

```tsx
const [isPending, startTransition] = useTransition()
function selectTab(next: Tab) {
  startTransition(() => {
    setTab(next)
  })
}
```
</details>
<details><summary>Hint 2 – "nothing got faster"</summary>

That's expected. Concurrency changes *what happens while the slow work runs*. Open the Performance
panel in your browser DevTools: with a transition, the long task becomes many short ones with gaps
where input events are processed.
</details>
<details><summary>Hint 3 – stale styling</summary>

```tsx
className={isStale ? `${styles.results} ${styles.pending}` : styles.results}
```
A short CSS `transition: opacity` (already in the stylesheet) avoids flicker on fast machines.
</details>

## Going further
- Pass an initial value: `useDeferredValue(query, '')` (React 19) renders the initial pass with `''`,
  then the real value in the background. That's useful for expensive first paints.
- Replace `useDeferredValue` with a 300 ms debounce. What do you lose on a fast machine? On a slow one?
- Read the "Suspense-enabled router" section of the `useTransition` docs: routers (React Router, Next.js)
  wrap navigations in transitions for exactly the reason seen in Part A.

## Sources
- [`useTransition` – react.dev](https://react.dev/reference/react/useTransition)
- [`useDeferredValue` – react.dev](https://react.dev/reference/react/useDeferredValue)
- [`startTransition` – react.dev](https://react.dev/reference/react/startTransition)
- [React v18.0: what is concurrent React? – react.dev blog](https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react)
- [`<Suspense>`: preventing already revealed content from hiding – react.dev](https://react.dev/reference/react/Suspense#preventing-already-revealed-content-from-hiding)
- [Snappy UI optimization with useDeferredValue – Josh W. Comeau](https://www.joshwcomeau.com/react/use-deferred-value/)
- [`MutationObserver` – MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
