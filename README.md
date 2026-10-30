# Sheggar Wheels — Frontend Capstone

A responsive Next.js + React frontend demonstration of a peer-to-peer car rental marketplace for Addis Ababa. This project intentionally uses browser storage and fictional seed data. It does not include a backend or database.

## Stack
- Next.js App Router
- React 19
- JavaScript
- CSS
- `localStorage` for persistent demo records
- `sessionStorage` for the active demo session and temporary checkout draft

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

For a production build:
```bash
npm run build
npm start
```

## Demo accounts
Open `/signin` and select one of the seeded demo accounts:
- Renter: `renter@sheggar.demo`
- Owner: `owner@sheggar.demo`
- Admin: `admin@sheggar.demo`

No passwords are collected. The sign-in selector is a teaching/demo mechanism, not authentication.

## Implemented workflows
- Public landing page and approved-car catalogue.
- Catalogue search, neighbourhood and transmission filters, maximum daily price, sorting and pagination.
- Dynamic car detail routes at `/cars/[id]`.
- Demo renter account creation and seeded role-based demo sign-in.
- Safe internal `next` redirect handling.
- Booking request creation, date validation, price snapshot, 5% demo fee, and overlap check.
- Renter dashboard, booking history, cancellation of eligible requests, review creation after completed trips, CSV export.
- Owner dashboard, own listing creation, listing moderation status, own booking requests and approve/decline actions.
- Admin overview, listing approval/rejection, demo user suspension/reinstatement, dispute resolution, announcements, CSV report and demo reset.
- Responsive layout, labels, visible focus, status/empty states and keyboard-operable controls.

## Browser data keys
- `sw_users_v1`
- `sw_cars_v1`
- `sw_bookings_v1`
- `sw_reviews_v1`
- `sw_disputes_v1`
- `sw_announcements_v1`
- `sw_session_v1` (sessionStorage)
- `sw_checkout_draft_v1` (sessionStorage)

Use the Admin page's reset control to restore seeded records. Local browser data is not shared between devices or users.

## Important limitations
This is a frontend capstone simulation. Browser-side role checks and ownership checks are not security controls. Do not use real personal data. No real payment is processed, no passwords or payment credentials are collected, and all prices, users, vehicles and booking records are fictional. A backend must enforce authorization and booking conflicts before production use.

## Routes
`/`, `/cars`, `/cars/[id]`, `/signin`, `/signup`, `/dashboard`, `/bookings`, `/owner`, `/admin`.

Some advanced routes in the brief (trip tracking, checkout receipt, availability calendar, detailed owner reports and admin subpages) are intentionally consolidated into the implemented demo views or deferred to the next iteration. See `FUTURE.md`.

## Updated vehicle photos and catalogue

The supplied vehicle photos are stored locally as optimized WebP files in `public/images/cars/`. The demo catalogue now includes nine matching image entries. The BYD Song Plus 2025 daily rate is set to ETB 2,200 as supplied by the project owner. Other daily rates and several vehicle specifications are illustrative demo values and must be verified by each vehicle owner before any real rental use. The Volkswagen model and the generic Hyundai sedan model still need confirmation.

The browser demo data keys were moved to version 2 so a fresh browser session loads the updated sample catalogue. Existing browsers can also clear site data for localhost to reload the updated sample records.

## Responsive navigation and performance notes

On small screens, the header uses an accessible hamburger menu. Vehicle photos are served locally in WebP format rather than relying on third-party image hosts. Google Fonts import was removed to avoid an external font request blocking initial rendering. Run Lighthouse in Chrome DevTools on both mobile and desktop after starting the app; scores depend on the test device, browser, network and production build and are not guaranteed by source changes alone.
