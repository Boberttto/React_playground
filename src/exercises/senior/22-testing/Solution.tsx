// 22 – Testing (solution).
/* eslint-disable react/only-export-components -- the tests import these non-component exports from this module; fast refresh of an exercise file is not a concern */
// The "solution" of this exercise is the reference test suite in exercise.test.tsx
// (compare it with your UserSearch.test.tsx). This file is identical to Exercise.tsx.
import { fakeSearch } from './fakeUsers'
import { UserSearch } from './UserSearch'
import styles from './styles.module.scss'

export { UserSearch } from './UserSearch'
export { useDebouncedValue } from './useDebouncedValue'

export default function SolutionDemo() {
  return (
    <div className={styles.demo}>
      <p className={styles.muted}>
        Try “a”, “gr”, “zzz” (no results) and “error” (failure + retry). The demo uses an in-memory fake
        API, while the tests mock <code>fetch</code> or inject a <code>search</code> function.
      </p>
      <UserSearch search={fakeSearch} />
    </div>
  )
}
