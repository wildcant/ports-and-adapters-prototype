# TanStack Start: Route Loaders and Data Loading

Research notes compiled from official TanStack documentation (July 2025).

---

## 1. What Are Route Loaders?

Route loaders are functions defined on route configurations that run **before** a route's component renders. They fetch data needed by the route and make it available to the component via the `useLoaderData()` hook.

Loaders are a TanStack **Router** feature. TanStack Start builds on top of Router and adds server functions, SSR, and full-stack capabilities -- but the loader mechanism itself comes from the router.

### Basic Loader Definition

Loaders support two forms:

```tsx
// Simple form
export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  component: PostsPage,
})

// Object form (with configuration)
export const Route = createFileRoute('/posts')({
  loader: {
    handler: () => fetchPosts(),
    staleReloadMode: 'blocking',
  },
  component: PostsPage,
})
```

Source: [TanStack Router - Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)

### Loader Parameters

Loaders receive a single object with these properties:

| Parameter | Description |
|-----------|-------------|
| `abortController` | Cancels when route unloads or becomes outdated |
| `cause` | Why the loader ran: `'enter'`, `'preload'`, or `'stay'` |
| `context` | Merged parent + route-specific context from `beforeLoad` |
| `deps` | Object from `loaderDeps` function |
| `location` | Current location |
| `params` | Route path parameters |
| `parentMatchPromise` | Promise resolving parent route match |
| `preload` | Boolean indicating preload vs. normal load |
| `route` | The route itself |

Source: [TanStack Router - Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)

### Consuming Loader Data

Components access loader data via `Route.useLoaderData()`:

```tsx
function PostsPage() {
  const posts = Route.useLoaderData()
  return <div>{posts.map(p => <Post key={p.id} post={p} />)}</div>
}
```

For deeply nested components, use `getRouteApi`:

```tsx
const routeApi = getRouteApi('/posts')

function DeepChild() {
  const data = routeApi.useLoaderData()
  // ...
}
```

Source: [TanStack Router - Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)

---

## 2. How Loaders Relate to SSR

### SSR Overview

TanStack Start provides full-document SSR. The router supports two SSR modes:

- **Non-streaming SSR**: The entire page renders on the server in one HTML request with serialized data needed for client hydration.
- **Streaming SSR**: Critical initial markup streams first, with remaining page content following as it renders on the server.

