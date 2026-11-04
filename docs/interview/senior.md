# Senior React Interview Questions

> **Level legend:** 🟢 [Junior](./junior.md) · 🟡 [Intermediate](./intermediate.md) · 🔴 Senior (this file) · 🪤 [Trick questions](./trick-questions.md)
>
> Target: React 19.3, TypeScript, Vite 8, React Compiler 1.0 (as of November 2026).
> Senior answers are judged on **trade-offs and reasoning**, not just facts. Answer out loud, then compare.

## Table of contents

1. [How does reconciliation work, and what heuristics does it rely on?](#1-how-does-reconciliation-work-and-what-heuristics-does-it-rely-on)
2. [What is Fiber, and what problem did it solve?](#2-what-is-fiber-and-what-problem-did-it-solve)
3. [What happens in the render phase vs the commit phase?](#3-what-happens-in-the-render-phase-vs-the-commit-phase)
4. [What is concurrent rendering, and how do you use `useTransition`?](#4-what-is-concurrent-rendering-and-how-do-you-use-usetransition)
5. [`useDeferredValue` vs debouncing: when do you use which?](#5-usedeferredvalue-vs-debouncing-when-do-you-use-which)
6. [How does batching work, and when would you use `flushSync`?](#6-how-does-batching-work-and-when-would-you-use-flushsync)
7. [What does the React Compiler do, what does it assume, and how do you adopt it safely?](#7-what-does-the-react-compiler-do-what-does-it-assume-and-how-do-you-adopt-it-safely)
8. [What are React Server Components, and what are their constraints?](#8-what-are-react-server-components-and-what-are-their-constraints)
9. [Explain `'use client'` and `'use server'`: boundaries, serialization and security.](#9-explain-use-client-and-use-server-boundaries-serialization-and-security)
10. [How do SSR, streaming and hydration work in React 19?](#10-how-do-ssr-streaming-and-hydration-work-in-react-19)
11. [What causes hydration mismatches, and how do you fix them?](#11-what-causes-hydration-mismatches-and-how-do-you-fix-them)
12. [What is `use()` and how is it different from other Hooks?](#12-what-is-use-and-how-is-it-different-from-other-hooks)
13. [What is tearing, and how does `useSyncExternalStore` prevent it?](#13-what-is-tearing-and-how-does-usesyncexternalstore-prevent-it)
14. [How do you choose a state management architecture?](#14-how-do-you-choose-a-state-management-architecture)
15. [Why treat server data differently from client state (TanStack Query)?](#15-why-treat-server-data-differently-from-client-state-tanstack-query)
16. [How do you diagnose a performance problem in a React app?](#16-how-do-you-diagnose-a-performance-problem-in-a-react-app)
17. [What is your code-splitting strategy?](#17-what-is-your-code-splitting-strategy)
18. [How do you make a React app accessible?](#18-how-do-you-make-a-react-app-accessible)
19. [Compound components, headless components, render props vs Hooks: when do you use each?](#19-compound-components-headless-components-render-props-vs-hooks-when-do-you-use-each)
20. [What testing strategy would you set up for a React codebase?](#20-what-testing-strategy-would-you-set-up-for-a-react-codebase)
21. [What concerns arise in large React codebases and micro-frontends?](#21-what-concerns-arise-in-large-react-codebases-and-micro-frontends)
22. [What are the main security risks in React apps?](#22-what-are-the-main-security-risks-in-react-apps)
23. [What are `<Activity>` and `<ViewTransition>`, and what problems do they solve?](#23-what-are-activity-and-viewtransition-and-what-problems-do-they-solve)

---

### 1. How does reconciliation work, and what heuristics does it rely on?
<details><summary>Answer</summary>

Reconciliation is how React compares the new element tree with the previous one to decide what to update. A general tree diff is O(n³), so React uses an **O(n) heuristic** based on two assumptions:

1. **Elements of different types produce different trees.** If `<div>` becomes `<section>`, or `<Counter>` becomes `<Timer>`, React unmounts the old subtree (destroying its state and DOM) and mounts a new one.
2. **Keys identify children across renders.** Among siblings, React matches children by `key` (or by index if no key) to detect moves, insertions and deletions.

Same type at the same position → React keeps the instance (and its state) and updates changed props. This is why **state is tied to a position in the tree**, not to the component's JSX variable, and why `key` can be used to force a reset.

**Why it matters / follow-up:** "Why does defining a component inside another component reset its state?" Each render creates a new function, i.e. a different type. "Why are index keys dangerous?" Reordering maps state to the wrong items.

**Sources:** [Preserving and Resetting State – react.dev](https://react.dev/learn/preserving-and-resetting-state), [Rendering Lists – react.dev](https://react.dev/learn/rendering-lists), [Reconciliation (legacy docs) – legacy.reactjs.org](https://legacy.reactjs.org/docs/reconciliation.html)
</details>

### 2. What is Fiber, and what problem did it solve?
<details><summary>Answer</summary>

Fiber (React 16) is the reimplementation of React's reconciler. A **fiber** is a JS object representing a unit of work for one component instance or host node: its type, props, state/Hook list, effects, and links to `child`, `sibling` and `return` (parent).

The old "stack reconciler" rendered recursively and couldn't stop until the whole tree was done, blocking the main thread. Fiber turns rendering into a **linked-list traversal** React can:
- **pause and resume** (yield to the browser between units of work),
- **prioritize** updates (urgent input vs. transitions; internally modeled with "lanes"),
- **throw away** in-progress work that became obsolete,
- **reuse** completed work.

React keeps two trees: the **current** tree (what's on screen) and the **work-in-progress** tree being built. On commit, the work-in-progress becomes current (double buffering).

Fiber is the foundation of everything concurrent: transitions, Suspense, `useDeferredValue`, selective hydration, `<Activity>`.

**Why it matters / follow-up:** You don't use Fiber directly, but it explains *why* render must be pure: React may call your component, discard the result, and call it again.

**Sources:** [React Fiber Architecture – github.com/acdlite](https://github.com/acdlite/react-fiber-architecture), [react-reconciler package – github.com/facebook/react](https://github.com/facebook/react/tree/main/packages/react-reconciler), [Render and Commit – react.dev](https://react.dev/learn/render-and-commit)
</details>

### 3. What happens in the render phase vs the commit phase?
<details><summary>Answer</summary>

| Render phase | Commit phase |
|---|---|
| React calls components, runs Hooks, diffs with the previous tree | React applies DOM mutations, updates refs |
| **Pure**, no side effects | Side effects are allowed |
| Can be **interrupted, restarted or discarded** (concurrent) | **Synchronous**, never interrupted |
| May run more than once per visible update (StrictMode, transitions) | Runs once per committed update |

Order inside the commit: DOM mutations → ref attachment → **`useLayoutEffect`** callbacks (synchronously, before the browser paints) → browser paints → **`useEffect`** callbacks (after paint, usually). (`useInsertionEffect` fires before DOM mutations, for CSS-in-JS libraries.)

Then the browser paints. If a layout effect sets state, React re-renders synchronously before paint (useful for measuring tooltips, costly if overused).

**Why it matters / follow-up:** "Why is fetching in render a bug?" Render can run many times or be discarded. "Why does `useLayoutEffect` warn/hurt in SSR?" It can't run on the server and blocks paint.

**Sources:** [Render and Commit – react.dev](https://react.dev/learn/render-and-commit), [useLayoutEffect – react.dev](https://react.dev/reference/react/useLayoutEffect), [useInsertionEffect – react.dev](https://react.dev/reference/react/useInsertionEffect), [Keeping Components Pure – react.dev](https://react.dev/learn/keeping-components-pure)
</details>

### 4. What is concurrent rendering, and how do you use `useTransition`?
<details><summary>Answer</summary>

Concurrent rendering means React can prepare multiple versions of the UI and **interrupt a non-urgent render** to handle an urgent update (typing, clicking). It's opt-in per update: you mark updates as **Transitions**.

```tsx
const [isPending, startTransition] = useTransition();

function selectTab(next: Tab) {
  startTransition(() => {
    setTab(next); // non-urgent: React can interrupt this render
  });
}

// React 19: async Actions inside transitions
function onSave() {
  startTransition(async () => {
    await saveDraft();
    startTransition(() => setStatus('saved')); // updates after await need wrapping again
  });
}
```

Effects of a Transition:
- The UI stays responsive; an urgent update interrupts it.
- If the new content **suspends**, React keeps the **old UI** visible (with `isPending`) instead of showing a Suspense fallback again.
- Since React 19, the function can be **async** (an Action); `isPending` stays true until it resolves. State updates after an `await` currently need another `startTransition` (pending a JS `AsyncContext` standard).
- Since 19.3, independent Transitions render **independently**, so a slow one no longer blocks unrelated ones.

Limits: can't be used for controlled text input values (typing must be urgent). `startTransition` (standalone import) is available outside components but has no `isPending`.

**Why it matters / follow-up:** "Transition vs. debounce?" A transition doesn't delay work; it starts immediately and is interruptible, and adapts to the device's speed.

**Sources:** [useTransition – react.dev](https://react.dev/reference/react/useTransition), [startTransition – react.dev](https://react.dev/reference/react/startTransition), [React v19 – react.dev blog](https://react.dev/blog/2024/12/05/react-19), [React 19.3 – react.dev blog](https://react.dev/blog/2026/09/09/react-19-3), [React v18.0 – react.dev blog](https://react.dev/blog/2022/03/29/react-v18)
</details>

### 5. `useDeferredValue` vs debouncing: when do you use which?
<details><summary>Answer</summary>

`useDeferredValue(value, initialValue?)` returns a version of `value` that "lags behind" during urgent updates. React first re-renders with the **old** deferred value (fast), then tries a background re-render with the new one, which is interruptible.

```tsx
function Search() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SlowResults query={deferredQuery} /> {/* wrap in memo (or rely on the compiler) */}
      </div>
    </>
  );
}
```

- Use it when **you don't own the state update** (the value comes from props) or when you want the input to stay urgent while an expensive child lags.
- The expensive child must skip re-rendering when the deferred value hasn't changed: `memo` or the React Compiler.
- Combined with Suspense, it shows stale content instead of the fallback while new data loads.
- The optional `initialValue` (React 19) lets the first render use a cheap value, then update.

**Debounce/throttle** still matter for **reducing work outside rendering**, e.g. network requests per keystroke. `useDeferredValue` doesn't reduce the number of fetches by itself; it only makes rendering interruptible and adapts to device speed with no fixed delay.

**Why it matters / follow-up:** "Can you use both?" Yes: debounce the fetch, defer the render.

**Sources:** [useDeferredValue – react.dev](https://react.dev/reference/react/useDeferredValue), [useTransition – react.dev](https://react.dev/reference/react/useTransition)
</details>

### 6. How does batching work, and when would you use `flushSync`?
<details><summary>Answer</summary>

React **batches** multiple state updates into a single re-render. Since React 18 with `createRoot` (the only root in React 19), batching is **automatic everywhere**: event handlers, promises, `setTimeout`, native event listeners. Before 18, only React event handlers were batched.

```tsx
async function handleClick() {
  setLoading(true);
  const data = await fetchData();
  setData(data);      // these two updates
  setLoading(false);  // → one render
}
```

`flushSync(fn)` forces React to **apply updates synchronously** and update the DOM before returning. Use it rarely, when you must read the updated DOM immediately, e.g. scroll to a just-added item or integrate with a third-party API that needs the DOM now:

```tsx
import { flushSync } from 'react-dom';

flushSync(() => setTodos([...todos, newTodo]));
listRef.current!.lastElementChild!.scrollIntoView();
```

It hurts performance and can force Suspense fallbacks to show.

**Why it matters / follow-up:** "Is `setState` async?" Not exactly: it *schedules* an update; the render happens later (batched). The value in the current closure never changes.

**Sources:** [Queueing a Series of State Updates – react.dev](https://react.dev/learn/queueing-a-series-of-state-updates), [flushSync – react.dev](https://react.dev/reference/react-dom/flushSync), [Automatic batching for fewer renders in React 18 – reactwg on GitHub](https://github.com/reactwg/react-18/discussions/21)
</details>

### 7. What does the React Compiler do, what does it assume, and how do you adopt it safely?
<details><summary>Answer</summary>

**What it does.** React Compiler (v1.0 stable since **October 7, 2025**) is a **build-time** tool (currently a Babel plugin; in this repo via `@vitejs/plugin-react`'s `reactCompilerPreset` with `@rolldown/plugin-babel`) that **automatically memoizes components and Hooks**. It lowers the code to its own intermediate representation, analyzes data flow and mutability, and caches JSX, values and callbacks at a fine granularity, even **after early returns**, which manual `useMemo` can't do. It mainly prevents cascading re-renders and recomputation. It works with React 17+ (17/18 need the `target` option and `react-compiler-runtime`).

**What it assumes: the Rules of React.**
- Components and Hooks are **pure** and idempotent during render.
- **Props, state and Hook return values are immutable** (no `push` on state, no mutation of props).
- No reading/writing `ref.current` during render.
- Rules of Hooks are followed.

When it detects code that might break these rules, it **skips optimizing** that component/Hook rather than miscompiling. Violations it *can't* detect may cause runtime bugs, typically **Effects that relied on unstable references** firing differently.

**Opting out.** `"use no memo"` as the first statement of a function (or file) makes the compiler skip it. It's meant as a **temporary** debugging/workaround tool, ideally with a TODO. (`"use memo"` opts in when using `compilationMode: 'annotation'`.)

**Safe adoption.**
- Enable the compiler-powered lint rules from `eslint-plugin-react-hooks` (`recommended` preset), which work even without the compiler, and fix violations first.
- Roll out incrementally (by directory, or `annotation` mode), verify in React DevTools (compiled components show a "Memo ✨" badge), and lean on end-to-end tests.
- Pin an exact compiler version: memoization changes between versions can change Effect timing.
- Keep existing `useMemo`/`useCallback`; use them for new code only as escape hatches.

**Why it matters / follow-up:** "Does the compiler make `memo`/`useMemo` obsolete?" Mostly for performance, but you still need to understand referential equality to debug Effects and to work in un-compiled code.

**Sources:** [React Compiler v1.0 – react.dev blog](https://react.dev/blog/2025/10/07/react-compiler-1), [Introduction – React Compiler – react.dev](https://react.dev/learn/react-compiler/introduction), [Incremental Adoption – react.dev](https://react.dev/learn/react-compiler/incremental-adoption), [Debugging and Troubleshooting – react.dev](https://react.dev/learn/react-compiler/debugging), [`"use no memo"` – react.dev](https://react.dev/reference/react-compiler/directives/use-no-memo), [compilationMode – react.dev](https://react.dev/reference/react-compiler/compilationMode), [Rules of React – react.dev](https://react.dev/reference/rules)
</details>

### 8. What are React Server Components, and what are their constraints?
<details><summary>Answer</summary>

Server Components (RSC) are components that **render ahead of time on the server** (per request, or at build time), in an environment separate from the browser. Their code **never ships to the client**; React sends a serialized description of the rendered tree (the "Flight" payload) that the client merges into the UI.

Benefits:
- **Zero bundle cost** for the component and its dependencies (markdown parsers, date libraries...).
- **Direct data access** (database, file system, secrets) and `async` components: `async function Page() { const posts = await db.posts.findMany(); ... }`.
- Less client-side waterfall: data and UI arrive together, streamed with Suspense.

Constraints:
- No state, Effects, refs, event handlers or browser APIs (`useState`, `useEffect`, `onClick`...). Those belong in **Client Components** (`'use client'`).
- Props passed to Client Components must be **serializable**.
- They need a framework/bundler integration (Next.js App Router, React Router RSC support, Waku, Parcel, `@vitejs/plugin-rsc`...). A plain Vite SPA like this repo doesn't use them.
- Server Components are the **default** in an RSC environment; there is no `'use server'` directive for components (`'use server'` is for Server Functions).

Mental model: Server Components are the "skeleton" that fetches and composes; Client Components are interactive "islands". A Server Component can pass other Server Components as `children` to a Client Component.

**Why it matters / follow-up:** "RSC vs SSR?" SSR renders *all* components (client ones included) to HTML for the first load, then hydrates them. RSC is about *where components run*; it can be used with or without SSR, and on client navigations too.

**Sources:** [Server Components – react.dev](https://react.dev/reference/rsc/server-components), [RFC: React Server Components – github.com/reactjs/rfcs](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md), [The Two Reacts – overreacted.io](https://overreacted.io/the-two-reacts/), [Server and Client Components – nextjs.org](https://nextjs.org/docs/app/getting-started/server-and-client-components)
</details>

### 9. Explain `'use client'` and `'use server'`: boundaries, serialization and security.
<details><summary>Answer</summary>

**`'use client'`** at the top of a module marks it **and its transitive imports** as client code. The boundary is in the **module dependency graph**, not the render tree: a component is a Client Component if it's defined in (or imported by) a `'use client'` module. Put the directive as low as possible (on the interactive leaf) to keep the client bundle small.

Props crossing from server to client must be **serializable**: primitives (including `bigint`, globally registered `Symbol.for` symbols), plain objects, arrays, `Map`, `Set`, typed arrays/`ArrayBuffer`, `Date`, **Promises**, JSX elements, and **Server Functions**. Not allowed: regular functions, class instances, classes, null-prototype objects.

**`'use server'`** marks **Server Functions**: async functions callable from the client. The bundler replaces them with a reference; calling it sends a request to the server. (Until September 2024 these were all called "Server Actions"; now a Server Function used in an `action` prop or inside an Action is a Server Action.)

```tsx
// actions.ts
'use server';
export async function addComment(postId: string, formData: FormData) {
  const session = await getSession();          // authenticate
  if (!session) throw new Error('Unauthorized');
  const text = z.string().max(500).parse(formData.get('text')); // validate
  await db.comments.create({ postId, text, userId: session.userId });
}
```

**Security:** every exported Server Function is effectively a **public HTTP endpoint**. Treat arguments as untrusted input, validate them, and check authorization *inside* the function. Don't pass secrets in props to Client Components (they get serialized to the browser); use `server-only` style guards and taint APIs where your framework supports them. Also keep RSC packages patched: **CVE-2025-55182** (December 2025, CVSS 10) was an unauthenticated remote code execution in how React decoded Server Function payloads, affecting `react-server-dom-*` 19.0–19.2.0 and frameworks bundling them (fixed in 19.0.1/19.1.2/19.2.1, with follow-up advisories after).

**Why it matters / follow-up:** "Can a Client Component import a Server Component?" No, but it can receive one as `children`/props from a Server Component parent.

**Sources:** [`'use client'` – react.dev](https://react.dev/reference/rsc/use-client), [`'use server'` – react.dev](https://react.dev/reference/rsc/use-server), [Server Functions – react.dev](https://react.dev/reference/rsc/server-functions), [Critical Security Vulnerability in React Server Components – react.dev blog](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components), [Denial of Service and Source Code Exposure in React Server Components – react.dev blog](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components), [What Does "use client" Do? – overreacted.io](https://overreacted.io/what-does-use-client-do/)
</details>

### 10. How do SSR, streaming and hydration work in React 19?
<details><summary>Answer</summary>

- **SSR**: the server renders the component tree to HTML so the user sees content before JS loads (better FCP/LCP, SEO).
- **Hydration**: on the client, `hydrateRoot(container, <App />)` renders the same tree and **attaches** event handlers and state to the existing HTML instead of recreating it. Until a part is hydrated, it isn't interactive.
- **Streaming**: `renderToPipeableStream` (Node) / `renderToReadableStream` (Web Streams) send HTML progressively. Content inside a `<Suspense>` boundary that isn't ready is sent as its fallback; when its data resolves, the server streams the HTML plus a tiny inline script that swaps it in. No more "wait for the slowest query".
- **Selective hydration**: React hydrates Suspense boundaries independently and **prioritizes the ones the user interacts with**.
- **Static prerendering** (`react-dom/static`: `prerender`, `prerenderToNodeStream`) waits for all data, for SSG. React 19.2 added **Partial Pre-rendering** (`prerender` returns `postponed` state; `resume`/`resumeAndPrerender` fill in dynamic parts later).
- React 19.2 also **batches Suspense reveals** during SSR for a short time (but not beyond the ~2.5s LCP budget).
- React 19 supports `<title>`, `<meta>`, `<link>` rendered anywhere (hoisted to `<head>`), stylesheet precedence, and resource preloading APIs (`preload`, `preinit`...), which help streaming.

In Node, React still recommends **Node Streams** (`renderToPipeableStream`) for performance.

**Why it matters / follow-up:** "What's the cost of SSR?" Server compute, hydration cost (the JS still has to download and run), and the need for render output to match between server and client. RSC reduces the hydrated surface.

**Sources:** [Server React DOM APIs – react.dev](https://react.dev/reference/react-dom/server), [renderToPipeableStream – react.dev](https://react.dev/reference/react-dom/server/renderToPipeableStream), [hydrateRoot – react.dev](https://react.dev/reference/react-dom/client/hydrateRoot), [prerender – react.dev](https://react.dev/reference/react-dom/static/prerender), [React 19.2 – react.dev blog](https://react.dev/blog/2025/10/01/react-19-2), [New Suspense SSR Architecture in React 18 – reactwg on GitHub](https://github.com/reactwg/react-18/discussions/37), [Rendering on the Web – web.dev](https://web.dev/articles/rendering-on-the-web)
</details>

### 11. What causes hydration mismatches, and how do you fix them?
<details><summary>Answer</summary>

A mismatch happens when the client's first render produces different output than the server's HTML. React 19 reports a **single error with a diff** of the mismatch. React treats mismatches as bugs: it may client-render up to the nearest Suspense boundary (losing SSR benefits) and text/attribute differences may be left unpatched.

Common causes:
- Non-deterministic values in render: `Date.now()`, `new Date().toLocaleString()` (server vs user time zone/locale), `Math.random()`, `crypto.randomUUID()`.
- Browser-only branches: `typeof window !== 'undefined' ? ... : ...`, reading `localStorage`, `window.innerWidth`, media queries during render.
- Invalid HTML nesting (`<div>` inside `<p>`, `<a>` inside `<a>`) that the browser's parser "fixes".
- Browser extensions injecting attributes (React 19 is more tolerant of unexpected tags in `<head>`/`<body>` from third parties).
- Different data on server and client (stale cache, different env vars).

Fixes:
- Make render deterministic: pass the timestamp/random seed from the server as data; use `useId` for IDs.
- For intentionally client-only content, render a placeholder on both sides then update **after hydration** (Effect + state), or, **since React 19.3**, call `use(browser())` from `react-dom` inside a `<Suspense>` boundary: it suspends on the server (fallback in the HTML) and renders normally on the client.
- For an unavoidable text difference on one element (e.g. a timestamp), `suppressHydrationWarning={true}` (one level deep, escape hatch only).

**Why it matters / follow-up:** "Why not just `typeof window` checks?" They make server and client output differ on the *first* render, which is precisely a mismatch.

**Sources:** [hydrateRoot – react.dev](https://react.dev/reference/react-dom/client/hydrateRoot), [browser – react.dev](https://react.dev/reference/react-dom/browser), [React 19.3 – react.dev blog](https://react.dev/blog/2026/09/09/react-19-3), [React v19 – react.dev blog](https://react.dev/blog/2024/12/05/react-19), [The Perils of Rehydration – joshwcomeau.com](https://www.joshwcomeau.com/react/the-perils-of-rehydration/)
</details>

### 12. What is `use()` and how is it different from other Hooks?
<details><summary>Answer</summary>

`use(resource)` (React 19) reads the value of a **Promise** or a **Context**.

```tsx
import { use, Suspense } from 'react';

function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise); // suspends until resolved
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}

// Typically: the promise is created in a Server Component / loader / cache and passed down
<Suspense fallback={<Spinner />}>
  <Comments commentsPromise={commentsPromise} />
</Suspense>;
```

Differences from other Hooks:
- It **can be called conditionally** and in loops (but still only inside components/Hooks, and not in `try/catch`).
- With a Promise, it integrates with **Suspense** (pending) and **Error Boundaries** (rejected).
- The Promise must be **stable across renders**: don't create it during render in a Client Component (`use(fetch(...))` creates a new Promise each render → infinite suspense). Create it in a Server Component, a loader, a cache, or a library. In Server Components, prefer plain `async/await`.
- Promises passed from Server to Client Components are serializable; their resolved value must be too.
- Since 19.3, React warns in DEV when a component looks unblocked by a *conditional* `use()` in a way that suggests misuse.

**Why it matters / follow-up:** "Can I replace TanStack Query with `use`?" No: `use` reads a promise, it doesn't cache, dedupe, retry or invalidate. Libraries build on top of it.

**Sources:** [use – react.dev](https://react.dev/reference/react/use), [React v19 – react.dev blog](https://react.dev/blog/2024/12/05/react-19), [React 19.3 – react.dev blog](https://react.dev/blog/2026/09/09/react-19-3)
</details>

### 13. What is tearing, and how does `useSyncExternalStore` prevent it?
<details><summary>Answer</summary>

**Tearing** is a visual inconsistency where different parts of the UI show **different values of the same data** during one render. It became possible with concurrent rendering: React may pause a render midway; if an external mutable store (a global variable, a Redux store, `window` size) changes during the pause, components rendered before and after the change read different values.

`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)` is the official way to subscribe to external stores. React checks that the snapshot is consistent and, if the store changes during a concurrent render, re-renders **synchronously** to avoid tearing.

```tsx
function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine, // client snapshot
    () => true,             // server snapshot (SSR/hydration)
  );
}
```

Rules: `getSnapshot` must return a **cached/immutable** value (returning a new object each call causes an infinite loop); define `subscribe` outside the component (or keep it stable) to avoid resubscribing. Updates from external stores can't be marked as non-blocking transitions.

State libraries (Redux, Zustand, Jotai...) use it under the hood.

**Why it matters / follow-up:** "Why not `useState` + `useEffect` subscription?" It can tear under concurrency, misses updates between render and subscription, and has no server snapshot.

**Sources:** [useSyncExternalStore – react.dev](https://react.dev/reference/react/useSyncExternalStore), [What is tearing? – reactwg on GitHub](https://github.com/reactwg/react-18/discussions/69), [useMutableSource → useSyncExternalStore – reactwg on GitHub](https://github.com/reactwg/react-18/discussions/86)
</details>

### 14. How do you choose a state management architecture?
<details><summary>Answer</summary>

Classify state first; each kind has a natural home:

| Kind of state | Example | Good home |
|---|---|---|
| **Local UI state** | input value, open/closed | `useState`/`useReducer`, colocated |
| **Derived state** | filtered list, totals | computed during render (no storage) |
| **Shared UI state** (low frequency) | theme, current user, locale | Context (+ reducer) |
| **Shared client state** (high frequency, many readers) | editor state, canvas, complex wizard | external store with selectors (Zustand, Redux Toolkit, Jotai, `useSyncExternalStore`) |
| **Server state / cache** | lists from the API | TanStack Query, framework loaders, Server Components |
| **URL state** | filters, pagination, selected tab | router search params |
| **Form state** | submission, validation | uncontrolled inputs + Actions, or a form library |

Principles:
- **Colocate**: keep state as close as possible to where it's used; lift only when needed.
- **Single source of truth**; don't duplicate server data in a global store.
- Put state in the **URL** when users should be able to share/bookmark/go back.
- Introduce a global store for a concrete need (frequent updates with many subscribers, devtools/time travel, logic outside React), not by default.

**Why it matters / follow-up:** "Redux vs. Context?" Context is dependency injection without selectors (all consumers re-render); Redux/Zustand let components subscribe to slices and offer middleware/devtools. Most apps that used Redux for API data need far less once server state goes to a cache.

**Sources:** [Managing State – react.dev](https://react.dev/learn/managing-state), [Choosing the State Structure – react.dev](https://react.dev/learn/choosing-the-state-structure), [Scaling Up with Reducer and Context – react.dev](https://react.dev/learn/scaling-up-with-reducer-and-context), [Application State Management with React – kentcdodds.com](https://kentcdodds.com/blog/application-state-management-with-react), [Does TanStack Query replace Redux, MobX or other global state managers? – tanstack.com](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state)
</details>

### 15. Why treat server data differently from client state (TanStack Query)?
<details><summary>Answer</summary>

Server state is fundamentally different: it's **owned remotely**, can be changed by others, becomes **stale**, and needs async fetching. Treating it like client state (fetch in an Effect, store in `useState`/Redux) means re-implementing caching, deduplication, background refetching, retries, pagination, invalidation, and race-condition handling.

A server-cache library like **TanStack Query** gives you:
- A cache keyed by **query keys**; components requesting the same key share one request.
- **Stale-while-revalidate**: show cached data instantly, refetch in the background (on mount, window focus, reconnect by default).
- Mutations with **invalidation** and optimistic updates.
- Suspense integration (`useSuspenseQuery`), SSR hydration/prefetching.

```tsx
const { data, isPending, error } = useQuery({
  queryKey: ['todos', { status }],
  queryFn: () => fetchTodos(status),
  staleTime: 30_000, // default is 0: data is considered stale immediately
});

const mutation = useMutation({
  mutationFn: addTodo,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
});
```

In RSC frameworks, a lot of reads move to Server Components plus framework caching, and mutations to Server Functions; a client cache is still valuable for highly interactive, client-driven data.

**Why it matters / follow-up:** "What are TanStack Query's important defaults?" `staleTime: 0`, `gcTime` of 5 minutes for inactive queries, 3 retries with backoff, refetch on window focus.

**Sources:** [Overview – TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview), [Important Defaults – TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [Does this replace client state? – TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state), [Practical React Query – tkdodo.eu](https://tkdodo.eu/blog/practical-react-query), [You Might Not Need an Effect (fetching data) – react.dev](https://react.dev/learn/you-might-not-need-an-effect)
</details>

### 16. How do you diagnose a performance problem in a React app?
<details><summary>Answer</summary>

**Measure first, in a production-like build**, then fix the biggest cause.

1. **Reproduce and quantify**: which interaction is slow? Use field data (Core Web Vitals, especially **INP** for responsiveness and LCP for loading) and the Chrome Performance panel with CPU throttling.
2. **React DevTools Profiler**: record the interaction; see which components rendered, how long, and "why did this render?" (enable it in settings). Look for large subtrees re-rendering on every keystroke.
3. **React Performance Tracks** (React 19.2+): in Chrome DevTools' Performance panel, the **Scheduler** track shows work by priority (blocking vs. transition) and the **Components** track shows which components rendered or ran effects.
4. `<Profiler id onRender>` component for programmatic measurement in specific subtrees.
5. Check whether the React Compiler compiled the component ("Memo ✨" badge) or skipped it.

Typical fixes, in order of leverage:
- **Fix the slow render** before avoiding re-renders: expensive computations, huge lists (**virtualize**), layout thrashing.
- **Move state down / lift content up** (pass expensive subtrees as `children`) so fewer components re-render.
- Stabilize context values; split contexts; use selectors for external stores.
- `useTransition`/`useDeferredValue` to keep input responsive.
- Code-split heavy bundles; avoid request waterfalls (fetch in parallel, loaders, RSC).
- Memoization, which the compiler mostly handles now.

**Why it matters / follow-up:** "Why profile a production build?" Development mode is much slower (extra checks, StrictMode double renders), so timings are misleading. A profiling build (`react-dom/profiling`) keeps the Profiler working in production.

**Sources:** [React Developer Tools – react.dev](https://react.dev/learn/react-developer-tools), [`<Profiler>` – react.dev](https://react.dev/reference/react/Profiler), [React Performance Tracks – react.dev](https://react.dev/reference/dev-tools/react-performance-tracks), [Interaction to Next Paint (INP) – web.dev](https://web.dev/articles/inp), [Before You memo() – overreacted.io](https://overreacted.io/before-you-memo/), [Fix the slow render before you fix the re-render – kentcdodds.com](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)
</details>

### 17. What is your code-splitting strategy?
<details><summary>Answer</summary>

Goal: ship only the JS needed for the current screen, without creating loading waterfalls.

- **Route-based splitting first**: each route is a lazy chunk (`lazy()` + `<Suspense>`, or the router's `lazy` route option / framework mode, which also lets loaders start in parallel with code download).
- **Component-level splitting** for heavy, conditionally shown UI: rich text editors, charts, maps, modals, admin-only panels.
- **Prefetch** likely-next chunks (on link hover/visibility, or idle time) so splitting doesn't add latency. `<Activity mode="hidden">` can also pre-render a likely next view.
- Avoid splitting too finely: many small chunks add request overhead and can create **waterfalls** (chunk A loads, renders, then requests chunk B). Load code and data **in parallel**.
- Audit with a bundle analyzer; watch for big dependencies pulled into the main chunk (date/i18n libs, icon packs). Prefer ESM, tree-shakeable imports.
- With RSC, server-only dependencies cost zero client JS, which is a form of splitting by environment.
- Wrap lazy boundaries in Error Boundaries (chunk loads can fail after a deploy).

Vite/Rolldown split on dynamic `import()` automatically and add `modulepreload` hints for chunk dependencies.

**Why it matters / follow-up:** "Where do you put Suspense boundaries?" Where a loading state makes sense to the user (a page, a panel), not around every component, to avoid "popcorn" UI.

**Sources:** [lazy – react.dev](https://react.dev/reference/react/lazy), [`<Suspense>` – react.dev](https://react.dev/reference/react/Suspense), [Reduce JavaScript payloads with code splitting – web.dev](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting), [Features (dynamic import) – vite.dev](https://vite.dev/guide/features), [Activity – react.dev](https://react.dev/reference/react/Activity)
</details>

### 18. How do you make a React app accessible?
<details><summary>Answer</summary>

React renders standard HTML, so accessibility mostly means **using the platform correctly**:

- **Semantic HTML first**: `<button>` for actions (not `<div onClick>`), `<a href>` for navigation, `<label htmlFor>` for inputs, headings in order, landmarks (`<main>`, `<nav>`). The first rule of ARIA: don't use ARIA if a native element does the job.
- **Keyboard**: everything operable with the keyboard, visible focus styles, logical tab order, no keyboard traps (except intentional focus traps in modals, with Escape to close).
- **Focus management in SPAs**: on route change, move focus to the new page heading or main content and update `document.title` (React 19 lets you render `<title>` in components); after closing a modal, restore focus to the trigger; use refs (or Fragment refs in 19.3) for this.
- **ARIA for custom widgets** (combobox, tabs, menu): follow the WAI-ARIA Authoring Practices patterns for roles, states (`aria-expanded`, `aria-selected`) and keyboard interactions. Or use a well-tested headless library (React Aria, Radix).
- **Live regions** (`aria-live`, `role="alert"`/`"status"`) for async feedback like form errors and toasts.
- **Accessible names** for icon buttons (`aria-label`), `alt` text for images, `useId` to link `aria-describedby`.
- **Color contrast**, `prefers-reduced-motion` (relevant with View Transitions), and zoom/reflow, per WCAG 2.2.
- **Tooling**: `eslint-plugin-jsx-a11y`, axe-core in tests/CI, RTL's role queries, plus **manual testing** with a keyboard and a screen reader (automation catches only a part of issues).

**Why it matters / follow-up:** "Build an accessible modal": native `<dialog>` with `showModal()` or the APG dialog pattern (focus in, trap, Escape, restore, `aria-modal`, labelled by its title).

**Sources:** [WAI-ARIA Authoring Practices Guide – W3C WAI](https://www.w3.org/WAI/ARIA/apg/), [Read Me First (No ARIA is better than bad ARIA) – W3C WAI](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/), [WCAG 2.2 Quick Reference – W3C WAI](https://www.w3.org/WAI/WCAG22/quickref/), [ARIA – MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA), [eslint-plugin-jsx-a11y – GitHub](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y), [axe-core – GitHub](https://github.com/dequelabs/axe-core), [ByRole queries – testing-library.com](https://testing-library.com/docs/queries/byrole/)
</details>

### 19. Compound components, headless components, render props vs Hooks: when do you use each?
<details><summary>Answer</summary>

- **Compound components**: a set of components sharing implicit state through Context, giving consumers control over structure.
  ```tsx
  <Tabs defaultValue="a">
    <Tabs.List>
      <Tabs.Trigger value="a">Account</Tabs.Trigger>
      <Tabs.Trigger value="b">Billing</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Panel value="a">…</Tabs.Panel>
  </Tabs>
  ```
  Good for design-system widgets (tabs, menus, accordions, selects) with flexible layout. Avoid `cloneElement`/`Children.map` tricks (fragile); use Context.
- **Headless components / Hooks**: logic, state and accessibility without markup or styles (`useCombobox`-style Hooks, React Aria, Radix Primitives, TanStack Table). The consumer owns rendering. Best when many teams need different looks with the same behavior. Often exposed as "prop getters" (`getInputProps()`).
- **Render props**: a function prop that returns UI (`<DataLoader render={data => …} />`). Mostly replaced by Hooks for sharing logic, but still useful when the shared logic needs to **control rendering at a specific place in the tree** (e.g. virtualized list `renderItem`, positioning wrappers) or for components that must work in class components.
- **Custom Hooks** are the default for sharing stateful logic: simple composition, no wrapper nesting ("wrapper hell" from HOCs/render props).
- **HOCs** are largely legacy; still seen for cross-cutting concerns in older code.

Trade-off axis: **inversion of control**. The more control you give consumers (headless, compound), the more flexible and the more work for them; the more you bake in (a configured `<Select options>`), the simpler but more rigid.

**Why it matters / follow-up:** "How do you type compound components?" Attach subcomponents as static properties or export them separately; throw a helpful error if a child is used outside its provider.

**Sources:** [Compound Pattern – patterns.dev](https://www.patterns.dev/react/compound-pattern/), [Render Props Pattern – patterns.dev](https://www.patterns.dev/react/render-props-pattern/), [Hooks Pattern – patterns.dev](https://www.patterns.dev/react/hooks-pattern/), [Inversion of Control – kentcdodds.com](https://kentcdodds.com/blog/inversion-of-control), [Reusing Logic with Custom Hooks – react.dev](https://react.dev/learn/reusing-logic-with-custom-hooks), [React Aria – adobe.com](https://react-aria.adobe.com/), [Radix Primitives – radix-ui.com](https://www.radix-ui.com/primitives/docs/overview/introduction)
</details>

### 20. What testing strategy would you set up for a React codebase?
<details><summary>Answer</summary>

Optimize for **confidence per cost**, following the "testing trophy":

1. **Static analysis** (cheapest, catches the most typos): TypeScript strict mode, ESLint with `eslint-plugin-react-hooks` (incl. React Compiler rules), `jsx-a11y`.
2. **Unit tests** for pure logic: reducers, formatters, custom Hooks with `renderHook` when logic is non-trivial.
3. **Integration tests (the bulk)**: render a feature with React Testing Library + `user-event`, query by role, mock only the network boundary (e.g. MSW) rather than internal modules. Run with Vitest + jsdom (this repo), or Vitest Browser Mode for real-browser fidelity.
4. **End-to-end tests** (Playwright) for critical user journeys: login, checkout, plus anything involving real routing, SSR/hydration, Server Functions. They also catch React Compiler memoization regressions that affect Effects.
5. **Visual / a11y checks**: axe in tests, visual regression (e.g. Storybook-based) for design systems.

Principles:
- Test behavior, not implementation (no asserting on state or internal calls); refactors shouldn't break tests.
- Avoid snapshot tests of large trees (brittle, rubber-stamped).
- Deterministic async: `findBy*`/`waitFor`, fake timers when needed.
- Run fast tests on every commit, E2E on PRs/main.
- Server Components: test async Server Components mostly through E2E or framework tooling; unit-test the data functions they call.

**Why it matters / follow-up:** "How do you test a custom Hook?" Through a component that uses it when possible; `renderHook` for reusable library-like Hooks.

**Sources:** [The Testing Trophy and Testing Classifications – kentcdodds.com](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications), [Testing Implementation Details – kentcdodds.com](https://kentcdodds.com/blog/testing-implementation-details), [React Testing Library – testing-library.com](https://testing-library.com/docs/react-testing-library/intro/), [MSW docs – mswjs.io](https://mswjs.io/docs/), [Playwright – playwright.dev](https://playwright.dev/docs/intro), [Vitest Browser Mode – vitest.dev](https://vitest.dev/guide/browser/)
</details>

### 21. What concerns arise in large React codebases and micro-frontends?
<details><summary>Answer</summary>

**Large single codebase (often a monorepo):**
- **Architecture by feature/domain**, not by technical type (`features/checkout/{components,hooks,api}`), with explicit public APIs per module and lint rules against deep imports.
- **Design system** with shared, accessible primitives; versioned and documented (Storybook).
- **Consistent data layer**: one server-cache strategy, typed API clients (generated from OpenAPI/GraphQL schemas).
- **Build and CI performance**: incremental builds/tests, affected-only pipelines, type-check project references.
- **Upgrades**: React majors, compiler versions and codemods are easier with one version everywhere; pin and roll out gradually (feature flags, compiler `annotation` mode).
- **Ownership**: CODEOWNERS, lint rules encoding conventions, ADRs.

**Micro-frontends** (independently built and deployed front-end slices, via Module Federation, import maps, or route-level composition):
- Benefits: team autonomy, independent deploys, incremental migration from a legacy stack.
- Costs: **duplicate React copies** or version skew (React and React DOM must be singletons per root; hooks break with two copies), bigger payloads, inconsistent UX, cross-app state and routing coordination, harder E2E testing, shared-dependency governance.
- Mitigations: share React as a singleton, keep contracts small (events/URL rather than shared stores), one design system, integrate at route boundaries when possible.
- Ask whether the problem is **organizational** (many teams, separate release cycles). If not, a well-structured monorepo is usually simpler.

**Why it matters / follow-up:** "How would you migrate a legacy app to React 19 + compiler?" Strict Mode first, fix Rules-of-React violations with the lint rules, remove removed APIs (codemods), upgrade, then enable the compiler incrementally.

**Sources:** [Micro Frontends – martinfowler.com](https://martinfowler.com/articles/micro-frontends.html), [Module Federation – module-federation.io](https://module-federation.io/), [Incremental Adoption (React Compiler) – react.dev](https://react.dev/learn/react-compiler/incremental-adoption), [React 19 Upgrade Guide – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
</details>

### 22. What are the main security risks in React apps?
<details><summary>Answer</summary>

**What React protects you from:** text and attribute values in JSX are **escaped** before insertion, so `<p>{userInput}</p>` can't inject HTML. React elements also carry a `$$typeof` Symbol so a JSON payload can't be passed off as an element.

**Where you can still get XSS:**
- **`dangerouslySetInnerHTML={{ __html }}`**: the name is the warning. Only use it with trusted or **sanitized** HTML (e.g. DOMPurify), sanitized as close to rendering as possible.
- **URLs**: `href`/`src` with `javascript:` URLs. React 19 replaces `javascript:` URLs with a function that throws, but validate URL schemes from user input anyway (allow `https:`, `mailto:`...).
- Direct DOM access via refs (`ref.current.innerHTML = ...`), third-party widgets, `eval`/`new Function`.
- **SSR**: serializing state into `<script>` tags without escaping (`</script>` injection); use a safe serializer.
- Spreading untrusted objects as props (`<a {...userProps}>`) can inject event handlers or `href`.

**Defense in depth:**
- A strict **Content Security Policy** (nonces; React supports `nonce` on hoisted styles/scripts).
- **Trusted Types**: since **React 19.3**, React passes `TrustedHTML`/`TrustedScriptURL` objects through instead of stringifying them, so apps can enforce `require-trusted-types-for 'script'`.
- Dependency hygiene (lockfile audits, prompt patching).

**Server-side React (RSC):** Server Functions are public endpoints (validate + authorize), never send secrets as props to Client Components, and patch RSC packages promptly (e.g. CVE-2025-55182, an unauthenticated RCE in Server Function payload decoding, fixed December 2025).

Also: don't store sensitive tokens in `localStorage` if you can use `HttpOnly` cookies (XSS can read `localStorage`), and protect cookie-based mutations against CSRF (frameworks usually help for Server Actions).

**Why it matters / follow-up:** "Render user-provided Markdown safely?" Use a Markdown renderer that outputs React elements (like `react-markdown`, used in this repo) without enabling raw HTML, rather than `marked` + `dangerouslySetInnerHTML`.

**Sources:** [Common components (dangerouslySetInnerHTML) – react.dev](https://react.dev/reference/react-dom/components/common), [React 19.3 – react.dev blog](https://react.dev/blog/2026/09/09/react-19-3), [Critical Security Vulnerability in React Server Components – react.dev blog](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components), [Why Do React Elements Have a $$typeof Property? – overreacted.io](https://overreacted.io/why-do-react-elements-have-typeof-property/), [Cross Site Scripting Prevention Cheat Sheet – OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [Content Security Policy – MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [Trusted Types API – MDN](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API), [DOMPurify – GitHub](https://github.com/cure53/DOMPurify)
</details>

### 23. What are `<Activity>` and `<ViewTransition>`, and what problems do they solve?
<details><summary>Answer</summary>

**`<Activity mode="visible" | "hidden">`** (stable since **React 19.2**): hides a subtree **without unmounting it**. In `hidden` mode, children are visually hidden, their **Effects are cleaned up** (unmounted), and updates are deferred until React is idle; **state and DOM are preserved**. Switching back to `visible` re-runs Effects and restores the UI instantly.

```tsx
<Activity mode={tab === 'inbox' ? 'visible' : 'hidden'}>
  <Inbox />  {/* keeps scroll position, draft text, etc. */}
</Activity>
```

Use cases: tabs/back navigation that keep state, **pre-rendering** a likely next screen (data and code load in the background at low priority). Trade-off vs. conditional rendering: memory cost of keeping hidden trees; Effects must clean up correctly (StrictMode helps verify).

**`<ViewTransition>`** (stable since **React 19.3**, with `addTransitionType`): integrates the browser **View Transition API** with React. Elements wrapped in `<ViewTransition>` animate when they **enter, exit, update or are shared** (same `name` removed in one place and added elsewhere). Animations only run for updates inside a **Transition** (`startTransition`, Suspense reveals, `useDeferredValue`); the default is a cross-fade, customizable via CSS classes or the Web Animations API (`onEnter`, `onExit`...). `addTransitionType('next')` tags a transition so the same update can animate differently (e.g. slide direction). Currently DOM-only.

**Why it matters / follow-up:** These show React moving more "app-like" behaviors (state preservation, animations, pre-rendering) into the core, built on concurrent rendering. Follow-up: "Why do animations only run in Transitions?" Urgent updates must be applied immediately; transitions are the updates React is allowed to coordinate.

**Sources:** [`<Activity>` – react.dev](https://react.dev/reference/react/Activity), [`<ViewTransition>` – react.dev](https://react.dev/reference/react/ViewTransition), [addTransitionType – react.dev](https://react.dev/reference/react/addTransitionType), [React 19.2 – react.dev blog](https://react.dev/blog/2025/10/01/react-19-2), [React 19.3 – react.dev blog](https://react.dev/blog/2026/09/09/react-19-3), [View Transition API – MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
</details>
