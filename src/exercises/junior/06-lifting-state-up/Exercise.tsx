// 06 – Lifting State Up. Instructions: see README.md (or the "Instructions" tab).
import { useId, useState } from 'react'
import styles from './styles.module.scss'

type Scale = 'c' | 'f'

const scaleNames: Record<Scale, string> = { c: 'Celsius', f: 'Fahrenheit' }

// F = C × 9/5 + 32   ·   C = (F − 32) × 5/9
// TODO 3: write toCelsius, toFahrenheit and tryConvert(value, convert)

type TemperatureInputProps = {
  scale: Scale
  // TODO 1: value: string; onChange: (value: string) => void
}

export function TemperatureInput({ scale }: TemperatureInputProps) {
  // TODO 1: this local state is the problem — the parent can't see or change it.
  const [value, setValue] = useState('')
  const id = useId()

  return (
    <div className={styles.field}>
      <label htmlFor={id}>Temperature in {scaleNames[scale]}</label>
      <input
        id={id}
        className="input"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}

type BoilingVerdictProps = { celsius: number }

export function BoilingVerdict({ celsius }: BoilingVerdictProps) {
  const boils = celsius >= 100
  return (
    <output className={boils ? styles.boils : styles.calm}>
      {boils ? 'The water would boil.' : 'The water would not boil.'}
    </output>
  )
}

export function TemperatureConverter() {
  // TODO 2: lift the state here — one { value, scale } object
  // TODO 3: derive celsius / fahrenheit during render
  return (
    <fieldset className={styles.converter}>
      <legend>Temperature converter</legend>
      <TemperatureInput scale="c" />
      <TemperatureInput scale="f" />
      {/* TODO 4: <BoilingVerdict celsius={…} /> only for valid input */}
    </fieldset>
  )
}

export default function ExerciseDemo() {
  return <TemperatureConverter />
}