Source: [TanStack Router - SSR Guide](https://tanstack.com/router/latest/docs/framework/react/guide/ssr)

### Loader Data is Automatically Dehydrated and Rehydrated

During SSR, resolved loader data is "automatically dehydrated and rehydrated by TanStack Router." This means:

1. On the server, loaders run and fetch data.
2. The resolved data is serialized into the HTML response.
3. On the client, the data is deserialized and provided to components without refetching.

The router's built-in serializer supports `undefined`, `Date`, `Error`, and `FormData`. Complex types like `Map`, `Set`, and `BigInt` require custom serializers.

Source: [TanStack Router - SSR Guide](https://tanstack.com/router/latest/docs/framework/react/guide/ssr)

### The `ssr` Route Option

Routes can control their SSR behavior with the `ssr` option. The `'data-only'` setting runs the loader on the server (so server functions execute and data is fetched) but skips server-side rendering of the component itself -- the component only renders on the client using the pre-fetched data.

```tsx
export const Route = createFileRoute('/dashboard')({
  ssr: 'data-only',
  loader: async () => ({
    Dashboard: await getDashboard(),
  }),
  component: DashboardPage,
})
```

Source: [TanStack Start - Server Components Guide](https://tanstack.com/start/latest/docs/framework/react/guide/server-components)

### Server History Management

The router automatically handles history: using `createBrowserHistory` on clients and `createMemoryHistory` on servers to avoid `window` object conflicts.

Source: [TanStack Router - SSR Guide](https://tanstack.com/router/latest/docs/framework/react/guide/ssr)

---

## 3. How Data Loading Works in TanStack Start Overall

### The Complete Data Loading Lifecycle

TanStack Start's data loading combines three layers:

1. **Route loaders** (from TanStack Router) -- coordinate when data is fetched relative to navigation.
2. **Server functions** (from TanStack Start) -- define where and how data is fetched (always on the server).
3. **Built-in SWR caching** (from TanStack Router) -- controls staleness, revalidation, and garbage collection.

### Built-in SWR Caching

TanStack Router includes a built-in stale-while-revalidate cache. Cache keys are derived from:

- The fully parsed route pathname
- Additional dependencies declared via `loaderDeps`

Key configuration options on routes:

| Option | Default | Description |
|--------|---------|-------------|
| `staleTime` | 0ms (navigations), 30s (preloads) | How long data stays fresh before reload |
| `gcTime` | 30 minutes | How long cached data persists before garbage collection |
| `shouldReload` | -- | Function returning boolean to override reload logic |
| `staleReloadMode` | `'background'` | `'background'` or `'blocking'` for stale reloads |
| `preloadStaleTime` | 30s | How long preloaded data stays fresh |
| `preloadMaxAge` | 30s | Maximum caching duration for preloaded data |

Source: [TanStack Router - Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading),
[TanStack Router - RouteOptions API](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType)

### Using Search Parameters in Loaders

Search params are not directly available in loaders. Instead, use `loaderDeps` to declare which search params affect caching:

```tsx
export const Route = createFileRoute('/posts')({
  loaderDeps: ({ search: { offset } }) => ({ offset }),
  loader: async ({ deps: { offset } }) => fetchPosts({ offset }),
  component: PostsPage,
})
```

This ensures the cache correctly distinguishes between different parameter values.

Source: [TanStack Router - Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)

### Route Context and `beforeLoad`

Context can be passed to loaders via the router or per-route using `beforeLoad`:

```tsx
// Global context via router
const router = createRouter({
  routeTree,
  context: { queryClient },
})

// Per-route context via beforeLoad
export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
    return { session }
  },
  loader: ({ context: { session } }) => fetchAdminData(session),
})
```

`beforeLoad` runs before the loader and can:
- Add to the route context
- Perform authentication checks
- Throw redirects to cancel navigation

Source: [TanStack Router - Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading),
[TanStack Router - RouteOptions API](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType)

### Preloading

Routes can be preloaded before the user navigates to them. Three strategies:

- **Intent**: Triggered by hover/touch on `<Link>` components
- **Viewport**: Uses Intersection Observer when links enter the viewport
- **Render**: Preloads immediately when a `<Link>` renders

When preloading, loaders run with `preload: true` and `cause: 'preload'`. Preloaded data stays fresh for 30 seconds by default. Unused preloaded data is garbage collected after 30 seconds.

Source: [TanStack Router - Preloading](https://tanstack.com/router/latest/docs/framework/react/guide/preloading)

### Pending and Error UI

Routes support `pendingComponent` and `errorComponent`:

```tsx
export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  pendingComponent: () => <Spinner />,
  errorComponent: ({ error, reset }) => (
    <div>
      {error.message}
      <button onClick={() => router.invalidate()}>Retry</button>
    </div>
  ),
  component: PostsPage,
})
```

Pending components show after `pendingMs` (default 1000ms) and display for at least `pendingMinMs` (default 500ms) to avoid flashes.

Source: [TanStack Router - Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)

### External Data Libraries (TanStack Query)

TanStack Router can coordinate with external caching libraries like TanStack Query. The typical pattern uses `ensureQueryData` in the loader and `useSuspenseQuery` in the component:

```tsx
const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: () => fetchPosts(),
})

export const Route = createFileRoute('/posts')({
  loader: () => queryClient.ensureQueryData(postsQueryOptions),
  component: () => {
    const { data: { posts } } = useSuspenseQuery(postsQueryOptions)
    return <div>...</div>
  },
})
```

Set `defaultPreloadStaleTime: 0` on the router to delegate all caching to the external library.

For SSR hydration with TanStack Query, use the router's `dehydrate` and `hydrate` callbacks:

```tsx
const router = createRouter({
  routeTree,
  context: { queryClient },
  dehydrate: () => ({
    queryClientState: dehydrate(queryClient),
  }),
  hydrate: (dehydrated) => {
    hydrate(queryClient, dehydrated.queryClientState)
  },
})
```

Source: [TanStack Router - External Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading)

---

## 4. How Loaders Interact with `createServerFn`

### Server Functions Overview

Server functions are created with `createServerFn()` from `@tanstack/react-start`. They define server-only logic callable from anywhere in the application, including loaders, components, event handlers, and other server functions.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getCount = createServerFn({ method: 'GET' })
  .handler(() => {
    return readCount()
  })
```

Source: [TanStack Start - Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

### Execution Behavior: SSR vs. Client

Server functions behave differently depending on where they execute:

- **During SSR**: Server functions execute directly on the server -- no network request is made. The function runs in the same server process.
- **On the client**: Calls are translated into `fetch` requests (RPCs) to the server, which executes the function and returns the result.

This dual behavior is transparent to the caller. The same code works in both contexts.

Source: [TanStack Start - Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

### The Canonical Pattern: Loader Calls Server Function

The primary pattern in TanStack Start is for **loaders to call server functions** for data fetching:

```tsx
// Define the server function
const getCount = createServerFn({ method: 'GET' })
  .handler(() => {
    return readCount()
  })

// Use it in a route loader
export const Route = createFileRoute('/')({
  loader: async () => await getCount(),
  component: Home,
})

// Access in the component
function Home() {
  const state = Route.useLoaderData()
  return <div>Count: {state}</div>
}
```

This pattern gives you:
- **Type-safe data flow** from server function return type through loader to `useLoaderData()`
- **Automatic SSR**: During SSR, the loader runs on the server and calls the server function directly; the resolved data is dehydrated into the HTML
- **Client-side caching**: After hydration, subsequent navigations use the router's SWR cache and call the server function via RPC only when data is stale
- **Preloading**: The loader (and its server function call) can be triggered before navigation for instant page transitions

Source: [TanStack Start - Build from Scratch](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)

### HTTP Methods

- **GET** (default): For data fetching. Results can be cached.
- **POST**: For mutations. Created via `createServerFn({ method: 'POST' })`.

Source: [TanStack Start - Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

### Validation

Server functions validate inputs crossing the network boundary using `.validator()`:

```tsx
const updateCount = createServerFn({ method: 'POST' })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount()
    await fs.promises.writeFile(filePath, `${count + data}`)
  })
```

Validators accept raw TypeScript type assertions or schema libraries like Zod.

Source: [TanStack Start - Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions),
[TanStack Start - Build from Scratch](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)

### Mutations and Cache Invalidation

After a mutation, call `router.invalidate()` to force all active route loaders to re-run:

```tsx
function Home() {
  const router = useRouter()
  const state = Route.useLoaderData()

  return (
    <button
      onClick={() => {
        updateCount({ data: 1 }).then(() => {
          router.invalidate()
        })
      }}
    >
      Add 1 to {state}?
    </button>
  )
}
```

Source: [TanStack Start - Build from Scratch](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)

### Server Functions in Components (Without Loaders)

Server functions can also be called directly from components using `useServerFn()`, bypassing the loader entirely. This is useful for mutations or actions triggered by user interaction rather than navigation.

Source: [TanStack Start - Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

### Middleware with Server Functions and Loaders

Middleware can wrap both server routes (including SSR requests) and server functions. Middleware enables:

- Authentication and authorization
- Logging and observability
- Context injection (passing data downstream to handlers)
- Client-to-server and server-to-client context transfer

There are two types:
- **Request middleware** (`.server()` only): Handles all server requests including SSR
- **Server function middleware** (`.client()`, `.validator()`, `.server()`): Wraps `createServerFn` calls specifically

```tsx
const authMiddleware = createMiddleware({ type: 'function' })
  .server(async ({ next }) => {
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
    return next({ context: { session } })
  })

const getProtectedData = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context: { session } }) => {
    return fetchDataForUser(session.userId)
  })
