# AUTH

## Authentication Provider

Sheggar Wheels uses Supabase Authentication for user registration, email confirmation, sign-in, and session management.

The application does not use the old seeded demo-user sign-in system for authentication.

## Sign-Up

New users can create accounts using:

- Full name.
- Email address.
- Phone number.
- Password.

Passwords must contain at least 8 characters.

Public sign-up creates accounts with the default `renter` role. Users cannot select the `owner` or `admin` role during registration.

If email confirmation is enabled, users must confirm their email before signing in.

The signup process uses the application's authentication callback route:

`/auth/callback?next=/dashboard`

## Profile Creation

After a new user registers, a Supabase database trigger automatically creates a corresponding record in `public.profiles`.

The profile contains:

- User ID.
- Full name.
- Phone number.
- Account role.
- Creation timestamp.

The profile ID references the corresponding Supabase authentication user ID.

Phone numbers must be unique because the profiles table has a unique constraint on the phone column.

## Sign-In and Sessions

Users sign in with their registered email address and password.

The application uses Supabase session management through the Supabase browser and server clients.

Middleware refreshes the authentication session when necessary.

After sign-in, the application loads the user's profile and redirects according to their role:

- `renter` → `/dashboard`
- `owner` → `/owner`
- `admin` → `/admin`

Signing out uses Supabase Authentication to end the current session.

## Protected Views and Roles

The application provides separate renter, owner, and admin areas.

The user's role is loaded from the Supabase profile.

Owner and admin roles must be assigned through an authorized administrative process. Public registration cannot assign these roles.

The current interface uses client-side role checks to control access to these views.

**Important:** Client-side role checks are not sufficient security controls. Production authorization must also be enforced on the server and through Supabase Row Level Security (RLS) policies.

## Authentication Callback

The route `app/auth/callback/route.js` handles the email confirmation callback.

It exchanges the authentication code for a Supabase session and redirects the user to the requested local destination.

A `next` destination is accepted only when it is a safe local path beginning with one slash. External URLs are rejected to prevent unsafe redirects.

## Negative Scenarios to Verify

1. Open `/owner` without signing in: the application should require authentication.
2. Sign in as a renter and open `/admin`: admin access should be refused.
3. Sign in as an owner: the owner area should show the appropriate owner interface.
4. Sign up with an email that already exists: registration should not create a duplicate account.
5. Sign up using a phone number already registered: profile creation should fail because phone numbers are unique.
6. Sign out: the Supabase session should end and protected views should no longer be accessible.

## Security Warning

Supabase manages authentication, but the marketplace is not yet fully secured as a production application.

Some marketplace records and operations still use browser storage, and client-side authorization checks can be bypassed.

The future backend must:

- Validate authorization on the server.
- Enforce ownership of cars and bookings.
- Configure appropriate Supabase RLS policies.
- Validate all important data on the server.
- Protect administrative operations from unauthorized users.