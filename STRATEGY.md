# STRATEGY

| Route | Rendering/data strategy |
|---|---|
| `/` | Next.js App Router page; interactive client workspace reads seeded browser data after hydration. |
| `/cars` | Client-side search/filter/sort/pagination over approved cars stored in localStorage. |
| `/cars/[id]` | Dynamic route; client workspace resolves the ID from local demo records. |
| `/signin`, `/signup` | Client-side demo account/session flows. |
| `/dashboard`, `/bookings` | Client-side renter views; sessionStorage identifies the demo session. |
| `/owner` | Client-side owner tools and ownership-scoped records. |
| `/admin` | Client-side admin moderation and platform demo records. |

The project uses the App Router and reusable React components. `localStorage` and `sessionStorage` are browser-only APIs, so access happens in a client component after mount. Server Components cannot directly read these values. No Server Actions or Route Handlers are needed for this frontend-only version. In a backend iteration, replace browser data functions with authenticated API calls and server-side authorization.
