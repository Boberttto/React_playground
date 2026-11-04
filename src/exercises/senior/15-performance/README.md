# 15 – Performance: memo, useMemo, useCallback & the React Compiler

**Level:** Senior · **Time:** ~45 min

## Goal
A dashboard renders an **expensive list** (it busy-waits ~120 ms per render) next to an
unrelated counter. Every click on the counter freezes the UI, because the parent re-renders and
drags the slow list with it. Fix it by hand with `memo`, `useMemo` and `useCallback`, measure it,
then see how the **React Compiler** (enabled in this project) makes nearly all of that unnecessary.

## Concepts
- **Why a child re-renders.** When a component's state changes, React re-renders it **and all its
  descendants** by default. Props don't need to change. Rendering is usually cheap, so this is fine,
  until one child is slow.
- **`memo(Component)`** tells React to compare the new props with the previous ones
  (`Object.is`, prop by prop) and skip the render if they're all equal. It's a *performance hint*,
  not a guarantee. React may still re-render, and the component must still be correct if it does.
- **Referential equality breaks `memo`.** `[] !== []` and `(() => {}) !== (() => {})`. A parent that
  creates a new array (`items.filter(…)`) or a new callback every render defeats `memo` completely.
  - `useMemo(fn, deps)` caches a **computed value** until a dependency changes.
  - `useCallback(fn, deps)` caches a **function** (it's `useMemo(() => fn, deps)`).
  - Updater functions (`setX(prev => …)`) let callbacks avoid depending on state, so they stay stable.
- **Before you memo, restructure.** Often you can avoid memoization entirely by *moving state down*
  (put the counter in its own component) or *lifting content up* (pass the slow list as `children`).
  The slow subtree then isn't a descendant of the state that changes. See Dan Abramov's article in Sources.
- **Measure, don't guess.** `<Profiler id onRender>` calls back after every commit of its subtree with
  `phase` (`mount` / `update`) and `actualDuration`. The React DevTools **Profiler** tab shows the same
  data as flame graphs. Enable *"Highlight updates when components render"* to watch re-renders live.
  (`<Profiler>` is disabled in production builds unless you use a profiling build.)
- **The React Compiler** analyses your components at build time and inserts the caching for you. It
  memoizes computed values, callbacks **and JSX elements**. Unchanged inputs give the *same element
  object*, and React skips re-rendering a child whose element is identical, even without `memo`.
  That's why `CompiledDashboard` passes the test with **zero** manual memoization.
  - It only works if your code follows the **Rules of React** (pure render, no mutation of props/state,
    hooks at the top level). If it can't prove safety, it silently skips that component.
  - `'use no memo'` (first statement of a function body or file) opts a component **out**. It's meant
    as a temporary escape hatch for debugging, and it's what this exercise uses to show the "before".
  - Manual `useMemo`/`useCallback` still work with the compiler. They remain useful as an escape hatch
    when you need a *guaranteed* stable reference (e.g. an effect dependency), but in new code you
    rarely write them.

## Tasks
Open `Exercise.tsx`. Both `SlowList` and `Dashboard` start with `'use no memo'`, so the compiler
ignores them. **Leave the directives in** for tasks 1–4.

1. Play with the **Manual** variant in the playground: click *Clicked N times* and notice the lag.
   Open the console. Each click logs a `SlowList update` of ~120 ms.
2. Wrap `SlowList` in **`memo`**. Click again. *Still slow!* Why? (Look at what `Dashboard` passes.)
3. In `Dashboard`, memoize `visible` with **`useMemo`** (deps: `products`, `query`).
4. Stabilize `handleSelect` with **`useCallback`**. Use the updater form so the deps array is empty.
   Now the counter is instant and the console stays quiet, while filtering still updates the list.
5. Compare with the compiler. Switch the playground to **React Compiler**: it's instant too, with no
   manual memoization. Then, as an experiment, delete `'use no memo'` from `Dashboard` *and* remove
   your `useMemo`/`useCallback`. The tests still pass. In one sentence, explain *what* the compiler
   cached that made `SlowList` skip rendering even when it isn't wrapped in `memo`. (Restore afterwards
   if you like.)
6. Open the React DevTools **Profiler** tab, record a few counter clicks with each variant and compare
   the flame graphs. In **Components**, compiled components show a ✨ *Memo* badge.

## Check yourself
```bash
npm test -- 15-performance
```
The tests can't measure milliseconds reliably, so they assert the observable proxy: **how many times
`SlowList` renders** (via a `<Profiler>` inside it) when unrelated vs. related state changes.
On the starter, the `CompiledDashboard` tests already pass, and only the manual ones fail.

## Hints
<details><summary>Hint 1 – memo with a named function</summary>

`export const SlowList = memo(function SlowList(props: SlowListProps) { … })`. The inner name keeps
a readable display name in DevTools and stack traces.
</details>
<details><summary>Hint 2 – "I added memo and nothing changed"</summary>

`memo` compares props with `Object.is`. Log `prevItems === items` across renders: `filter()` returns
a brand-new array every time, and `handleSelect` is a brand-new function every time.
</details>
<details><summary>Hint 3 – an empty deps array for the callback</summary>

`useCallback((id: number) => setSelectedId(prev => (prev === id ? null : id)), [])`. The callback
never reads `selectedId` from the closure, so it never goes stale. State setters are always stable.
</details>

## Going further
- Fix the slowness **without any memoization**. Move the counter into its own `<ClickCounter />`
  component (state colocation). Why does that work?
- Make the filter itself feel instant while the list catches up. That's `useDeferredValue` (exercise 16).
- Virtualization (`react-window`, TanStack Virtual) is the real answer for 10k+ rows. Memoization only
  avoids *re*-renders, and it doesn't make one render cheaper.
- Read the compiler's output. Paste `CompiledDashboard` into the
  [React Compiler Playground](https://playground.react.dev/) and look for the `$[n]` cache slots.

## Sources
- [`memo` – react.dev](https://react.dev/reference/react/memo)
- [`useMemo` – react.dev](https://react.dev/reference/react/useMemo)
- [`useCallback` – react.dev](https://react.dev/reference/react/useCallback)
- [`<Profiler>` – react.dev](https://react.dev/reference/react/Profiler)
- [React Compiler: introduction – react.dev](https://react.dev/learn/react-compiler/introduction)
- [`'use no memo'` directive – react.dev](https://react.dev/reference/react-compiler/directives/use-no-memo)
- [Before You memo() – Dan Abramov, overreacted.io](https://overreacted.io/before-you-memo/)
- [When to useMemo and useCallback – Kent C. Dodds](https://kentcdodds.com/blog/usememo-and-usecallback)
