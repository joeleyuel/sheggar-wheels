# BOUNDARY

## Component Responsibilities

- `app/layout.jsx`: Server Component root layout responsible for the application structure and static metadata.
- `app/*/page.jsx`: App Router page entry points that render the client-side workspace.
- `components/Workspace.jsx`: Client Component responsible for React state and effects, Next.js navigation hooks, browser storage, forms, filters, modals, and user interactions.
- `lib/seed.js`: Contains plain demonstration records and does not use browser APIs.
- `lib/storage.js`: Provides browser-only persistence helpers. Import and use this module only from client-side code.

## Browser Storage Boundary

The browser storage boundary is deliberate.

`localStorage` and `sessionStorage` are not available during server-side rendering. Accessing them before the component mounts can cause errors or server/client rendering mismatches.

The application therefore waits until the client component mounts before initializing and reading demonstration state.

Keep browser storage access inside client-side code. Do not access `localStorage` or `sessionStorage` directly from Server Components.