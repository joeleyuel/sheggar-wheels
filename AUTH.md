# AUTH

The sign-in screen offers three seeded demo users. It does not accept or store passwords. New sign-ups create renter-only demo accounts. The admin role cannot be selected during public sign-up. The active user ID is kept in sessionStorage and is cleared on sign-out.

Protected renter, owner and admin views check the current demo role. Owner listing/booking data is scoped to the current owner. Renter booking history is scoped to the current renter. Admin actions are restricted in the interface to the seeded admin role. A `next` destination is accepted only when it is a local path beginning with one slash; external URLs are rejected.

Negative scenarios to verify:
1. Open `/owner` signed out: the app asks the visitor to sign in.
2. Sign in as renter and open `/admin`: admin access is refused.
3. Sign in as owner and attempt to manage a car not owned by that account: owner views only show their own cars and booking requests.

**Security warning:** all authorization and ownership checks run in browser JavaScript and can be bypassed. This is not production authentication or security. The future backend must validate every request on the server.
