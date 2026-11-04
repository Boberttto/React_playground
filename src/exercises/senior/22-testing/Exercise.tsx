// 22 – Testing. Instructions: see README.md (or the "Instructions" tab).
/* eslint-disable react/only-export-components -- the tests import these non-component exports from this module; fast refresh of an exercise file is not a concern */
// Nothing to implement here: the component is finished. Your work happens in
// UserSearch.test.tsx. This file only re-exports what the tests need, plus the demo.
import { fakeSearch } from './fakeUsers'
import { UserSearch } from './UserSearch'
import styles from './styles.module.scss'

export { UserSearch } from './UserSearch'
export { useDebouncedValue } from './useDebouncedValue'

export default function ExerciseDemo() {
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
