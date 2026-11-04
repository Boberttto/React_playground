# React Playground

A hands-on playground to build a solid React foundation, from **junior** to **senior** level, on the latest stack.

| Tool | Version | Why |
| --- | --- | --- |
| React | 19.3 | Actions, `use()`, `useOptimistic`, ref as prop… |
| React Compiler | 1.0 | Automatic memoization (see exercise 15) |
| Vite | 8 | Dev server + build |
| TypeScript | 7 | Strict mode |
| Sass (SCSS) | 1.107 | CSS Modules + design tokens |
| Vitest + Testing Library | 5 / 16 | Every exercise ships tests |
| React Router | 7.18 | Used in exercise 12 (v8 requires Node ≥ 22.22) |

## Getting started

```bash
npm install
npm run dev          # open http://localhost:5173
```

## How to work an exercise

1. Pick an exercise in the sidebar and read the **Instructions** tab (same content as its `README.md`).
2. Open `src/exercises/<level>/<NN-name>/Exercise.tsx` and solve the `TODO`s. The **Playground** tab hot-reloads as you type.
3. Check yourself with the tests:
   ```bash
   npm test -- 03-lists      # watch mode, filtered by folder name
   ```
   Tests fail on the untouched starter. That's expected. Make them pass.
4. Compare with the **Solution** tab (rendered) and **Solution code** tab (source), then read the **Sources** at the bottom of the README.

> Want to reset an exercise? `git checkout -- src/exercises/<level>/<NN-name>/Exercise.tsx`

## Learning path

| # | Junior | # | Intermediate | # | Senior |
| --- | --- | --- | --- | --- | --- |
| 01 | JSX & props | 08 | Custom hooks | 15 | Performance & React Compiler |
| 02 | `useState` | 09 | `useReducer` | 16 | Concurrency (`useTransition`, `useDeferredValue`) |
| 03 | Lists & keys | 10 | Context | 17 | `useOptimistic` |
| 04 | Controlled forms | 11 | Refs & `useImperativeHandle` | 18 | `use()` & Suspense |
| 05 | Conditional rendering | 12 | Routing (React Router data mode) | 19 | External store (`useSyncExternalStore`) |
| 06 | Lifting state up | 13 | Error boundaries & Suspense | 20 | Compound components |
| 07 | `useEffect` & data fetching | 14 | React 19 Actions | 21 | Portals & accessible modal |
| | | | | 22 | Testing strategy |

## Interview prep

See [`docs/interview/`](docs/interview/README.md):

- [Junior questions](docs/interview/junior.md)
- [Intermediate questions](docs/interview/intermediate.md)
- [Senior questions](docs/interview/senior.md)
- [Trick questions](docs/interview/trick-questions.md)
- [All sources](docs/sources.md)

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the playground |
| `npm test` | Vitest in watch mode (against your `Exercise.tsx` files) |
| `npm run test:solution` | Run every test against `Solution.tsx` (should be all green) |
| `npm run test:ui` | Vitest browser UI |
| `npm run typecheck` | TypeScript project check |
| `npm run lint` | oxlint (hooks rules, a11y, TS) |
| `npm run build` | Typecheck + production build |

## Project structure

```
src/
  styles/            SCSS design system: _tokens (variables, theme maps), _mixins, global
  components/        Playground shell (sidebar, tabs, markdown, error boundary)
  exercises/
    registry.ts      Auto-discovers exercises with import.meta.glob
    <level>/<NN-name>/
      README.md          Instructions + sources
      Exercise.tsx       ← you edit this
      Solution.tsx       Reference solution
      exercise.test.tsx  Tests (import from ./Exercise)
      styles.module.scss
docs/interview/      Interview questions by level + trick questions
```

### SCSS conventions

- Component styles are **CSS Modules**: `styles.module.scss` → `import styles from './styles.module.scss'`.
- Shared tokens: `@use 'tokens' as *;` and `@use 'mixins' as *;` (resolved via `loadPaths` in `vite.config.ts`).
- Theme colors are CSS custom properties read with the `c()` helper: `color: c(muted);`. Light and dark themes are generated from Sass maps.

### Adding your own exercise

Create `src/exercises/<level>/<NN-name>/` with `README.md` (first `# ` heading = title), `Exercise.tsx` and `Solution.tsx`. It appears in the sidebar automatically.
