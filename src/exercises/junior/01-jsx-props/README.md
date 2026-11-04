# 01 – JSX & Props

**Level:** Junior · **Time:** ~20 min

## Goal
Build a reusable `ProfileCard` component. You'll practise JSX syntax, passing and
destructuring props, default values, `children`, and typing props with TypeScript.

## Concepts
- JSX is syntactic sugar for function calls (`jsx('h2', { children: name })`). It must return **one** root element (use `<>…</>` fragments when needed).
- Use `className` (not `class`) and camelCase attributes (`onClick`, `htmlFor`).
- Props are **read-only**. A component must never mutate its props.
- `children` is just a prop containing whatever you put between the tags.
- Default values come from destructuring: `function Card({ size = 'md' })` (`defaultProps` was removed for function components in React 19).

## Tasks
Open `Exercise.tsx`.

1. Type the props: `name` (string, required), `jobTitle` (string, optional), `avatarUrl` (string, optional), `children` (optional `ReactNode`).
2. Render the `name` inside an `<h2>`.
3. Render `jobTitle` inside a `<p>`; when it's missing, show **`Developer`** (default prop value).
4. Render an `<img>` with `alt={name}` **only** if `avatarUrl` is provided.
5. Render `children` below the jobTitle (e.g. a bio or a button).
6. In the default `ExerciseDemo` component, render **two** cards: one with all props, one with only a name.

## Check yourself
```bash
npm test -- 01-jsx-props
```

## Hints
<details><summary>Hint 1 – typing children</summary>

`import type { ReactNode } from 'react'` then `children?: ReactNode`.
</details>
<details><summary>Hint 2 – conditional image</summary>

`{avatarUrl && <img src={avatarUrl} alt={name} />}` — safe here because `avatarUrl` is a string (an empty string renders nothing). Beware `&&` with numbers (see exercise 05).
</details>

## Going further
- Add a `size: 'sm' | 'md' | 'lg'` prop that maps to SCSS modifier classes.
- Why is `alt` important? Read the MDN page on `alt` text.

## Sources
- [Writing Markup with JSX – react.dev](https://react.dev/learn/writing-markup-with-jsx)
- [Passing Props to a Component – react.dev](https://react.dev/learn/passing-props-to-a-component)
- [Using TypeScript – react.dev](https://react.dev/learn/typescript)
- [React 19 upgrade guide: removed `defaultProps` for functions – react.dev](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops)
- [`<img>`: the `alt` attribute – MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#alt)
