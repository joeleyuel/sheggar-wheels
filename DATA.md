# DATA

## Storage
Persistent demo entities are stored as JSON arrays in localStorage:
- `sw_users_v1`: users, roles and account status.
- `sw_cars_v1`: cars, owner IDs, price, location, photos and moderation status.
- `sw_bookings_v1`: renter/owner/car references, date range, price snapshot, fee, total and lifecycle status.
- `sw_reviews_v1`: completed-booking review and owner reply.
- `sw_disputes_v1`: booking-linked dispute and resolution fields.
- `sw_announcements_v1`: admin announcements.

Temporary session values use sessionStorage:
- `sw_session_v1`: current demo user ID and sign-in timestamp.
- `sw_checkout_draft_v1`: selected booking ID while moving through the demo flow.

## Relationships
A car's `ownerId` references a user. A booking references a car, renter and owner. A review references its completed booking. A dispute references a booking and the related participant.

## Helpers
`lib/storage.js` provides safe JSON parsing, writes, first-run seeding, session helpers, ID generation, CSV export and reset. If a stored value is missing or malformed, a safe fallback is returned. Seed data is written only when the key is absent; existing user changes are not overwritten on refresh.

## Validation
The UI validates required listing fields, positive prices/seats, booking date order, duplicate sign-up email and booking date overlap for active requests/confirmations. These checks are for demonstration only; backend validation and transactional conflict checks are required in production.
