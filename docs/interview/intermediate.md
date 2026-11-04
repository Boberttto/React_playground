# Intermediate React Interview Questions

> **Level legend:** 🟢 [Junior](./junior.md) · 🟡 Intermediate (this file) · 🔴 [Senior](./senior.md) · 🪤 [Trick questions](./trick-questions.md)
>
> Target: React 19.3, TypeScript, Vite 8, React Compiler 1.0 (as of November 2026).
> Answer each question **out loud** before opening the `Answer` block.

## Table of contents

1. [What are the Rules of Hooks, and why do they exist?](#1-what-are-the-rules-of-hooks-and-why-do-they-exist)
2. [What is a custom Hook, and what does it share?](#2-what-is-a-custom-hook-and-what-does-it-share)
3. [`useReducer` vs `useState`: when do you pick which?](#3-usereducer-vs-usestate-when-do-you-pick-which)
4. [How do you create and consume Context in React 19?](#4-how-do-you-create-and-consume-context-in-react-19)
5. [What is the re-render cost of Context, and how do you limit it?](#5-what-is-the-re-render-cost-of-context-and-how-do-you-limit-it)
6. [`useRef`: what is it for, and how is it different from state?](#6-useref-what-is-it-for-and-how-is-it-different-from-state)
7. [How do you pass a ref to a child component in React 19?](#7-how-do-you-pass-a-ref-to-a-child-component-in-react-19)
8. [What is `useImperativeHandle` for?](#8-what-is-useimperativehandle-for)
9. [`useMemo`, `useCallback` and `memo`: what do they do, and do you still need them with the React Compiler?](#9-usememo-usecallback-and-memo-what-do-they-do-and-do-you-still-need-them-with-the-react-compiler)
10. [How do you choose an Effect's dependencies?](#10-how-do-you-choose-an-effects-dependencies)
11. [Why do Effects need cleanup? Show a data-fetching race condition.](#11-why-do-effects-need-cleanup-show-a-data-fetching-race-condition)
12. [When should you NOT use an Effect?](#12-when-should-you-not-use-an-effect)
13. [What are Error Boundaries and what do they not catch?](#13-what-are-error-boundaries-and-what-do-they-not-catch)
14. [How do `Suspense` and `lazy` work together?](#14-how-do-suspense-and-lazy-work-together)
15. [How does client-side routing work in a React app?](#15-how-does-client-side-routing-work-in-a-react-app)
16. [What are Actions in React 19, and what does `useActionState` do?](#16-what-are-actions-in-react-19-and-what-does-useactionstate-do)
17. [What does `useFormStatus` do and what is its main gotcha?](#17-what-does-useformstatus-do-and-what-is-its-main-gotcha)
18. [How does `useOptimistic` work?](#18-how-does-useoptimistic-work)
19. [What are portals, and how do events behave in them?](#19-what-are-portals-and-how-do-events-behave-in-them)
20. [How do you test components with React Testing Library?](#20-how-do-you-test-components-with-react-testing-library)
21. [How do you type components, props, events and refs in TypeScript?](#21-how-do-you-type-components-props-events-and-refs-in-typescript)
22. [What is `useId` for?](#22-what-is-useid-for)

---

### 1. What are the Rules of Hooks, and why do they exist?
<details><summary>Answer</summary>

1. **Only call Hooks at the top level** of a component or custom Hook: not inside conditions, loops, nested functions, `try/catch`, or after an early return.
2. **Only call Hooks from React functions** (components or custom Hooks), not from regular functions or class components.

Why: React doesn't identify Hooks by name. It stores each component's Hook state in an ordered list and matches them **by call order** on every render. If a Hook call is skipped conditionally, every Hook after it reads the wrong slot.

```tsx
// ❌ Breaks call order
if (user) {
  const [name, setName] = useState(user.name);
}

// ✅ Call unconditionally, branch inside
const [name, setName] = useState(user?.name ?? '');
```

Exception: `use()` (React 19) **can** be called conditionally, because it doesn't store state in a slot.

The `eslint-plugin-react-hooks` rules (`rules-of-hooks`, `exhaustive-deps`, and, since v6, compiler-powered rules in the `recommended` preset) enforce these automatically.

**Why it matters / follow-up:** The strong answer explains the *mechanism* (call order), not just the rule. Follow-up: "Why not identify Hooks by a key instead?" Dan Abramov's post explains the trade-offs (name clashes, composition problems).

**Sources:** [Rules of Hooks – react.dev](https://react.dev/reference/rules/rules-of-hooks), [Why Do React Hooks Rely on Call Order? – overreacted.io](https://overreacted.io/why-do-hooks-rely-on-call-order/), [eslint-plugin-react-hooks – react.dev](https://react.dev/reference/eslint-plugin-react-hooks), [use – react.dev](https://react.dev/reference/react/use)
</details>

### 2. What is a custom Hook, and what does it share?
<details><summary>Answer</summary>

A custom Hook is a function whose name starts with `use` and that calls other Hooks. It lets you **reuse stateful logic** between components.

```tsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return isOnline;
}
```

Crucial point: custom Hooks share **logic, not state**. Each component calling `useOnlineStatus()` gets its own independent state. To share state, lift it up, use Context or an external store.

The `use` prefix matters: it tells the linter (and the React Compiler) that the function follows the Rules of Hooks. Don't prefix a function with `use` if it calls no Hooks.

**Why it matters / follow-up:** "When would you extract a custom Hook?" When an Effect synchronizes with an external system in a reusable way, or to give a complex piece of logic a clear name. For this specific example, `useSyncExternalStore` is even better (see senior).

**Sources:** [Reusing Logic with Custom Hooks – react.dev](https://react.dev/learn/reusing-logic-with-custom-hooks)
</details>

### 3. `useReducer` vs `useState`: when do you pick which?
<details><summary>Answer</summary>

Both store state. `useReducer(reducer, initialArg, init?)` moves update logic into a **pure function** `(state, action) => newState`.

Prefer `useReducer` when:
- Several pieces of state change together, or the next state depends on the previous one in non-trivial ways.
- Many event handlers update the same state (centralize the logic and describe *what happened* via actions).
- You want to unit-test update logic without rendering.

```tsx
type State = { items: Item[]; status: 'idle' | 'saving' };
type Action = { type: 'added'; item: Item } | { type: 'saved' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'added': return { ...state, items: [...state.items, action.item] };
    case 'saved': return { ...state, status: 'idle' };
  }
}

const [state, dispatch] = useReducer(reducer, { items: [], status: 'idle' });
```

`dispatch` is stable (same identity across renders), so it's safe to pass down, e.g. through Context. Reducers must be pure; StrictMode calls them twice in development.

**Why it matters / follow-up:** "useReducer + Context, is that Redux?" It covers some cases, but without middleware, devtools, or selector-based subscriptions (every consumer re-renders when the context value changes).

**Sources:** [useReducer – react.dev](https://react.dev/reference/react/useReducer), [Extracting State Logic into a Reducer – react.dev](https://react.dev/learn/extracting-state-logic-into-a-reducer), [Should I useState or useReducer? – kentcdodds.com](https://kentcdodds.com/blog/should-i-usestate-or-usereducer)
</details>

### 4. How do you create and consume Context in React 19?
<details><summary>Answer</summary>

Context passes data deeply without threading props through every level.

```tsx
import { createContext, use, useContext, useState } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<Theme>('light');

function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  // React 19: render the context itself as the provider
  return (
    <ThemeContext value={theme}>
      <Toolbar />
    </ThemeContext>
  );
}

function Button() {
  const theme = useContext(ThemeContext); // classic
  // or: const theme = use(ThemeContext);  // can be called conditionally
  return <button className={theme}>OK</button>;
}
```

- **React 19**: `<ThemeContext value>` replaces `<ThemeContext.Provider value>` (`.Provider` still works but will be deprecated).
- A component reads the value from the **closest provider above it**; without one, it gets the default passed to `createContext`.
- `use(Context)` behaves like `useContext` but can be called inside `if` blocks.
- Since 19.3, Server Components can render a Context (imported from a `'use client'` module) directly.

**Why it matters / follow-up:** "Context or prop drilling?" Context is for data many components at different depths need (theme, current user, locale). Try composition with `children` first.

**Sources:** [createContext – react.dev](https://react.dev/reference/react/createContext), [useContext – react.dev](https://react.dev/reference/react/useContext), [Passing Data Deeply with Context – react.dev](https://react.dev/learn/passing-data-deeply-with-context), [React v19 – react.dev blog](https://react.dev/blog/2024/12/05/react-19), [React 19.3 – react.dev blog](https://react.dev/blog/2026/09/09/react-19-3)
</details>

### 5. What is the re-render cost of Context, and how do you limit it?
<details><summary>Answer</summary>

When a provider's `value` changes (compared with `Object.is`), **every component that reads that context re-renders**, even if it only uses one field, and `memo` on intermediate components doesn't stop it. There's no built-in selector.

Mitigations:
1. **Keep the value stable**: an inline object `value={{ user, setUser }}` is a new object every render of the provider. Memoize it (`useMemo`), or let the React Compiler do it.
2. **Split contexts** by update frequency: e.g. `StateContext` and `DispatchContext` (dispatch never changes), or theme vs. user.
3. **Push the provider down** so fewer components sit beneath it.
4. **For frequently changing, widely shared data**, use an external store with selectors (Zustand, Redux, `useSyncExternalStore`) so components subscribe to slices.

```tsx
function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  return (
    <TasksContext value={tasks}>
      <TasksDispatchContext value={dispatch}>{children}</TasksDispatchContext>
    </TasksContext>
  );
}
```

**Why it matters / follow-up:** Context is a dependency-injection mechanism, not a state manager. Follow-up: "Would you put form input state in a global context?" No, every keystroke would re-render all consumers.

**Sources:** [useContext (optimizing re-renders) – react.dev](https://react.dev/reference/react/useContext), [Scaling Up with Reducer and Context – react.dev](https://react.dev/learn/scaling-up-with-reducer-and-context), [How to use React Context effectively – kentcdodds.com](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
</details>

### 6. `useRef`: what is it for, and how is it different from state?
<details><summary>Answer</summary>

`useRef(initial)` returns a mutable object `{ current }` that **persists across renders**. Changing `ref.current` **does not trigger a re-render**.

Use cases:
- Holding a **DOM node** (`<input ref={inputRef} />` → `inputRef.current.focus()`).
- Storing values that don't affect the output: timer IDs, the previous value, an `AbortController`, an instance of a third-party library.

| | `useState` | `useRef` |
|---|---|---|
| Triggers re-render on change | Yes | No |
| Value during render | Snapshot | Mutable, latest |
| Read/write during render | Read ✅ | ❌ Avoid (except lazy init) |

Don't read or write `ref.current` during rendering (except for one-time initialization): it makes the component impure, and the React Compiler's `refs` lint rule flags it.

In React 19 TypeScript types, `useRef` requires an argument (`useRef<HTMLInputElement>(null)`), and all refs are mutable `RefObject<T>`.

**Why it matters / follow-up:** "When would a ref be a bug?" When the value is displayed: the UI won't update.

**Sources:** [useRef – react.dev](https://react.dev/reference/react/useRef), [Referencing Values with Refs – react.dev](https://react.dev/learn/referencing-values-with-refs), [Manipulating the DOM with Refs – react.dev](https://react.dev/learn/manipulating-the-dom-with-refs), [React 19 Upgrade Guide – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
</details>

### 7. How do you pass a ref to a child component in React 19?
<details><summary>Answer</summary>

In React 19, **`ref` is a regular prop** for function components. `forwardRef` is no longer needed (it still works, but will be deprecated).

```tsx
function TextInput({ ref, ...props }: React.ComponentProps<'input'>) {
  return <input ref={ref} {...props} />;
}

function Form() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <TextInput ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
    </>
  );
}
```

Also new in 19: **callback refs can return a cleanup function**, called when the element is removed (instead of calling the callback with `null`):

```tsx
<div
  ref={node => {
    const observer = new ResizeObserver(() => { /* ... */ });
    observer.observe(node);
    return () => observer.disconnect();
  }}
/>
```

Because of this, TypeScript rejects implicit returns in ref callbacks (`ref={n => (x = n)}` → use a block body). Accessing `element.ref` is deprecated in favor of `element.props.ref`.

**Why it matters / follow-up:** Classic outdated-knowledge check. Follow-up: "When should a component expose a ref at all?" For low-level, reusable components (inputs, buttons) where parents legitimately need focus/scroll/measure.

**Sources:** [React v19 – react.dev blog](https://react.dev/blog/2024/12/05/react-19), [forwardRef – react.dev](https://react.dev/reference/react/forwardRef), [Manipulating the DOM with Refs – react.dev](https://react.dev/learn/manipulating-the-dom-with-refs), [React 19 Upgrade Guide – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
</details>

### 8. What is `useImperativeHandle` for?
<details><summary>Answer</summary>

It customizes **what a parent receives through a ref**: instead of the raw DOM node, you expose a small, explicit API.

```tsx
type VideoHandle = { play: () => void; pause: () => void };

function VideoPlayer({ ref, src }: { ref?: React.Ref<VideoHandle>; src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
  }), []);
  return <video ref={videoRef} src={src} />;
}
```

It's an **escape hatch**: use it for imperative behaviors that can't be expressed as props (focus, scroll, play/pause, opening a native dialog). If something can be a prop (`isOpen`), make it a prop.

**Why it matters / follow-up:** Shows you know refs break the declarative model and should stay limited. In React 19 you receive `ref` as a prop and pass it to `useImperativeHandle`, no `forwardRef` wrapper.

**Sources:** [useImperativeHandle – react.dev](https://react.dev/reference/react/useImperativeHandle), [Manipulating the DOM with Refs – react.dev](https://react.dev/learn/manipulating-the-dom-with-refs)
</details>

### 9. `useMemo`, `useCallback` and `memo`: what do they do, and do you still need them with the React Compiler?
<details><summary>Answer</summary>

- **`useMemo(fn, deps)`** caches a computed **value** between renders until a dependency changes.
- **`useCallback(fn, deps)`** caches a **function** identity (equivalent to `useMemo(() => fn, deps)`).
- **`memo(Component)`** makes a component skip re-rendering when its props are shallowly equal (`Object.is` per prop) to the previous ones.

They work together: `memo` is useless if the parent passes a new object/function every render, which is why `useCallback`/`useMemo` exist.

```tsx
const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
const handleSubmit = useCallback((data: Order) => post(productId, data), [productId]);
const List = memo(function List({ items }: { items: Todo[] }) { /* ... */ });
```

**With React Compiler 1.0** (enabled in this repo via `reactCompilerPreset`), components and Hooks are memoized automatically at build time, often more granularly than by hand (even after early returns). Official guidance:
- **New code**: rely on the compiler; use `useMemo`/`useCallback` only as escape hatches for precise control (e.g. a value used as an Effect dependency).
- **Existing code**: leave existing memoization in place or remove it carefully with tests (removing it can change the compiled output).

These are **performance optimizations**, never a semantic guarantee: React may discard cached values.

**Why it matters / follow-up:** "How do you know a calculation is expensive?" Measure (`console.time`, React DevTools Profiler) with a production build and CPU throttling before optimizing.

**Sources:** [useMemo – react.dev](https://react.dev/reference/react/useMemo), [useCallback – react.dev](https://react.dev/reference/react/useCallback), [memo – react.dev](https://react.dev/reference/react/memo), [Introduction to React Compiler – react.dev](https://react.dev/learn/react-compiler/introduction), [React Compiler v1.0 – react.dev blog](https://react.dev/blog/2025/10/07/react-compiler-1)
</details>

### 10. How do you choose an Effect's dependencies?
<details><summary>Answer</summary>

You don't "choose" them: **every reactive value used inside the Effect must be listed** (props, state, context, and anything computed from them inside the component). The `exhaustive-deps` lint rule tells you what's missing. To change the dependencies, **change the code**, not the array.

Techniques to remove a dependency legitimately:
- **Move objects/functions inside the Effect** (or outside the component if they don't use props/state), so they're not new on every render.
- **Use an updater function**: `setCount(c => c + 1)` instead of reading `count`.
- **Depend on primitives**: `[options.roomId]` instead of `[options]`.
- **Extract non-reactive logic into an Effect Event** with `useEffectEvent` (stable since React 19.2): it always sees the latest props/state but doesn't make the Effect re-run.

```tsx
const onConnected = useEffectEvent(() => {
  showNotification('Connected!', theme); // reads latest theme
});

useEffect(() => {
  const connection = createConnection(serverUrl, roomId);
  connection.on('connected', () => onConnected());
  connection.connect();
  return () => connection.disconnect();
}, [roomId]); // theme is NOT a dependency
```

Never suppress the lint rule with `// eslint-disable-next-line`: it causes stale-closure bugs.

**Why it matters / follow-up:** "Can an Effect Event be passed to children or listed in deps?" No. Call it only from inside Effects.

**Sources:** [Lifecycle of Reactive Effects – react.dev](https://react.dev/learn/lifecycle-of-reactive-effects), [Removing Effect Dependencies – react.dev](https://react.dev/learn/removing-effect-dependencies), [Separating Events from Effects – react.dev](https://react.dev/learn/separating-events-from-effects), [useEffectEvent – react.dev](https://react.dev/reference/react/useEffectEvent), [React 19.2 – react.dev blog](https://react.dev/blog/2025/10/01/react-19-2)
</details>

### 11. Why do Effects need cleanup? Show a data-fetching race condition.
<details><summary>Answer</summary>

Cleanup undoes what the Effect set up (unsubscribe, clear timer, disconnect, abort). React runs it **before the Effect re-runs** with new dependencies and **on unmount**. Without it you get leaks, duplicate subscriptions, and **race conditions**:

If `userId` changes from 1 to 2 quickly, the response for 1 may arrive after the one for 2 and overwrite it.

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(err => {
      if (err.name !== 'AbortError') setError(err);
    });
  return () => controller.abort(); // ignore/cancel the stale request
}, [userId]);
```

(An `ignore` boolean flag set in cleanup also works.)

StrictMode's extra mount → unmount → mount in development exists precisely to expose missing cleanup.

**Why it matters / follow-up:** "Would you write data fetching like this in production?" Usually not: you'd also need caching, deduplication, retries and loading states. Prefer framework loaders, Server Components, or TanStack Query.

**Sources:** [Synchronizing with Effects – react.dev](https://react.dev/learn/synchronizing-with-effects), [useEffect – react.dev](https://react.dev/reference/react/useEffect), [AbortController – MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), [A Complete Guide to useEffect – overreacted.io](https://overreacted.io/a-complete-guide-to-useeffect/)
</details>

### 12. When should you NOT use an Effect?
<details><summary>Answer</summary>

Effects are an escape hatch to sync with **external systems**. You don't need one to:

- **Derive data** from props/state: compute it during render (memoize only if expensive).
  ```tsx
  // ❌ const [fullName, setFullName] = useState(''); useEffect(() => setFullName(first + ' ' + last), [first, last]);
  const fullName = `${first} ${last}`; // ✅
  ```
- **Respond to a user event** (submit, click, POST request): do it in the event handler, where you know *what* happened.
- **Reset state when a prop changes**: give the component a `key` (`<Profile key={userId} />`).
- **Adjust part of the state when a prop changes**: compute it during render, or store an ID instead of an object.
- **Notify a parent about a state change**: call the parent's callback in the same event handler.
- **Chain state updates** (Effect sets state that triggers another Effect...): compute everything in the handler.

Each unnecessary Effect costs an extra render pass and makes data flow harder to follow. The React Compiler's lint rules (e.g. `set-state-in-effect`) flag some of these patterns.

**Why it matters / follow-up:** This is one of the most common real-world code-review findings. "Where does data fetching fit?" It's legitimately synchronization, but frameworks/libraries do it better.

**Sources:** [You Might Not Need an Effect – react.dev](https://react.dev/learn/you-might-not-need-an-effect), [Don't Sync State. Derive It! – kentcdodds.com](https://kentcdodds.com/blog/dont-sync-state-derive-it), [eslint-plugin-react-hooks – react.dev](https://react.dev/reference/eslint-plugin-react-hooks)
</details>

### 13. What are Error Boundaries and what do they not catch?
<details><summary>Answer</summary>

An Error Boundary is a component that catches errors thrown **during rendering, in lifecycle methods and in constructors** of its descendants, and shows a fallback UI instead of unmounting the whole app. There is still **no Hook equivalent**: you write a class with `static getDerivedStateFromError` (render fallback) and/or `componentDidCatch` (log), or use a library like `react-error-boundary`.

```tsx
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(error, info.componentStack);
  }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}
```

**Not caught:** errors in **event handlers** (use `try/catch`), in asynchronous code (`setTimeout`, promises outside rendering), during server rendering, and errors thrown in the boundary itself. Errors thrown by an Action (form `action`, `startTransition`) **are** surfaced to the nearest boundary.

React 19 also stopped re-throwing render errors and added root options `onUncaughtError`, `onCaughtError` and `onRecoverableError` on `createRoot`/`hydrateRoot` for centralized reporting.

**Why it matters / follow-up:** "Where do you place boundaries?" At route level and around independent widgets, so one failing widget doesn't blank the page. Pair them with Suspense boundaries.

**Sources:** [Component (catching rendering errors with an error boundary) – react.dev](https://react.dev/reference/react/Component), [createRoot – react.dev](https://react.dev/reference/react-dom/client/createRoot), [React 19 Upgrade Guide – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
</details>

### 14. How do `Suspense` and `lazy` work together?
<details><summary>Answer</summary>

`lazy(() => import('./Settings'))` defines a component whose code is loaded **on first render** (a separate chunk via dynamic `import()`). While it loads, the component **suspends**, and the closest `<Suspense fallback>` above it shows its fallback.

```tsx
import { lazy, Suspense } from 'react';

const Settings = lazy(() => import('./Settings')); // declared at module top level

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Settings />
    </Suspense>
  );
}
```

- Declare `lazy` components at the **module top level**, never inside a component (it would reset state on every render).
- The imported module must have a **default export** that is a component.
- Suspense also works with Suspense-enabled data sources: `use(promise)`, frameworks, TanStack Query's `useSuspenseQuery`. It does **not** detect data fetched inside an Effect.
- If an update to already-visible content suspends, wrapping it in `startTransition` keeps the old UI visible instead of flashing the fallback.
- React 19 commits the fallback immediately when something suspends, then "pre-warms" the suspended siblings.

**Why it matters / follow-up:** "Where do you split?" Routes first, then heavy, rarely used widgets (editors, charts, modals). Pair with an Error Boundary for chunk-loading failures.

**Sources:** [lazy – react.dev](https://react.dev/reference/react/lazy), [`<Suspense>` – react.dev](https://react.dev/reference/react/Suspense), [React 19 Upgrade Guide – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
</details>

### 15. How does client-side routing work in a React app?
<details><summary>Answer</summary>

React itself has no router. A router maps the URL to a component tree, uses the **History API** to change the URL without a full page reload, and intercepts link clicks. This repo uses **React Router v7**, which has three modes:

- **Declarative mode**: `<BrowserRouter>`, `<Routes>`, `<Route>`, `<Link>`, `useNavigate`, `useParams`. Just routing.
- **Data mode**: `createBrowserRouter` with route objects that can declare `loader`s, `action`s, error elements and lazy routes, rendered with `<RouterProvider>`. Data loads **before** rendering, avoiding fetch waterfalls in Effects.
- **Framework mode**: the Vite plugin adds file-based route config, SSR, type-safe route modules, code splitting (the successor of Remix).

```tsx
const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'users/:id', loader: ({ params }) => getUser(params.id), Component: User },
    ],
  },
]);
createRoot(root).render(<RouterProvider router={router} />);
```

Alternatives: TanStack Router (strongly typed), Next.js App Router.

**Why it matters / follow-up:** "Why use loaders instead of `useEffect`?" Parallel fetching per route, no render-then-fetch waterfall, built-in pending/error states. "What must a static host do for SPA routing?" Rewrite unknown paths to `index.html`.

**Sources:** [React Router – Picking a Mode – reactrouter.com](https://reactrouter.com/start/modes), [Routing (data mode) – reactrouter.com](https://reactrouter.com/start/data/routing), [Data Loading – reactrouter.com](https://reactrouter.com/start/data/data-loading), [Creating a React App – react.dev](https://react.dev/learn/creating-a-react-app)
</details>

### 16. What are Actions in React 19, and what does `useActionState` do?
<details><summary>Answer</summary>

An **Action** is a function that runs inside a Transition, often async. React tracks its pending state, errors and optimistic updates for you. You can pass a function to `<form action={fn}>`, `<button formAction={fn}>`, or call it inside `startTransition`. With a form action, React passes a `FormData`, and after a successful submission it **resets uncontrolled fields** automatically.

`useActionState` wraps an Action and gives you its result as state:

```tsx
import { useActionState } from 'react';

async function updateName(prevState: string | null, formData: FormData) {
  const error = await saveName(formData.get('name') as string);
  return error ?? null; // returned value becomes the new state
}

function ChangeName() {
  const [error, submitAction, isPending] = useActionState(updateName, null);
  return (
    <form action={submitAction}>
      <input name="name" />
      <button type="submit" disabled={isPending}>Update</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

- Signature: `const [state, dispatchAction, isPending] = useActionState(action, initialState, permalink?)`; the action receives `(previousState, payload)`.
- Imported from **`react`** (it was briefly `useFormState` in `react-dom` canaries).
- Dispatches are **queued and run in order**. Calling `dispatchAction` outside a Transition or Action prop logs a warning and `isPending` won't update.
- Return expected errors as state; thrown errors go to the nearest Error Boundary.
- Works with Server Functions (with progressive enhancement via `permalink`).

**Why it matters / follow-up:** "What did this replace?" The manual `isPending`/`error` `useState` boilerplate around async submits.

**Sources:** [useActionState – react.dev](https://react.dev/reference/react/useActionState), [`<form>` – react.dev](https://react.dev/reference/react-dom/components/form), [React v19 – react.dev blog](https://react.dev/blog/2024/12/05/react-19)
</details>

### 17. What does `useFormStatus` do and what is its main gotcha?
<details><summary>Answer</summary>

`useFormStatus()` (from **`react-dom`**) returns `{ pending, data, method, action }` for the **parent `<form>`** currently submitting. It lets design-system components (a submit button, a spinner) know about the form without prop drilling.

```tsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}

function Form({ action }: { action: (fd: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
```

**Gotcha:** it must be called from a component **rendered inside** the `<form>`. Calling it in the same component that renders the `<form>` never reports `pending: true`. It also only works with forms using a function `action` (the React Actions mechanism).

**Why it matters / follow-up:** "useFormStatus vs. useActionState's isPending?" `isPending` is for the component that owns the action; `useFormStatus` is for deeply nested children of any form.

**Sources:** [useFormStatus – react.dev](https://react.dev/reference/react-dom/hooks/useFormStatus), [React v19 – react.dev blog](https://react.dev/blog/2024/12/05/react-19)
</details>

### 18. How does `useOptimistic` work?
<details><summary>Answer</summary>

`useOptimistic` shows a temporary, optimistic version of state **while an Action is pending**, then falls back to the real value when it finishes.

```tsx
const [optimisticTodos, addOptimisticTodo] = useOptimistic(
  todos,
  (current, newTodo: Todo) => [...current, { ...newTodo, pending: true }],
);

async function formAction(formData: FormData) {
  const todo = { id: crypto.randomUUID(), title: formData.get('title') as string };
  addOptimisticTodo(todo);         // UI updates immediately
  await createTodo(todo);          // real request
  // parent updates `todos` → optimistic and real state converge
}

return <form action={formAction}>{/* render optimisticTodos */}</form>;
```

- Signature: `const [optimisticState, setOptimistic] = useOptimistic(value, reducer?)`. The setter takes a value, an updater function, or (with a reducer) an action.
- The setter **must be called inside an Action** (`startTransition` or an Action prop). Outside one, React warns and the optimistic value flashes then reverts.
- On **failure**, there's nothing to roll back manually: when the Action ends, `optimisticState` returns to `value`, which wasn't updated. Catch the error to show a message.

**Why it matters / follow-up:** "What are the UX risks?" Optimistic updates that fail must be clearly communicated; don't use them for irreversible operations like payments.

**Sources:** [useOptimistic – react.dev](https://react.dev/reference/react/useOptimistic), [React v19 – react.dev blog](https://react.dev/blog/2024/12/05/react-19)
</details>

### 19. What are portals, and how do events behave in them?
<details><summary>Answer</summary>

`createPortal(children, domNode)` renders children into a **different DOM node** (e.g. `document.body`) while keeping them in the same place in the **React tree**. Used for modals, tooltips, toasts and popovers, to escape `overflow: hidden` or `z-index` stacking contexts.

```tsx
import { createPortal } from 'react-dom';

function Modal({ children }: { children: React.ReactNode }) {
  return createPortal(<div className="modal" role="dialog" aria-modal="true">{children}</div>, document.body);
}
```

Key behavior: the portal's children **still receive context** from their React parents, and **events bubble through the React tree**, not the DOM tree. A click inside a portaled modal triggers `onClick` handlers on React ancestors, even though in the DOM the modal is a child of `<body>`.

Accessibility: you must manage focus (move it into the dialog, trap it, restore it on close) and `Escape` handling. The native `<dialog>` element with `showModal()` handles much of this (top layer, inert background, Escape) and is often a better base.

**Why it matters / follow-up:** "A click in my modal closes the dropdown behind it, why?" React bubbling through the portal. Use `stopPropagation` or check `event.target`.

**Sources:** [createPortal – react.dev](https://react.dev/reference/react-dom/createPortal), [`<dialog>` – MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [Dialog (Modal) Pattern – W3C WAI APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
</details>

### 20. How do you test components with React Testing Library?
<details><summary>Answer</summary>

RTL's principle: *"The more your tests resemble the way your software is used, the more confidence they can give you."* Test **behavior from the user's point of view**, not implementation details (state, internal methods, CSS classes).

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('adds a todo', async () => {
  const user = userEvent.setup();
  render(<TodoApp />);

  await user.type(screen.getByRole('textbox', { name: /new todo/i }), 'Buy milk');
  await user.click(screen.getByRole('button', { name: /add/i }));

  expect(screen.getByRole('listitem')).toHaveTextContent('Buy milk');
});
```

Key practices:
- **Query priority**: `getByRole` (with `name`) > `getByLabelText` > `getByPlaceholderText` > `getByText` > ... > `getByTestId` as last resort. Role queries double as accessibility checks.
- `getBy*` throws if missing, `queryBy*` returns `null` (to assert absence), `findBy*` is async (waits).
- Prefer **`user-event`** over `fireEvent`: it simulates full interactions (focus, keydown, input...).
- Use `screen`, not destructured queries from `render`.
- RTL wraps renders and events in `act()` for you; `act` itself is now exported from `react` (`react-dom/test-utils` was removed in 19).
- Mock the network (e.g. MSW), not your own modules, when possible.
- `react-test-renderer` is deprecated in React 19.

**Why it matters / follow-up:** "What's an implementation detail?" Anything a user or a consuming component can't observe. "Why is my test flaky with async UI?" Use `findBy`/`waitFor` instead of fixed delays.

**Sources:** [Guiding Principles – testing-library.com](https://testing-library.com/docs/guiding-principles/), [About Queries (priority) – testing-library.com](https://testing-library.com/docs/queries/about/), [user-event – testing-library.com](https://testing-library.com/docs/user-event/intro/), [Common mistakes with React Testing Library – kentcdodds.com](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library), [React 19 Upgrade Guide – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
</details>

### 21. How do you type components, props, events and refs in TypeScript?
<details><summary>Answer</summary>

```tsx
import type { ComponentProps, ReactNode, ChangeEvent } from 'react';

// Props: plain type/interface; type the destructured parameter
type CardProps = {
  title: string;
  variant?: 'default' | 'outlined';  // optional → use a default parameter
  children: ReactNode;
  onClose?: () => void;
};
function Card({ title, variant = 'default', children, onClose }: CardProps) { /* ... */ }

// Extend native element props (ref included in React 19 types)
type ButtonProps = ComponentProps<'button'> & { loading?: boolean };
function Button({ loading, ...rest }: ButtonProps) {
  return <button aria-busy={loading} {...rest} />;
}

// Events
function handleChange(e: ChangeEvent<HTMLInputElement>) { setValue(e.target.value); }

// State and refs
const [user, setUser] = useState<User | null>(null);
const inputRef = useRef<HTMLInputElement>(null);

// Discriminated unions for exclusive props/state
type Status = { state: 'loading' } | { state: 'error'; error: Error } | { state: 'ok'; data: User };
```

Notes:
- `React.FC` is optional and not recommended by default; typing props directly is clearer.
- React 19 types: `useRef` requires an argument; the global `JSX` namespace was removed (use `React.JSX`); `ReactElement` props default to `unknown`.
- Let inference work for `useReducer` (don't pass `React.Reducer<...>` as a type argument).
- For generic components: `function List<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode })`.

**Why it matters / follow-up:** "How do you get the props type of a component you don't own?" `ComponentProps<typeof Foo>`.

**Sources:** [Using TypeScript – react.dev](https://react.dev/learn/typescript), [React 19 Upgrade Guide (TypeScript changes) – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide), [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
</details>

### 22. What is `useId` for?
<details><summary>Answer</summary>

`useId()` generates a **unique, stable ID** for accessibility attributes, consistent between server and client rendering (so it doesn't cause hydration mismatches the way a counter or `Math.random()` would).

```tsx
function PasswordField() {
  const hintId = useId();
  return (
    <>
      <label>
        Password <input type="password" aria-describedby={hintId} />
      </label>
      <p id={hintId}>At least 12 characters.</p>
    </>
  );
}
```

Don't use it for list `key`s (keys should come from data). The generated format is an implementation detail (since 19.2 it uses a `_r_` prefix so the IDs are valid CSS/view-transition names).

**Why it matters / follow-up:** "Why not hardcode `id="password-hint"`?" The component could be rendered twice on a page, producing duplicate IDs.

**Sources:** [useId – react.dev](https://react.dev/reference/react/useId), [React 19.2 – react.dev blog](https://react.dev/blog/2025/10/01/react-19-2)
</details>
