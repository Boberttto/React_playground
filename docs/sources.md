# Sources

Consolidated bibliography for the [interview prep files](./interview/README.md), grouped by theme.
All links were checked on 2026-11-04. Prefer the official docs (react.dev) when sources disagree; older posts are listed for the concepts they explain, not for current APIs.

## Contents

- [Official docs: Learn (react.dev)](#official-docs-learn-reactdev)
- [Official docs: API reference (react.dev)](#official-docs-api-reference-reactdev)
- [React Compiler](#react-compiler)
- [Server Components, SSR and hydration](#server-components-ssr-and-hydration)
- [React blog posts and release notes](#react-blog-posts-and-release-notes)
- [RFCs, working groups and GitHub](#rfcs-working-groups-and-github)
- [Legacy docs (historical context)](#legacy-docs-historical-context)
- [JavaScript and web platform (MDN, web.dev)](#javascript-and-web-platform-mdn-webdev)
- [Accessibility](#accessibility)
- [Security](#security)
- [Testing](#testing)
- [Ecosystem: routing, data, tooling](#ecosystem-routing-data-tooling)
- [Articles, books and courses](#articles-books-and-courses)

## Official docs: Learn (react.dev)

**Describing the UI**
- [Your First Component](https://react.dev/learn/your-first-component)
- [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx)
- [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces)
- [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
- [Conditional Rendering](https://react.dev/learn/conditional-rendering)
- [Rendering Lists](https://react.dev/learn/rendering-lists)
- [Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
- [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree)
- [Thinking in React](https://react.dev/learn/thinking-in-react)

**Adding interactivity**
- [Responding to Events](https://react.dev/learn/responding-to-events)
- [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)
- [Render and Commit](https://react.dev/learn/render-and-commit)
- [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
- [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [Updating Objects in State](https://react.dev/learn/updating-objects-in-state)
- [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)

**Managing state**
- [Managing State (overview)](https://react.dev/learn/managing-state)
- [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state)
- [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)

**Escape hatches**
- [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs)
- [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects)
- [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies)
- [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

**Setup and tooling**
- [Creating a React App](https://react.dev/learn/creating-a-react-app)
- [Using TypeScript](https://react.dev/learn/typescript)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)

## Official docs: API reference (react.dev)

**Rules**
- [Rules of React](https://react.dev/reference/rules)
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [eslint-plugin-react-hooks](https://react.dev/reference/eslint-plugin-react-hooks)

**Hooks (`react`)**
- [useState](https://react.dev/reference/react/useState) · [useReducer](https://react.dev/reference/react/useReducer) · [useContext](https://react.dev/reference/react/useContext) · [useRef](https://react.dev/reference/react/useRef) · [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle)
- [useEffect](https://react.dev/reference/react/useEffect) · [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect) · [useInsertionEffect](https://react.dev/reference/react/useInsertionEffect) · [useEffectEvent](https://react.dev/reference/react/useEffectEvent)
- [useMemo](https://react.dev/reference/react/useMemo) · [useCallback](https://react.dev/reference/react/useCallback)
- [useTransition](https://react.dev/reference/react/useTransition) · [useDeferredValue](https://react.dev/reference/react/useDeferredValue)
- [useActionState](https://react.dev/reference/react/useActionState) · [useOptimistic](https://react.dev/reference/react/useOptimistic)
- [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) · [useId](https://react.dev/reference/react/useId) · [use](https://react.dev/reference/react/use)

**Components and APIs (`react`)**
- [`<Fragment>`](https://react.dev/reference/react/Fragment) · [`<StrictMode>`](https://react.dev/reference/react/StrictMode) · [`<Suspense>`](https://react.dev/reference/react/Suspense) · [`<Profiler>`](https://react.dev/reference/react/Profiler) · [`<Activity>`](https://react.dev/reference/react/Activity) · [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition)
- [createContext](https://react.dev/reference/react/createContext) · [memo](https://react.dev/reference/react/memo) · [lazy](https://react.dev/reference/react/lazy) · [startTransition](https://react.dev/reference/react/startTransition) · [addTransitionType](https://react.dev/reference/react/addTransitionType) · [forwardRef](https://react.dev/reference/react/forwardRef) · [Component (class components, error boundaries)](https://react.dev/reference/react/Component)

**React DOM (`react-dom`)**
- [Common components (props, events, `style`, `dangerouslySetInnerHTML`)](https://react.dev/reference/react-dom/components/common)
- [`<form>`](https://react.dev/reference/react-dom/components/form) · [`<input>`](https://react.dev/reference/react-dom/components/input)
- [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) · [createPortal](https://react.dev/reference/react-dom/createPortal) · [flushSync](https://react.dev/reference/react-dom/flushSync) · [browser](https://react.dev/reference/react-dom/browser)
- [createRoot](https://react.dev/reference/react-dom/client/createRoot) · [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot)

**DevTools**
- [React Performance Tracks](https://react.dev/reference/dev-tools/react-performance-tracks)

## React Compiler

- [React Compiler v1.0 (blog, Oct 7 2025)](https://react.dev/blog/2025/10/07/react-compiler-1)
- [Introduction](https://react.dev/learn/react-compiler/introduction)
- [Installation](https://react.dev/learn/react-compiler/installation)
- [Incremental Adoption](https://react.dev/learn/react-compiler/incremental-adoption)
- [Debugging and Troubleshooting](https://react.dev/learn/react-compiler/debugging)
- [`"use no memo"` directive](https://react.dev/reference/react-compiler/directives/use-no-memo) · [`"use memo"` directive](https://react.dev/reference/react-compiler/directives/use-memo)
- [compilationMode](https://react.dev/reference/react-compiler/compilationMode) · [target (React 17/18)](https://react.dev/reference/react-compiler/target)

## Server Components, SSR and hydration

- [Server Components](https://react.dev/reference/rsc/server-components)
- [Server Functions](https://react.dev/reference/rsc/server-functions)
- [`'use client'`](https://react.dev/reference/rsc/use-client) · [`'use server'`](https://react.dev/reference/rsc/use-server)
- [Server React DOM APIs](https://react.dev/reference/react-dom/server) · [renderToPipeableStream](https://react.dev/reference/react-dom/server/renderToPipeableStream) · [prerender](https://react.dev/reference/react-dom/static/prerender)
- [Server and Client Components – nextjs.org](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Rendering on the Web – web.dev](https://web.dev/articles/rendering-on-the-web)

## React blog posts and release notes

- [React 19.3 (Sep 9 2026)](https://react.dev/blog/2026/09/09/react-19-3): `<ViewTransition>`, Fragment refs, `browser()`, Trusted Types
- [The React Foundation (Feb 24 2026)](https://react.dev/blog/2026/02/24/the-react-foundation)
- [Denial of Service and Source Code Exposure in React Server Components (Dec 11 2025)](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)
- [Critical Security Vulnerability in React Server Components (Dec 3 2025)](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components): CVE-2025-55182
- [React Conf 2025 Recap](https://react.dev/blog/2025/10/16/react-conf-2025-recap)
- [React Compiler v1.0 (Oct 7 2025)](https://react.dev/blog/2025/10/07/react-compiler-1)
- [React 19.2 (Oct 1 2025)](https://react.dev/blog/2025/10/01/react-19-2): `<Activity>`, `useEffectEvent`, Performance Tracks, Partial Pre-rendering
- [React Labs: View Transitions, Activity, and more (Apr 2025)](https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more)
- [Sunsetting Create React App (Feb 2025)](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)
- [React v19 (Dec 5 2024)](https://react.dev/blog/2024/12/05/react-19)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide): removed APIs, TypeScript changes
- [React v18.0 (Mar 2022)](https://react.dev/blog/2022/03/29/react-v18): concurrent features, automatic batching
- [React CHANGELOG – GitHub](https://github.com/facebook/react/blob/main/CHANGELOG.md)

## RFCs, working groups and GitHub

- [reactjs/rfcs](https://github.com/reactjs/rfcs)
- [RFC 0188: React Server Components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [RFC 0214: useSyncExternalStore](https://github.com/reactjs/rfcs/blob/main/text/0214-use-sync-external-store.md)
- [React 18 WG: Automatic batching](https://github.com/reactwg/react-18/discussions/21)
- [React 18 WG: New Suspense SSR Architecture](https://github.com/reactwg/react-18/discussions/37)
- [React 18 WG: What is tearing?](https://github.com/reactwg/react-18/discussions/69)
- [React 18 WG: useMutableSource → useSyncExternalStore](https://github.com/reactwg/react-18/discussions/86)
- [React Fiber Architecture – Andrew Clark](https://github.com/acdlite/react-fiber-architecture)
- [facebook/react](https://github.com/facebook/react) · [react-reconciler package](https://github.com/facebook/react/tree/main/packages/react-reconciler)

## Legacy docs (historical context)

- [Reconciliation](https://legacy.reactjs.org/docs/reconciliation.html)
- [Event Pooling](https://legacy.reactjs.org/docs/legacy-event-pooling.html) (removed in React 17)
- [React v17.0 Release Candidate](https://legacy.reactjs.org/blog/2020/08/10/react-v17-rc.html)

## JavaScript and web platform (MDN, web.dev)

- [Closures – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
- [Object.is – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
- [Logical AND (&&) – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND)
- [AbortController – MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [View Transition API – MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [Interaction to Next Paint (INP) – web.dev](https://web.dev/articles/inp)
- [Web Vitals – web.dev](https://web.dev/articles/vitals)
- [Reduce JavaScript payloads with code splitting – web.dev](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting)

## Accessibility

- [WAI-ARIA Authoring Practices Guide (APG) – W3C](https://www.w3.org/WAI/ARIA/apg/)
- [APG: Read Me First](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/) · [Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) · [Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) · [Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [WCAG 2.2 Quick Reference – W3C](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA – MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [`<dialog>` – MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) · [axe-core](https://github.com/dequelabs/axe-core)
- [React Aria](https://react-aria.adobe.com/) · [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction)

## Security

- [Cross Site Scripting Prevention Cheat Sheet – OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy – MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
- [Trusted Types API – MDN](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Why Do React Elements Have a $$typeof Property? – overreacted.io](https://overreacted.io/why-do-react-elements-have-typeof-property/)
- RSC advisories: see the December 2025 posts under [React blog posts](#react-blog-posts-and-release-notes)

## Testing

- [React Testing Library: Intro](https://testing-library.com/docs/react-testing-library/intro/) · [API (`render`, `renderHook`)](https://testing-library.com/docs/react-testing-library/api/)
- [Guiding Principles](https://testing-library.com/docs/guiding-principles/) · [About Queries (priority)](https://testing-library.com/docs/queries/about/) · [ByRole](https://testing-library.com/docs/queries/byrole/) · [Async methods](https://testing-library.com/docs/dom-testing-library/api-async/)
- [user-event](https://testing-library.com/docs/user-event/intro/)
- [Vitest guide](https://vitest.dev/guide/) · [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [MSW](https://mswjs.io/docs/) · [Playwright](https://playwright.dev/docs/intro)
- [Common mistakes with React Testing Library – kentcdodds.com](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Implementation Details – kentcdodds.com](https://kentcdodds.com/blog/testing-implementation-details)
- [The Testing Trophy and Testing Classifications – kentcdodds.com](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Write tests. Not too many. Mostly integration. – kentcdodds.com](https://kentcdodds.com/blog/write-tests)

## Ecosystem: routing, data, tooling

- React Router: [Picking a Mode](https://reactrouter.com/start/modes) · [Routing (data mode)](https://reactrouter.com/start/data/routing) · [Data Loading](https://reactrouter.com/start/data/data-loading)
- [TanStack Router](https://tanstack.com/router/latest)
- TanStack Query: [Overview](https://tanstack.com/query/latest/docs/framework/react/overview) · [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) · [Does this replace client state?](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state) · [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Redux Toolkit: Getting Started](https://redux.js.org/toolkit/introduction/getting-started) · [Zustand](https://github.com/pmndrs/zustand)
- [Vite: Features](https://vite.dev/guide/features)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Module Federation](https://module-federation.io/)

## Articles, books and courses

**Dan Abramov – overreacted.io**
- [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)
- [Making setInterval Declarative with React Hooks](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)
- [Before You memo()](https://overreacted.io/before-you-memo/)
- [Why Do React Hooks Rely on Call Order?](https://overreacted.io/why-do-hooks-rely-on-call-order/)
- [React as a UI Runtime](https://overreacted.io/react-as-a-ui-runtime/)
- [The Two Reacts](https://overreacted.io/the-two-reacts/)
- [What Does "use client" Do?](https://overreacted.io/what-does-use-client-do/)

**Kent C. Dodds – kentcdodds.com**
- [Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react)
- [How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
- [Should I useState or useReducer?](https://kentcdodds.com/blog/should-i-usestate-or-usereducer)
- [Don't Sync State. Derive It!](https://kentcdodds.com/blog/dont-sync-state-derive-it)
- [Understanding React's key prop](https://kentcdodds.com/blog/understanding-reacts-key-prop)
- [Inversion of Control](https://kentcdodds.com/blog/inversion-of-control)
- [Fix the slow render before you fix the re-render](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)

**Others**
- [Why React Re-Renders – Josh W. Comeau](https://www.joshwcomeau.com/react/why-react-re-renders/)
- [The Perils of Rehydration – Josh W. Comeau](https://www.joshwcomeau.com/react/the-perils-of-rehydration/)
- [Practical React Query – TkDodo](https://tkdodo.eu/blog/practical-react-query)
- [React re-renders guide – developerway.com](https://www.developerway.com/posts/react-re-renders-guide)
- [Micro Frontends – Martin Fowler's site](https://martinfowler.com/articles/micro-frontends.html)
- Patterns: [Compound Pattern](https://www.patterns.dev/react/compound-pattern/) · [Render Props Pattern](https://www.patterns.dev/react/render-props-pattern/) · [Hooks Pattern](https://www.patterns.dev/react/hooks-pattern/) – patterns.dev

**Courses**
- [Epic React – Kent C. Dodds](https://www.epicreact.dev/)
- [react.gg – ui.dev](https://react.gg/)
- The [react.dev Learn section](https://react.dev/learn) itself is the best free course.
