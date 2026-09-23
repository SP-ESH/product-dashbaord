# Product Admin Dashboard

An admin dashboard for browsing and managing products from the
[DummyJSON](https://dummyjson.com) API. A user logs in, then lists, searches,
filters, sorts, paginates, views, creates, edits and deletes products.

The project is deliberately built with plain React state, the URL, and a single
shared Axios client — no data-fetching or table libraries — so every piece of
behaviour is visible in the code.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| HTTP | Axios (single shared instance) |
| Tests | Vitest |

No React Query, SWR, Redux, table library or pagination library is used —
pagination, search, filtering and sorting are implemented in this repo.

## Features

- **Authentication** — `POST /auth/login`, token stored in `localStorage`,
  protected routes, logout.
- **Product list** — responsive table (desktop) / cards (mobile) showing image,
  title, category, price, rating and stock.
- **Pagination** — page numbers with ellipsis, Previous/Next, page-size selector
  (10 / 20 / 50) and a "Showing 21–40 of 194" summary, all derived from the
  API's `total`, `limit` and `skip`.
- **Search** — debounced (450 ms), with in-flight requests canceled so a stale
  response can never overwrite a newer one.
- **Category filter** — loaded from `/products/categories`.
- **Sorting** — by title, price or rating, ascending or descending, done
  server-side.
- **Product details** — gallery, description, metadata and reviews.
- **Create / edit / delete** — validated forms, a delete confirmation modal,
  duplicate-submission protection, a bottom-right toast confirming what
  happened, and a local overlay that keeps the result visible for the session.
- **URL state** — `page`, `pageSize`, `search`, `category`, `sort` and `order`
  all live in the query string.
- **Loading / empty / error states** for every async operation, with retry.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional; the default API URL is used otherwise
npm run dev                  # http://localhost:3000
```

Other commands:

```bash
npm run build       # production build
npm start           # serve the production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest (59 tests)
```

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://dummyjson.com` | Base URL for every API call |

See `.env.example`. The variable is `NEXT_PUBLIC_` because the browser makes the
requests directly; it is a public base URL, not a secret.

### Login credentials

```
username: emilys
password: emilyspass
```

## Project structure

```
src/
  app/                          # routes only — no API calls live here
    layout.tsx                  # html shell + providers
    page.tsx                    # redirects to /products
    providers.tsx               # AuthProvider + MutationsProvider
    login/page.tsx
    products/
      layout.tsx                # RequireAuth + header, guards every child route
      page.tsx                  # Suspense wrapper around ProductsView
      new/page.tsx
      [id]/page.tsx
      [id]/edit/page.tsx

  components/
    AppHeader.tsx
    ui/                         # Button, LinkButton, Field/Input/Select/Textarea,
                                # Modal, Toast, Spinner, FullPageSpinner, States

  features/
    auth/
      api.ts                    # login request
      AuthProvider.tsx          # session state
      RequireAuth.tsx           # client-side route guard
      types.ts
    products/
      api.ts                    # every product request
      types.ts
      urlParams.ts              # parse/build the /products query string
      pagination.ts             # pure pagination maths
      validation.ts             # pure form validation
      mutations.ts              # pure local-mutation overlay
      MutationsProvider.tsx     # holds that overlay for the session
      hooks/                    # useProductList, useProduct, useCategories
      components/               # ProductTable, ProductRow, ProductCard,
                                # Pagination, SearchInput, ProductFilters,
                                # ProductForm, ProductDetail, DeleteProductDialog

  hooks/useDebounce.ts
  lib/
    api/client.ts               # the one Axios instance + interceptors
    api/errors.ts               # error normalization
    auth/token.ts               # token storage
  utils/                        # cn, format
```

The layering is: **UI component → hook → feature API module → shared Axios
client**. No component imports `axios` directly.

## API approach

`src/lib/api/client.ts` creates the single Axios instance:

- `baseURL` from `NEXT_PUBLIC_API_BASE_URL`.
- A **request interceptor** attaches `Authorization: Bearer <token>` when a
  token exists, so no call site has to think about auth headers.
- A **response interceptor** converts every failure into one `ApiError`
  (`{ message, status?, canceled }`) via `normalizeError`, so components never
  see a raw Axios error. It also handles an expired token centrally: on a 401
  (other than the login request itself) it clears the token and dispatches a
  `pd:unauthorized` DOM event, which `AuthProvider` listens for and uses to end
  the session — that sends the user to `/login` through the Next router rather
  than a hard page reload.

Requests live in `features/auth/api.ts` and `features/products/api.ts`. Each one
is a small typed function that takes an optional `AbortSignal`.

### Error handling

`normalizeError` maps:

- **400 / 401 / 403 / 404 / 500** → a readable message (DummyJSON's own
  `message` field is preferred when present),
- **network failure / timeout** → "Network error. Please check your connection…",
- **cancellation** → `{ canceled: true }`, which callers ignore rather than
  showing, because a canceled request is an expected outcome, not a failure.

## Authentication approach

`POST /auth/login` returns an `accessToken`, which is stored in `localStorage`
and read back by the Axios request interceptor. `AuthProvider` exposes
`{ status, user, login, logout }`, where `status` starts as `"loading"` because
`localStorage` can only be read in the browser. `RequireAuth` wraps the
`/products` layout: it shows a spinner while `status === "loading"` and
redirects to `/login` once the user is known to be unauthenticated.

> **This is not production-grade security.** A token in `localStorage` is
> readable by any JavaScript running on the page, so an XSS bug leaks the
> session. The route guard is also client-side only: it controls what the UI
> renders, not what the API returns — anyone can call the API directly with a
> token. In a real application the token would live in an `httpOnly`, `Secure`,
> `SameSite` cookie set by our own backend, with the session verified on the
> server (Next.js proxy/middleware or a route handler) before protected content
> is sent. This approach was chosen because DummyJSON hands the token straight
> to the browser and this assignment has no backend of its own.

## URL state approach

Everything needed to reproduce a list view is in the query string:

```
/products?search=phone&category=smartphones&sort=price&order=asc&page=2&pageSize=20
```

`src/features/products/urlParams.ts` is the only place that reads or writes
these parameters:

- `parseProductQuery(searchParams)` returns a fully validated `ProductQuery`.
  Anything invalid falls back to a sane default instead of throwing —
  `?page=abc`, `?page=-2`, `?page=1.5` → page 1; `?pageSize=7` → 10;
  `?sort=colour` → no sorting; `?order=sideways` → `asc`.
- `buildProductQueryString(query)` rebuilds the URL and **omits defaults**, so
  the clean state is just `/products`.

`?page=999` is syntactically valid but out of range, and how far out cannot be
known until the response arrives. `ProductsView` therefore clamps it once
`total` is known and rewrites the URL with `router.replace`, so the bad URL does
not end up in the browser history.

User-driven changes use `router.push`, so browser back/forward moves through
filter states naturally. Changing search, category, sort or page size resets the
page to 1.

## Search: debounce and race conditions

`SearchInput` keeps the typed value in local state so typing stays responsive,
and reports it upward only after 450 ms of quiet (`useDebounce`). The URL — and
therefore the request — changes once per pause, not once per keystroke.

Debouncing alone does not prevent a stale result. If "phone" is searched and
then "laptop" before the first response arrives, a slow "phone" response could
still land last and overwrite the "laptop" results.

The fix is in `useProductList`:

```ts
useEffect(() => {
  const controller = new AbortController();
  fetchProducts({ ...query }, controller.signal).then(setPage).catch(/* ignore cancels */);
  return () => controller.abort();   // runs before the next effect
}, [page, pageSize, search, category, sort, order]);
```

Each request gets its own `AbortController`, and the effect cleanup aborts it
the moment the query changes. A superseded request is canceled before its
response can be applied, so the newest query always wins. The `canceled` flag on
`ApiError` makes sure the aborted request is not shown to the user as an error.

Verified in the browser by delaying the `q=phone` response by 3 seconds and then
typing "laptop": the phone request ends as `net::ERR_ABORTED` and the laptop
results stay on screen. The same holds when testing against DummyJSON's own
`&delay=2000` parameter.

## Search + category: a documented limitation

DummyJSON has no endpoint that combines a search term with a category filter.
`/products/search?q=` searches the whole catalogue, and
`/products/category/{slug}` cannot take a query. Rather than fake it, the app
picks one endpoint:

| State | Endpoint used |
| --- | --- |
| Search present | `/products/search?q=…` — **search wins** |
| Category only | `/products/category/{slug}` |
| Neither | `/products` |

Both values stay in the URL, and when both are set the UI shows an inline
notice: *"DummyJSON cannot search inside a category, so the search term is being
applied across all categories."* Filtering the search results client-side was
rejected because it would only filter the current page, producing a wrong
`total` and wrong pagination.

## Sorting

DummyJSON **does** support `sortBy` and `order` on `/products`,
`/products/search` and `/products/category/{slug}` (verified against the live
API), so all sorting is server-side and correct across the whole result set, not
just the current page. Sorting resets the page to 1.

The one exception is products created locally in this session, which the server
does not know about — see below.

## DummyJSON mutation limitation

> DummyJSON simulates mutations and does not persist them. The application
> maintains mutation results locally for the current browser session.

`POST /products/add`, `PUT /products/{id}` and `DELETE /products/{id}` all
return a realistic success response, but nothing is stored: the next `GET`
returns the original data. Every request is still really sent, and its response
is used.

`MutationsProvider` keeps a small overlay in `sessionStorage`
(`{ created, updated, deleted }`), and `mergePage` in `mutations.ts` applies it
to each fetched page:

- **deleted** products are removed from the page and subtracted from the total,
- **edited** products render their new values,
- **created** products are pinned to the top of page 1 when they match the
  current filters, and added to the total.

`sessionStorage` rather than `localStorage` is deliberate: these changes are
temporary by nature and should not outlive the browser session.

Known trade-offs, kept simple on purpose:

- Locally created products are **pinned to page 1** rather than sorted into
  their true position, because the server does the sorting and paginating and
  does not know they exist.
- DummyJSON returns the same id (195) for every created product, so
  `withUniqueLocalId` assigns the next free id if one is already taken.
- Editing a locally created product skips the API call, because the server would
  return 404 for an id it never stored.

## Loading, empty and error states

- **Loading** — a skeleton list on first load. Later fetches dim the existing
  list instead of replacing it, so changing a filter does not flash a skeleton
  (`isLoading` vs `isFetching`).
- **Empty** — "No products found." with a hint to clear the filters.
- **Error** — a readable message plus a **Retry** button that refetches.
- **Not found** — an invalid or unknown product id renders a proper not-found
  state with a link back, instead of crashing. A failed request is checked
  *before* the not-found branch, so a network error is not mislabelled as a
  missing product.
- **Cancellation** is never surfaced as an error.
- **Success** — creating, updating and deleting show a toast in the bottom-right
  corner, so the outcome is visible even though the page has navigated away.
  Toasts are for completed actions only; validation and submission errors stay
  inline next to the form or inside the confirmation modal, where the user can
  act on them.

## Responsive behaviour

- **Mobile (< 768px)** — product cards, stacked filters, full-width controls.
- **Desktop (≥ 768px)** — the table view.
- Verified at 390px and 1280px with no horizontal page scroll.
- Accessibility: semantic `<table>`/`<form>`/`<nav>`, every input has a label,
  errors are linked with `aria-describedby` and announced with `role="alert"`,
  the modal is a focus-trapped `role="dialog"` that closes on Escape, the
  current page is marked `aria-current="page"`, and all interactive elements
  have visible focus rings.

## Tests

`npm test` runs 59 Vitest tests over the pure logic, which is where the
interesting edge cases live:

- `urlParams.test.ts` — parsing and normalizing every invalid parameter, and
  round-tripping a query.
- `pagination.test.ts` — page counts, the "Showing x–y of z" summary, first/last
  page, empty results, clamping, and the ellipsis windows.
- `validation.test.ts` — every form rule.
- `mutations.test.ts` — the created/updated/deleted overlay and filter matching.

Vitest was chosen because it needs no configuration for a TypeScript project and
these are plain functions with no DOM involved. Component and end-to-end tests
were left out deliberately; the browser flows were verified manually instead
(see below).

## Manually verified

Login (wrong and correct credentials, logout, direct access to a protected
route); pagination (first, middle, last, `?page=999` → normalized to the last
page, `?page=abc` → page 1, page-size changes); search (debounce, empty result,
and a deliberately delayed request proving stale-response protection); category
and sort combinations; product details with valid, unknown and non-numeric ids;
create, edit, delete, cancel-delete, and the overlay surviving a page reload;
mobile and desktop layouts.

## What I would improve in production

1. **Move auth to the server.** An `httpOnly` cookie set by our own backend,
   with the session checked in Next.js middleware, so protection is real and not
   just a UI concern. Add refresh-token rotation (DummyJSON returns one; it is
   unused here).
2. **Fetch on the server.** With a real API, the list would be a Server
   Component reading `searchParams`, which removes the client-side loading state
   and improves first paint.
3. **Cache responses.** Repeated pages currently refetch every time. A small
   cache, or React Query if the team accepts the dependency, would cut requests
   and make back-navigation instant.
4. **Optimistic updates with rollback**, once mutations actually persist.
5. **More tests** — component tests for the search/pagination interaction and a
   Playwright end-to-end run in CI.
6. **Observability** — error reporting, plus a real error boundary per route.
7. **Images** — `next/image` with configured remote patterns once the image
   hosts are known.

## One problem faced and how it was solved

After creating a product, the app navigated to its detail page and the page
crashed; on reload, the created product had also disappeared from the list.

Two separate bugs were behind it:

1. **The crash.** `POST /products/add` echoes back only the fields that were
   sent, plus an id — it has no `rating`. The detail page called
   `product.rating.toFixed(2)` on `undefined`. The fix was to stop trusting the
   response shape and build the local product explicitly from the submitted
   payload plus the returned id, with sensible defaults for the fields DummyJSON
   omits.

2. **The disappearance.** `MutationsProvider` restored its state from
   `sessionStorage` in one effect and persisted it in another effect that
   watched `state`. Under React's development StrictMode, effects run twice: the
   restore read the saved overlay, the persist effect then wrote the *empty*
   initial state over it, and the second restore read back the emptied value.
   The fix was to delete the persisting effect and write to `sessionStorage`
   inside the state updater instead, so a write only ever happens as the result
   of a real mutation. That is both correct and easier to reason about.

The lesson from both: an effect that writes derived state to storage will also
run on first render, and an API response is not a contract unless you check it.

## AI usage

AI (Claude) was used as a pair-programming assistant on this project for:

- scaffolding the initial implementation and boilerplate components,
- reviewing edge cases (invalid URL parameters, pagination boundaries,
  request-cancellation behaviour),
- suggesting the overall folder structure and the shape of the mutation overlay,
- debugging the two issues described above.

The generated code was reviewed, adjusted and understood manually — including
verifying the DummyJSON API's actual sorting and mutation behaviour against the
live API rather than assuming it, and testing each flow in the browser. Every
architectural decision in this README reflects a choice made and understood by
me, and I can explain and modify any file in the project.