```

Global middleware can be configured in `src/start.ts`:

```tsx
export const startInstance = createStart(() => ({
  requestMiddleware: [globalMiddleware],
  functionMiddleware: [globalServerFnMiddleware],
}))
```

Source: [TanStack Start - Middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)

### Server Context Utilities

Inside server function handlers, you can access request-level information:

- `getRequest()` -- full Request object
- `getRequestHeader(name)` -- specific header
- `setResponseHeaders()` / `setResponseStatus()` -- customize the response

Source: [TanStack Start - Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

### Static Server Functions

An experimental feature that executes server functions at **build time** and caches results as static JSON assets. Useful for content that doesn't change per-request:

1. During prerendering, the server function runs once and results are saved as static JSON files.
2. On initial load, the prerendered HTML contains embedded data.
3. On subsequent client-side navigations, the client fetches the static JSON file instead of calling the server.

Source: [TanStack Start - Static Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions)

### Server Components

Server components can be rendered inside server functions and returned through loaders:

```tsx
const getGreeting = createServerFn().handler(async () => {
  const Renderable = await renderServerComponent(<Greeting />)
  return { Renderable }
})

export const Route = createFileRoute('/')({
  loader: async () => {
    const { Renderable } = await getGreeting()
    return { Greeting: Renderable }
  },
  component: HomePage,
})

