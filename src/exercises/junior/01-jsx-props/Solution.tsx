import type { ReactNode } from 'react'
import styles from './styles.module.scss'

type ProfileCardProps = {
  name: string
  jobTitle?: string
  avatarUrl?: string
  children?: ReactNode
}

// Defaults come from destructuring — `defaultProps` is gone for function components in React 19.
export function ProfileCard({ name, jobTitle = 'Developer', avatarUrl, children }: ProfileCardProps) {
  return (
    <div className={styles.card}>
      {/* `avatarUrl` is a string, so `&&` is safe: '' renders nothing. */}
      {avatarUrl && <img className={styles.avatar} src={avatarUrl} alt={name} />}
      <div>
        <h2 className={styles.name}>{name}</h2>
        <p className={styles.role}>{jobTitle}</p>
        {children}
      </div>
    </div>
  )
}

export default function SolutionDemo() {
  return (
    <div className={styles.grid}>
      <ProfileCard
        name="Ada Lovelace"
        jobTitle="First programmer"
        avatarUrl="https://upload.wikimedia.org/wikipedia/commons/a/a4/Ada_Lovelace_portrait.jpg"
      >
        <p>Wrote the first algorithm intended for a machine.</p>
      </ProfileCard>
      <ProfileCard name="Grace Hopper" />
    </div>
  )
}
