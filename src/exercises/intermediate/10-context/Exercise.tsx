// 10 – Context. Instructions: see README.md (or the "Instructions" tab).
// Tests import the hooks from this file, so it exports non-components on purpose.
// oxlint-disable react/only-export-components
import { createContext, useContext, useState, type ReactNode } from 'react'
import styles from './styles.module.scss'

export type Theme = 'light' | 'dark'
type ThemeContextValue = { theme: Theme; toggleTheme: () => void }

// TODO 1a: default to `null` so useTheme() can detect a missing provider
const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode; initialTheme?: Theme }) {
  // TODO 1b: hold the theme in state (start at `initialTheme`), add toggleTheme,
  //          and provide a memoized { theme, toggleTheme } value
  return <ThemeContext value={{ theme: 'light', toggleTheme: () => {} }}>{children}</ThemeContext>
}

// TODO 1c: throw an Error mentioning "ThemeProvider" when there is no provider
export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button className="btn" onClick={toggleTheme}>
      Switch to {next} theme
    </button>
  )
}

// ---------------------------------------------------------------------------

export type User = { name: string }
type AuthActions = { login: (name: string) => void; logout: () => void }

// TODO 2: split this into AuthStateContext (user) and AuthActionsContext (stable actions),
//         both defaulting to null, and make the hooks throw outside <AuthProvider>.
const AuthContext = createContext<{ user: User | null } & AuthActions>({
  user: null,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const value = {
    user,
    login: (name: string) => setUser({ name }),
    logout: () => setUser(null),
  }
  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): User | null {
  return useContext(AuthContext).user
}

export function useAuthActions(): AuthActions {
  return useContext(AuthContext)
}

// TODO 4: should only read the actions
export function LogoutButton() {
  const { logout } = useAuthActions()
  return (
    <button className="btn" onClick={logout}>
      Log out
    </button>
  )
}

export function UserMenu() {
  const user = useAuth()
  // TODO 3: signed out → form with a "Name" field + "Log in" button (call login(name));
  //         signed in → "Signed in as <name>" + <LogoutButton />
  return <p className={styles.muted}>{user ? user.name : 'Not signed in'}</p>
}

// ---------------------------------------------------------------------------

// Composition: Panel doesn't know (or care) what it renders.
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.panel}>
      <h3 className={styles.panelTitle}>{title}</h3>
      {children}
    </section>
  )
}

function ThemedShell({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  return (
    <div className={`${styles.shell} ${theme === 'dark' ? styles.dark : ''}`}>
      <p className={styles.muted}>Current theme: {theme}</p>
      {children}
    </div>
  )
}

export default function ExerciseDemo() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedShell>
          <Panel title="Appearance">
            <ThemeToggleButton />
          </Panel>
          <Panel title="Account">
            <UserMenu />
          </Panel>
        </ThemedShell>
      </AuthProvider>
    </ThemeProvider>
  )
}