function HomePage() {
  const { Greeting } = Route.useLoaderData()
  return <>{Greeting}</>
}
```

Source: [TanStack Start - Server Components](https://tanstack.com/start/latest/docs/framework/react/guide/server-components)

### Security: CSRF Protection

Server functions are same-origin RPC endpoints. TanStack Start automatically installs CSRF middleware that verifies requests via `Sec-Fetch-Site`, `Origin`, or `Referer` headers.

Source: [TanStack Start - Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

### Build-Time Code Splitting

The build process replaces server function implementations with RPC stubs in client bundles. This means importing server functions in client code is safe -- the actual server logic is never shipped to the browser.

Source: [TanStack Start - Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

---

## Summary: The Mental Model

```
Navigation / Preload
        |
        v
  beforeLoad()        <-- auth checks, context setup
        |
        v
    loader()           <-- calls createServerFn (GET) for data
        |               |
        |    [SSR]       +-- executes directly on server
        |    [Client]    +-- makes fetch RPC to server
        |
        v
  useLoaderData()      <-- component receives typed data
        |
        v
   Component renders
        |
   [User action]
        |
        v
  createServerFn (POST)  <-- mutation
        |
        v
  router.invalidate()    <-- re-runs active loaders
```

The key insight: **loaders are the coordination layer** (when to fetch), while **server functions are the execution layer** (how and where to fetch). During SSR, server functions run directly in-process. On the client, they become RPCs. The loader + router cache ensures data is fresh, preloadable, and type-safe end-to-end.

---

## Sources

All information sourced from official TanStack documentation:

- [TanStack Start - Overview](https://tanstack.com/start/latest/docs/framework/react/overview)
- [TanStack Start - Build from Scratch](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)
- [TanStack Start - Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [TanStack Start - Middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [TanStack Start - Static Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions)
- [TanStack Start - Server Components](https://tanstack.com/start/latest/docs/framework/react/guide/server-components)
- [TanStack Router - Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)
- [TanStack Router - SSR Guide](https://tanstack.com/router/latest/docs/framework/react/guide/ssr)
- [TanStack Router - Preloading](https://tanstack.com/router/latest/docs/framework/react/guide/preloading)
- [TanStack Router - External Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading)
- [TanStack Router - RouteOptions API](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType)
