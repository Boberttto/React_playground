# React Interview Prep

Question banks for building a junior → senior React foundation and preparing for interviews.
Everything targets **React 19.3**, TypeScript, Vite 8 and **React Compiler 1.0**, the stack of this repo (as of November 2026).

## Files

| Level | File | Questions | Focus |
|---|---|---|---|
| 🟢 Junior | [junior.md](./junior.md) | 21 | JSX, components, props/state, keys, events, forms, effects basics, StrictMode |
| 🟡 Intermediate | [intermediate.md](./intermediate.md) | 22 | Hooks rules, custom Hooks, Context, refs, memoization, Effects, Error Boundaries, Suspense, routing, React 19 Actions, testing, TypeScript |
| 🔴 Senior | [senior.md](./senior.md) | 23 | Reconciliation/Fiber, concurrency, React Compiler, Server Components, SSR/hydration, external stores, architecture, performance, a11y, security |
| 🪤 Tricks | [trick-questions.md](./trick-questions.md) | 19 | Gotchas and outdated-knowledge traps, each with **The trap:** |

All sources are consolidated in [../sources.md](../sources.md).

## How to use these files

1. **Read the question only.** Answers are folded inside `<details>` blocks (on GitHub and most Markdown viewers).
2. **Answer out loud first**, as if an interviewer were in front of you. Aim for 30–90 seconds: definition → why it exists → a small example → a trade-off or pitfall.
3. **Then open the answer** and compare. Note what you missed, especially the **Why it matters / follow-up** line, which is what interviewers probe next.
4. For trick questions, **predict the output** before revealing. If your answer matches **The trap:**, add the question to your review list.
5. **Code it.** For anything shaky, reproduce the snippet in this playground (`npm run dev`) or write a quick test (`npm test`).

Answer structure that works well in interviews:

> "X is … . It exists because … . For example … . The catch is … , so in practice I … ."

## How to study

- **Spaced repetition beats cramming.** Do one file section per day, then revisit the questions you missed after 1, 3 and 7 days.
- **Go through the levels in order**, even if you feel senior: junior questions are often asked as warm-ups, and a shaky basic answer hurts more than a missed advanced one.
- **Read the primary source** linked in each answer at least once (mostly react.dev). Interviewers notice when you use the docs' vocabulary: *snapshot*, *reactive value*, *synchronizing with an external system*, *Rules of React*.
- **Watch for outdated knowledge.** Common red flags in 2026: `defaultProps` on function components, `forwardRef` as required, `ReactDOM.render`, `<Context.Provider>` as the only syntax, event pooling, Create React App, "wrap everything in `useCallback`".
- **Explain trade-offs, not absolutes.** Senior answers sound like "it depends on X; I'd pick A when …, B when …".
- **Build small things** that exercise the concepts: a form with Actions and `useOptimistic`, a search with `useDeferredValue`, a store with `useSyncExternalStore`, an accessible modal, a list that reorders with keys.
- **Mock interviews:** have someone pick random questions, or shuffle the TOC and time yourself.
