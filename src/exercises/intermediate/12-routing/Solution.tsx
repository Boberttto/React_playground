// Tests import `routes` and the loaders from this file, so it exports non-components on purpose.
// oxlint-disable react/only-export-components
import { useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  RouterProvider,
  createMemoryRouter,
  data,
  isRouteErrorResponse,
  useLoaderData,
  useNavigation,
  useRouteError,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { fetchUser, fetchUsers } from './api'
import styles from './styles.module.scss'

export function Layout() {
  // Data routers know when a navigation is waiting for loaders → free global pending UI.
  const navigation = useNavigation()
  return (
    <div className={styles.app}>
      <nav aria-label="Main" className={styles.nav}>
        {/* NavLink sets aria-current="page" + an `active` class when it matches.
            `end`: "/" would otherwise match every URL (they all start with "/"). */}
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/users">Users</NavLink>
        {navigation.state === 'loading' && <span className={styles.pending}>Loading…</span>}
      </nav>
      <main className={styles.main}>
        {/* The matching child route renders here. */}
        <Outlet />
      </main>
    </div>
  )
}

function Home() {
  return (
    <>
      <h2>Welcome</h2>
      <p>Pick “Users” in the navigation to browse the team.</p>
    </>
  )
}

// Loaders run *before* their route renders, so components never see a "no data yet" state.
export async function usersLoader() {
  return fetchUsers()
}

export async function userLoader({ params }: LoaderFunctionArgs) {
  const user = await fetchUser(params.userId ?? '')
  if (!user) {
    // Throwing stops rendering this route and shows the nearest errorElement instead.
    // `data()` attaches an HTTP-like status that isRouteErrorResponse() can recognise.
    throw data('User not found', { status: 404 })
  }
  return user
}

export function UsersPage() {
  // `typeof usersLoader` → TypeScript infers User[] from the loader's return type.
  const users = useLoaderData<typeof usersLoader>()
  return (
    <div className={styles.split}>
      <div>
        <h2>Users</h2>
        <ul className={styles.userList}>
          {users.map((user) => (
            <li key={user.id}>
              {/* Relative link: resolves to /users/<id> from inside the /users route. */}
              <NavLink to={user.id}>{user.name}</NavLink>
            </li>
          ))}
        </ul>
      </div>
      <section className={styles.detail}>
        {/* Nested route: either the index ("Select a user.") or :userId. */}
        <Outlet />
      </section>
    </div>
  )
}

export function UserPage() {
  const user = useLoaderData<typeof userLoader>()
  return (
    <article>
      <h3>{user.name}</h3>
      <p>{user.title}</p>
      <p>
        <a href={`mailto:${user.email}`}>{user.email}</a>
      </p>
    </article>
  )
}

export function ErrorPage() {
  // Unknown URLs and errors thrown by loaders/components end up here.
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <div className={styles.app}>
      <main className={styles.main}>
        <h2>{notFound ? '404 – Not found' : 'Something went wrong'}</h2>
        {!notFound && error instanceof Error && <pre>{error.message}</pre>}
        <Link to="/">Back home</Link>
      </main>
    </div>
  )
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    // Rendered instead of Layout when anything below fails — including unmatched URLs.
    errorElement: <ErrorPage />,
    // Shown while the very first loaders run (no previous page to keep on screen yet).
    hydrateFallbackElement: <p>Loading…</p>,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'users',
        loader: usersLoader,
        element: <UsersPage />,
        children: [
          { index: true, element: <p>Select a user.</p> },
          { path: ':userId', loader: userLoader, element: <UserPage /> },
        ],
      },
    ],
  },
]

export default function SolutionDemo() {
  // A memory router keeps its history in memory, so it doesn't fight with the
  // playground's own URL. In a real app you'd use createBrowserRouter at module level.
  const [router] = useState(() => createMemoryRouter(routes))
  return <RouterProvider router={router} />
}
