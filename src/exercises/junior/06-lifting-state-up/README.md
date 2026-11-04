# 06 – Lifting State Up

**Level:** Junior · **Time:** ~30 min

## Goal
Build a temperature converter with a **Celsius** and a **Fahrenheit** input that stay in sync,
plus a verdict telling whether water would boil. You'll move state from two siblings up to
their closest common parent, so there is a **single source of truth**.

## Concepts
- When two components need the same data, **lift the state up** to their closest common parent and pass it down as props. The children become **controlled** by the parent: they receive `value` and call `onChange`.
- **Single source of truth:** store the *minimum* state and derive the rest. Here, don't store both temperatures (they'd drift apart and you'd need to update both on every keystroke). Store **what the user typed** and **in which scale**:
  ```tsx
  const [temperature, setTemperature] = useState({ value: '', scale: 'c' as Scale })
  const celsius = temperature.scale === 'f' ? convert(temperature.value, toCelsius) : temperature.value
  ```
  The field the user is typing in shows exactly their input (no rounding fights), and the other one is computed during render.
- Controlled vs uncontrolled *components* (not only inputs): a component that owns its state is **uncontrolled** (the parent can't influence it); one driven by props is **controlled**. Controlled components are more flexible; uncontrolled ones need less wiring.
- State that lives in a parent is passed down; **events go up** through callback props (`onChange`, `onSelect`…). Data flows one way.
- Converting: `F = C × 9/5 + 32`, `C = (F − 32) × 5/9`. Round the output (e.g. to 3 decimals) to avoid `98.60000000000001`.

## Tasks
Open `Exercise.tsx`. In the starter, each `TemperatureInput` keeps its own state, so the two inputs know nothing about each other.

1. Turn `TemperatureInput` into a controlled component: props `scale`, `value: string`, `onChange: (value: string) => void`. Remove its local state. Its label is `Temperature in Celsius` / `Temperature in Fahrenheit`.
2. Lift the state into `TemperatureConverter`: one `{ value, scale }` object.
3. Derive `celsius` and `fahrenheit` strings during render. Write a `tryConvert(value, convert)` helper that returns `''` for empty or non-numeric input, and rounds to 3 decimals otherwise.
4. Render `<BoilingVerdict celsius={…} />` (already done for you) **only** when the input is a valid number.

## Check yourself
```bash
npm test -- 06-lifting-state-up
```

## Hints
<details><summary>Hint 1 – tryConvert</summary>

```tsx
function tryConvert(value: string, convert: (n: number) => number) {
  const input = Number.parseFloat(value)
  if (Number.isNaN(input)) return ''
  return String(Math.round(convert(input) * 1000) / 1000)
}
```
</details>
<details><summary>Hint 2 – the handlers</summary>

Each input gets its own tiny handler that records both the value and the scale:
`onChange={value => setTemperature({ value, scale: 'f' })}`.
</details>

## Going further
- Add a Kelvin input. How many places need to change? (With a single source of truth: very few.)
- Imagine both inputs lived in different branches of a big tree. At some point, prop-drilling hurts — that's what Context (intermediate track) is for.

## Sources
- [Sharing State Between Components – react.dev](https://react.dev/learn/sharing-state-between-components)
- [Choosing the State Structure – react.dev](https://react.dev/learn/choosing-the-state-structure)
- [Thinking in React – react.dev](https://react.dev/learn/thinking-in-react)
- [`<input>` – react.dev](https://react.dev/reference/react-dom/components/input)
- [`Number.parseFloat()` – MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseFloat)
