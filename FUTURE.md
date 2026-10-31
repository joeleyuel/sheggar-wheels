# FUTURE WORK

## Next Frontend Iteration

- Add dedicated route groups and nested layouts for renter, owner, and admin sections.
- Add a detailed booking receipt/checkout route and a clearly labelled mock TeleBirr payment confirmation.
- Add an availability calendar.
- Add owner earnings exports and charts.
- Add owner review replies and dispute reply controls.
- Add admin detail pages, full booking filters, richer reports, and announcement deactivation.
- Add a Leaflet map with a non-map neighbourhood fallback and label all coordinates as seeded sample locations.
- Add automated tests for date overlap, role guards, CSV escaping, and booking lifecycle transitions.
- Add sitemap, robots.txt, and canonical metadata.

## Backend Development

### Already Implemented

- Supabase project integration.
- User registration and password-based authentication.
- Email confirmation and authentication callback.
- Automatic user profile creation through a database trigger.
- Renter, Owner, and Admin role management.
- Supabase PostgreSQL profiles table.
- Supabase authentication session management.

### Remaining Backend Work

- Replace localStorage marketplace records with Supabase database tables.
- Implement validated database operations for vehicle listings and bookings.
- Enforce role permissions and ownership using Row Level Security (RLS).
- Implement server-side authorization for sensitive operations.
- Enforce booking availability and prevent overlapping bookings transactionally.
- Integrate a real payment provider through a secure backend.
- Add verified identity, vehicle documents, and insurance management.
- Implement audit logs and privacy-aware location services.
- Add server notifications or SSE/WebSockets where needed.

## Production Readiness

Before launching as a real rental marketplace:

- Complete the migration of marketplace data to Supabase.
- Review database security policies.
- Test authentication and role permissions.
- Validate booking and payment workflows.
- Perform security and performance testing.
- Verify vehicle information and owner identities.
- Establish appropriate privacy and data protection practices.
