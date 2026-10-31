# DATA

## Storage Architecture

Sheggar Wheels currently uses two storage systems:

1. Supabase PostgreSQL for authentication and user profile management.
2. Browser storage for demonstration marketplace records and workflows.

## Supabase Database

### Authentication

Supabase Authentication manages:

- User registration.
- Email addresses and password authentication.
- Email confirmation.
- Authentication sessions.
- User identity.

### Profiles Table

The `public.profiles` table stores additional user information.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | References `auth.users.id` |
| `full_name` | Text | User's full name |
| `phone` | Text | User's phone number |
| `role` | Text | Account role, defaulting to `renter` |
| `created_at` | Timestamptz | Profile creation timestamp |

A foreign key connects `profiles.id` to `auth.users.id`.

The `handle_new_user()` database trigger automatically creates a profile when a new authentication user registers.

## Browser Storage

Some marketplace demonstration entities are stored as JSON arrays in localStorage:

- `sw_users_v1`: Demo user records, roles, and account status.
- `sw_cars_v1`: Cars, owner IDs, prices, locations, photos, and moderation status.
- `sw_bookings_v1`: Renter, owner, and car references, date ranges, price snapshots, fees, totals, and booking status.
- `sw_reviews_v1`: Completed-booking reviews and owner replies.
- `sw_disputes_v1`: Booking-linked disputes and resolution fields.
- `sw_announcements_v1`: Admin announcements.

Temporary session values use sessionStorage:

- `sw_session_v1`: Current demo user ID and sign-in timestamp.
- `sw_checkout_draft_v1`: Selected booking ID while moving through the demo flow.

These browser records are local to the current browser and are not automatically shared between users or devices.

## Relationships

The Supabase authentication user has a corresponding profile connected through the UUID foreign key.

The browser-based marketplace relationships are:

- A car's `ownerId` references a user.
- A booking references a car, renter, and owner.
- A review references its completed booking.
- A dispute references a booking and the related participant.

These marketplace relationships are currently maintained in demonstration browser data rather than fully enforced through PostgreSQL foreign keys.

## Helpers

`lib/storage.js` provides:

- Safe JSON parsing.
- Browser storage writes.
- First-run seeding.
- Session helpers.
- ID generation.
- CSV export.
- Demo data reset.

If a stored value is missing or malformed, a safe fallback is returned.

Seed data is written only when the relevant key is absent. Existing user changes are not overwritten on refresh.

Supabase client utilities are located in:

- `lib/supabase/client.js`
- `lib/supabase/server.js`

These provide browser and server-side Supabase clients for authentication and database access.

## Validation

The application performs frontend validation for:

- Required listing fields.
- Positive prices and seat counts.
- Booking date order.
- Duplicate signup email.
- Booking date overlap for active requests and confirmations.

Supabase manages authentication and profile creation.

Marketplace validation currently relies partly on frontend and browser-side logic. These checks are not sufficient security controls for a production marketplace.

## Future Database Improvements

- Migrate vehicle listings to Supabase.
- Migrate bookings and booking history to PostgreSQL.
- Create database relationships between vehicles, users, bookings, and reviews.
- Implement Row Level Security (RLS) policies.
- Enforce booking conflicts transactionally.
- Move sensitive validation and authorization to the server.
- Reduce reliance on localStorage for shared marketplace data.
