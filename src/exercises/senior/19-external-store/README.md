# 19 – External store: build a tiny Zustand with useSyncExternalStore

**Level:** Senior · **Time:** ~45 min

## Goal
Write a framework-agnostic store (`createStore` with `getState` / `setState` / `subscribe`) and a
`useStore(store, selector)` hook that connects it to React correctly, without tearing, with
fine-grained re-renders and SSR support. That's the core of Zustand, in about 40 lines.

## Concepts
- **External store** = state that lives *outside* React: a module variable, `localStorage`,
  `window.location`, a WebSocket cache, Redux/Zustand… React doesn't own it, so React doesn't know
  when it changes. You need a **subscription**. (The playground shell itself reads `location.hash`
  this way: see `src/router.ts`.)
- **The store contract (pub/sub).** `subscribe(listener)` returns an `unsubscribe` function.
  `setState` replaces the state with a **new object** and calls every listener. Listeners don't
  receive the state: they only learn *that* something changed, then re-read what they care about.
- **`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)`**
  - `subscribe` must be **stable**. A new function every render means unsubscribe/resubscribe on every
    render. Defining it once per store solves that.
  - `getSnapshot` is called on every render *and* after each notification. React compares results
    with `Object.is` and only re-renders when they differ. Return a selected **slice** and you get
    fine-grained updates for free: renaming doesn't re-render the count.
  - `getSnapshot` must return a **cached** value. `() => ({ count: s.count })` builds a new object on
    every call, so React sees "changed" forever. You get the warning *"The result of getSnapshot should
    be cached"* and an infinite loop. Select primitives, or memoize the selection (Zustand's
    `useShallow`, or `useSyncExternalStoreWithSelector` with an equality function).
  - `getServerSnapshot` is used during server rendering **and hydration**. It must give the same value
    on the server and on the client's first render. Initial state is the safe choice. Without it,
    server rendering throws.
- **Tearing.** With concurrent rendering (exercise 16), React may pause a render halfway. If a
  `useState` + `useEffect(subscribe)` binding reads a mutable store, components rendered *before* the
  change and *after* it can show different values **in the same frame**. That's a "torn" UI.
  `useSyncExternalStore` checks the snapshot again before committing, and if it moved, it re-renders
  synchronously, so the screen stays consistent. (The naive approach also misses updates that happen
  between render and the effect's subscription.)
- **Immutability is load-bearing.** Mutating `state.count++` keeps the same reference, so `Object.is`
  says "unchanged" and nothing re-renders.

## Tasks
Open `Exercise.tsx`.

1. In `createStore`, keep the listeners in a `Set<Listener>`.
2. Implement `setState(partial)`:
   - resolve `partial` (it may be `(state) => partial`);
   - if `Object.is(next, state)`, return without notifying;
   - otherwise `state = { ...state, ...next }` (new object), then notify every listener.
3. Implement `subscribe(listener)`: add it, and return a function that deletes it.
4. Rewrite `useStore` with `useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot)`,
   where `getSnapshot = () => selector(store.getState())` and
   `getServerSnapshot = () => selector(store.getInitialState())`.
5. In the playground, open the console. Click **+1** and only `CountDisplay` logs a render. Type a
   name and only `NameDisplay` does. Try **+10 in 0.5 s**: updates from outside React just work.
6. Experiment: change `CountDisplay`'s selector to `(s) => ({ count: s.count })` and watch the console.
   Then revert it.

## Check yourself
```bash
npm test -- 19-external-store
```
Tests cover the store on its own (no React), re-rendering on external `setState`, render counts per
slice (via `<Profiler>`), subscription cleanup, and `renderToString` using the server snapshot.

## Hints
<details><summary>Hint 1 – resolving the partial</summary>

```ts
const next = typeof partial === 'function' ? partial(state) : partial
```
TypeScript narrows correctly because `T extends object` and a state object is never a function.
</details>
<details><summary>Hint 2 – the hook is one call</summary>

```ts
return useSyncExternalStore(
  store.subscribe,
  () => selector(store.getState()),
  () => selector(store.getInitialState()),
)
```
</details>
<details><summary>Hint 3 – "my test with renderToString shows 42, not 0"</summary>

During SSR React uses `getServerSnapshot`, not `getSnapshot`. Return the *initial* state there.
</details>

## Going further
- Add an `equalityFn` parameter (`shallow`) so object selectors work. Look at how
  `useSyncExternalStoreWithSelector` (package `use-sync-external-store/with-selector`) caches the last
  selection.
- Add middleware: `persist` (write to `localStorage` on each change) or a `devtools` logger that wraps
  `setState`.
- Why does Zustand keep a store **outside** React instead of in context? What changes when you need
  one store *per request* on the server (Next.js)? Read the Zustand docs on that.
- Use `useSyncExternalStore` with a browser API: `navigator.onLine` with the `online`/`offline` events.

## Sources
- [`useSyncExternalStore` – react.dev](https://react.dev/reference/react/useSyncExternalStore)
- [`useSyncExternalStore`: subscribing to a browser API – react.dev](https://react.dev/reference/react/useSyncExternalStore#subscribing-to-a-browser-api)
- [What is tearing? – React 18 Working Group discussion](https://github.com/reactwg/react-18/discussions/69)
- [`useMutableSource` → `useSyncExternalStore` – React 18 Working Group](https://github.com/reactwg/react-18/discussions/86)
- [Zustand – GitHub (see `src/vanilla.ts` and `src/react.ts`)](https://github.com/pmndrs/zustand)
- [`renderToString` – react.dev](https://react.dev/reference/react-dom/server/renderToString)
