# STRATEGY

## Route Rendering and Data Strategy

| Route | Rendering/data strategy |
|---|---|
| `/` | Next.js App Router page with an interactive React workspace. Marketplace data is loaded from browser storage. |
| `/cars` | Client-side search, filtering, sorting, and pagination over approved demo cars stored in localStorage. |
| `/cars/[id]` | Dynamic route; the client workspace resolves vehicle IDs from local demo records. |
| `/signin`, `/signup` | Supabase Authentication handles user registration and password-based sign-in. |
| `/auth/callback` | Next.js Route Handler exchanges the Supabase authentication code for a user session. |
| `/dashboard`, `/bookings` | Client-side renter views. Authentication and profile information come from Supabase; marketplace records still use browser storage. |
| `/owner` | Client-side owner tools and ownership-scoped demo records. |
| `/admin` | Client-side admin moderation and platform demo records. |

## Application Architecture

The project uses the Next.js App Router and reusable React components.

React Client Components handle interactive features such as search, filtering, forms, navigation, and browser storage.

Supabase is integrated for:

- User registration.
- Email confirmation.
- Password-based authentication.
- User session management.
- Profile creation.
- User role management.

The Supabase browser client uses `@supabase/ssr` and the project's public environment variables. The server client uses cookies to access and manage authentication sessions.

## Authentication Strategy

New users register using their full name, email address, password, and phone number.

After registration:

1. Supabase Auth creates the authentication account.
2. An authentication database trigger named `handle_new_user()` creates the corresponding profile.
3. The new profile receives the default `renter` role.
4. Email confirmation is handled through the Supabase authentication callback.
5. Authenticated users are redirected according to their assigned role.

The application supports three roles:

- `renter`
- `owner`
- `admin`

Owner and Admin roles are assigned through administrative database management rather than public registration.

## Browser Storage Strategy

`localStorage` and `sessionStorage` are browser-only APIs. Access to these values happens in Client Components after mounting.

The current marketplace demonstration still uses browser storage for several features:

- Vehicle listings and catalogue records.
- Booking requests and booking history.
- Reviews.
- Disputes and announcements.
- Demo checkout information.

Browser storage is not shared between users or devices and is not a replacement for a centralized backend database.

## Backend and Security Strategy

Supabase provides authentication and profile management, but the marketplace is not yet fully migrated to database-backed operations.

Before production use:

- Store vehicle listings and bookings in Supabase.
- Enforce ownership and role permissions through Row Level Security (RLS).
- Perform sensitive authorization checks on the server.
- Validate booking availability and prevent overlapping bookings at the database or server level.
- Replace client-side demo role and ownership checks with trusted server-side authorization.

## Deployment Strategy

The Next.js application is deployed through Vercel and connected to the personal GitHub repository.

Supabase credentials are configured through environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Production authentication redirects must use the deployed application URL configured in Supabase Authentication URL Configuration.

## Future Architecture

As the application evolves, browser-based marketplace data functions will be replaced with authenticated database operations and server-side authorization.

The goal is to move from a frontend capstone demonstration toward a fully database-backed peer-to-peer car rental marketplace.
