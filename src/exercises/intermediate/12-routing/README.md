# 12 – Routing with React Router (data mode)

**Level:** Intermediate · **Time:** ~50 min

## Goal
Build a small "team directory" with React Router 7 in **data mode**: a route tree with a
shared layout, nested routes rendered through `<Outlet>`, a dynamic `:userId` segment,
**loaders** that fetch data *before* the route renders, and a 404 error page.

## Concepts
- **Data mode** = define routes as objects, create a router (`createBrowserRouter` in an app, `createMemoryRouter` in tests or embedded demos like this one) and render `<RouterProvider router={router} />`. It unlocks `loader`, `action`, `errorElement`…
- **Nested routes**: a parent route renders shared UI (nav, sidebar) and an `<Outlet />` where the matching child appears. An `index: true` route is the default child.
- **Dynamic segments**: `path: ':userId'` → `params.userId` in the loader, or `useParams()` in a component.
- **Loaders** run before the route renders. Whatever they return is read with `useLoaderData()`. No `useEffect` + loading flags + race conditions to manage.
- **Errors**: throwing in a loader (e.g. `throw data('Not found', { status: 404 })`) or hitting an unknown URL renders the nearest `errorElement`. Inside it, `useRouteError()` + `isRouteErrorResponse()` tell you what happened.
- `<NavLink>` is a `<Link>` that knows whether it's active (it sets `aria-current="page"` and an `active` class for you).

## Tasks
Open `Exercise.tsx`. Everything is imported from `'react-router'`.

1. In `Layout`, render an `<Outlet />` below the nav so child routes show up.
2. Turn the nav `<Link>`s into `<NavLink>`s (`/` should use `end` so it's only active on the home page).
3. Add a `users` child route:
   - `loader: usersLoader` (already written: it just returns `fetchUsers()`),
   - `element: <UsersPage />`, which lists every user as a `<Link to={user.id}>` (read them with `useLoaderData`) and renders its own `<Outlet />`,
   - an **index** child rendering `<p>Select a user.</p>`,
   - a `:userId` child with `loader: userLoader` and `element: <UserPage />`.
4. `userLoader` reads `params.userId`, calls `fetchUser`, and **throws** `data('User not found', { status: 404 })` when it returns `undefined`.
5. `UserPage` shows the user's name in an `<h3>`, plus their title and email.
6. Add `errorElement: <ErrorPage />` to the root route. `ErrorPage` shows a heading **`404 – Not found`** for 404 responses (and a generic message otherwise) and a `<Link to="/">Back home</Link>`.

## Check yourself
```bash
npm test -- 12-routing
```

## Hints
<details><summary>Hint 1 – the route tree shape</summary>

```tsx
{
  path: '/', element: <Layout />, errorElement: <ErrorPage />,
  children: [
    { index: true, element: <Home /> },
    { path: 'users', loader: usersLoader, element: <UsersPage />, children: [
      { index: true, element: <p>Select a user.</p> },
      { path: ':userId', loader: userLoader, element: <UserPage /> },
    ]},
  ],
}
```
</details>
<details><summary>Hint 2 – typing loader data</summary>

`const users = useLoaderData<typeof usersLoader>()` infers the awaited return type of the loader.
</details>
<details><summary>Hint 3 – the error page</summary>

```tsx
const error = useRouteError()
if (isRouteErrorResponse(error) && error.status === 404) { … }
```
</details>

## Going further
- Show a global pending indicator with `useNavigation().state === 'loading'`.
- Add a search form on `/users` that uses `<Form>` and reads `?q=` from `request.url` in the loader.
- Add an `action` to edit a user and see loaders revalidate automatically.
- Try **framework mode** (`@react-router/dev`) for file-based routes, type-safe params and SSR.

## Sources
- [Picking a Mode – reactrouter.com](https://reactrouter.com/start/modes)
- [Data mode: Routing – reactrouter.com](https://reactrouter.com/start/data/routing)
- [Data mode: Data Loading – reactrouter.com](https://reactrouter.com/start/data/data-loading)
- [`createMemoryRouter` – reactrouter.com](https://reactrouter.com/api/data-routers/createMemoryRouter)
- [Error Boundaries – reactrouter.com](https://reactrouter.com/how-to/error-boundary)
- [`NavLink` – reactrouter.com](https://reactrouter.com/api/components/NavLink)
