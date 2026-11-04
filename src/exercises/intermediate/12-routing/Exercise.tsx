// 12 – Routing. Instructions: see README.md (or the "Instructions" tab).
// Tests import `routes` and the loaders from this file, so it exports non-components on purpose.
// oxlint-disable react/only-export-components
import { useState } from 'react'
import { Link, RouterProvider, createMemoryRouter, type LoaderFunctionArgs, type RouteObject } from 'react-router'
import { fetchUser, fetchUsers } from './api'
import styles from './styles.module.scss'

export function Layout() {
  return (
    <div className={styles.app}>
      {/* TODO 2: use <NavLink> (with `end` on "/") so the active link gets aria-current="page" */}
      <nav aria-label="Main" className={styles.nav}>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
      </nav>
      <main className={styles.main}>{/* TODO 1: render the matching child route here */}</main>
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

export async function usersLoader() {
  return fetchUsers()
}

// TODO 4: throw data('User not found', { status: 404 }) when the user doesn't exist
export async function userLoader({ params }: LoaderFunctionArgs) {
  return fetchUser(params.userId ?? '')
}

// TODO 3: read the users with useLoaderData<typeof usersLoader>(), render a <Link> per user,
//         and an <Outlet /> for the nested route
export function UsersPage() {
  return (
    <div className={styles.split}>
      <h2>Users</h2>
    </div>
  )
}

// TODO 5: read the user with useLoaderData and show name (h3), title and email
export function UserPage() {
  return <p>TODO: user details</p>
}

// TODO 6: useRouteError() + isRouteErrorResponse() → "404 – Not found" heading + "Back home" link
export function ErrorPage() {
  return <h2>Something went wrong</h2>
}

// TODO 3 + 6: add the `users` routes and the root errorElement
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    hydrateFallbackElement: <p>Loading…</p>,
    children: [{ index: true, element: <Home /> }],
  },
]

export default function ExerciseDemo() {
  // A memory router keeps its history in memory, so it doesn't fight with the
  // playground's own URL. Lazy init: create it once per mount.
  const [router] = useState(() => createMemoryRouter(routes))
  return <RouterProvider router={router} />
}
