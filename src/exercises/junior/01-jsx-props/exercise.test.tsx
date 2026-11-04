import { render, screen } from '@testing-library/react'
import ExerciseDemo, { ProfileCard } from './Exercise'

describe('01 – ProfileCard', () => {
  it('renders the name in a heading', () => {
    render(<ProfileCard name="Ada" />)
    expect(screen.getByRole('heading', { name: 'Ada' })).toBeInTheDocument()
  })

  it('renders the jobTitle, defaulting to "Developer"', () => {
    const { rerender } = render(<ProfileCard name="Ada" jobTitle="Mathematician" />)
    expect(screen.getByText('Mathematician')).toBeInTheDocument()
    rerender(<ProfileCard name="Ada" />)
    expect(screen.getByText('Developer')).toBeInTheDocument()
  })

  it('renders the avatar only when avatarUrl is given', () => {
    const { rerender } = render(<ProfileCard name="Ada" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    rerender(<ProfileCard name="Ada" avatarUrl="/ada.png" />)
    expect(screen.getByRole('img', { name: 'Ada' })).toHaveAttribute('src', '/ada.png')
  })

  it('renders children', () => {
    render(
      <ProfileCard name="Ada">
        <button>Follow</button>
      </ProfileCard>,
    )
    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument()
  })

  it('demo renders two cards', () => {
    render(<ExerciseDemo />)
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
  })
})
