import { useId, useState } from 'react'
import styles from './styles.module.scss'

type Scale = 'c' | 'f'

const scaleNames: Record<Scale, string> = { c: 'Celsius', f: 'Fahrenheit' }

function toCelsius(fahrenheit: number) {
  return ((fahrenheit - 32) * 5) / 9
}

function toFahrenheit(celsius: number) {
  return (celsius * 9) / 5 + 32
}

// Returns '' for empty/invalid input so the other field simply stays empty.
function tryConvert(value: string, convert: (n: number) => number) {
  const input = Number.parseFloat(value)
  if (Number.isNaN(input)) return ''
  // Round to 3 decimals: 37 °C → 98.6, not 98.60000000000001.
  return String(Math.round(convert(input) * 1000) / 1000)
}

type TemperatureInputProps = {
  scale: Scale
  value: string
  onChange: (value: string) => void
}

// Controlled component: no state of its own. It displays what the parent gives it
// and reports changes upward. That's what makes syncing two of them possible.
export function TemperatureInput({ scale, value, onChange }: TemperatureInputProps) {
  const id = useId()
  return (
    <div className={styles.field}>
      <label htmlFor={id}>Temperature in {scaleNames[scale]}</label>
      <input
        id={id}
        className="input"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

type BoilingVerdictProps = { celsius: number }

export function BoilingVerdict({ celsius }: BoilingVerdictProps) {
  const boils = celsius >= 100
  return (
    // <output> = "result of a calculation", with the implicit role "status" (polite live region).
    <output className={boils ? styles.boils : styles.calm}>
      {boils ? 'The water would boil.' : 'The water would not boil.'}
    </output>
  )
}

export function TemperatureConverter() {
  // Single source of truth: what the user typed, and in which field.
  // Storing both temperatures would be redundant state that can get out of sync.
  const [temperature, setTemperature] = useState<{ value: string; scale: Scale }>({
    value: '',
    scale: 'c',
  })

  // Everything else is derived during render.
  const { value, scale } = temperature
  const celsius = scale === 'f' ? tryConvert(value, toCelsius) : value
  const fahrenheit = scale === 'c' ? tryConvert(value, toFahrenheit) : value
  const celsiusNumber = Number.parseFloat(celsius)

  return (
    <fieldset className={styles.converter}>
      <legend>Temperature converter</legend>
      <TemperatureInput
        scale="c"
        value={celsius}
        onChange={(v) => setTemperature({ value: v, scale: 'c' })}
      />
      <TemperatureInput
        scale="f"
        value={fahrenheit}
        onChange={(v) => setTemperature({ value: v, scale: 'f' })}
      />
      {!Number.isNaN(celsiusNumber) && <BoilingVerdict celsius={celsiusNumber} />}
    </fieldset>
  )
}

export default function SolutionDemo() {
  return <TemperatureConverter />
}
