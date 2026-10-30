# BOUNDARY

- `app/layout.jsx`: Server Component root layout and static metadata.
- `app/*/page.jsx`: App Router page entry points; they render the client workspace.
- `components/Workspace.jsx`: Client Component. It uses React state/effects, Next navigation hooks, browser storage, forms, filters, modals and user interactions.
- `lib/seed.js`: plain demo records; no browser APIs.
- `lib/storage.js`: browser-only persistence helpers. Import/use from client-side code only.

The browser storage boundary is deliberate: localStorage/sessionStorage do not exist during server rendering. The app waits until the client mounts before initializing and reading demo state.
