import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BoilingVerdict, TemperatureConverter, TemperatureInput } from './Exercise'

const celsiusInput = () => screen.getByLabelText('Temperature in Celsius')
const fahrenheitInput = () => screen.getByLabelText('Temperature in Fahrenheit')

describe('06 – TemperatureInput (controlled)', () => {
  it('displays the value it receives and reports changes to the parent', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TemperatureInput scale="c" value="10" onChange={onChange} />)
    expect(celsiusInput()).toHaveValue('10')

    await user.type(celsiusInput(), '5')
    expect(onChange).toHaveBeenLastCalledWith('105')
    // The parent didn't update `value`, so the input must not change on its own.
    expect(celsiusInput()).toHaveValue('10')
  })
})

describe('06 – BoilingVerdict', () => {
  it('says whether water boils', () => {
    const { rerender } = render(<BoilingVerdict celsius={100} />)
    expect(screen.getByRole('status')).toHaveTextContent('The water would boil.')
    rerender(<BoilingVerdict celsius={99} />)
    expect(screen.getByRole('status')).toHaveTextContent('The water would not boil.')
  })
})

describe('06 – TemperatureConverter', () => {
  it('converts Celsius to Fahrenheit', async () => {
    const user = userEvent.setup()
    render(<TemperatureConverter />)
    await user.type(celsiusInput(), '100')
    expect(fahrenheitInput()).toHaveValue('212')
    expect(screen.getByRole('status')).toHaveTextContent('The water would boil.')
  })

  it('converts Fahrenheit to Celsius', async () => {
    const user = userEvent.setup()
    render(<TemperatureConverter />)
    await user.type(fahrenheitInput(), '32')
    expect(celsiusInput()).toHaveValue('0')
    expect(screen.getByRole('status')).toHaveTextContent('The water would not boil.')
  })

  it('rounds to 3 decimals', async () => {
    const user = userEvent.setup()
    render(<TemperatureConverter />)
    await user.type(celsiusInput(), '37')
    expect(fahrenheitInput()).toHaveValue('98.6')
  })

  it('keeps the inputs in sync when switching between them', async () => {
    const user = userEvent.setup()
    render(<TemperatureConverter />)
    await user.type(celsiusInput(), '100')
    await user.clear(fahrenheitInput())
    await user.type(fahrenheitInput(), '50')
    expect(celsiusInput()).toHaveValue('10')
  })

  it('empties the other field and hides the verdict for empty or invalid input', async () => {
    const user = userEvent.setup()
    render(<TemperatureConverter />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await user.type(celsiusInput(), 'abc')
    expect(fahrenheitInput()).toHaveValue('')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await user.clear(celsiusInput())
    await user.type(celsiusInput(), '20')
    await user.clear(celsiusInput())
    expect(fahrenheitInput()).toHaveValue('')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
