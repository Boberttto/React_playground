// 01 – JSX & Props. Instructions: see README.md (or the "Instructions" tab).
import styles from './styles.module.scss'

// TODO 1: type the props (name, jobTitle?, avatarUrl?, children?)
type ProfileCardProps = {
  name: string
}

export function ProfileCard({ name }: ProfileCardProps) {
  // TODO 2–5: render name (h2), jobTitle with a default, optional avatar, children
  return <div className={styles.card}>{name}</div>
}

export default function ExerciseDemo() {
  // TODO 6: render two ProfileCards
  return (
    <div className={styles.grid}>
      <ProfileCard name="Ada Lovelace" />
    </div>
  )
}
