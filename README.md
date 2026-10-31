# Sheggar Wheels — Car Rental Marketplace

Sheggar Wheels is a responsive peer-to-peer car rental marketplace designed for Addis Ababa, Ethiopia. It connects people looking to rent vehicles with car owners who want to list their cars.

The application is built with Next.js and React, uses Supabase for user authentication and profile management, and is deployed on Vercel.

## Live Demo

**Website:** https://sheggar-wheels-p6piu3dqd-joeleyuel.vercel.app

**GitHub Repository:** https://github.com/joeleyuel/sheggar-wheels

## Technology Stack

- Next.js 15 — App Router
- React
- JavaScript
- CSS
- Supabase — Authentication and PostgreSQL database
- PostgreSQL — User profiles and role management
- @supabase/ssr — Supabase server-side authentication
- localStorage — Demo marketplace records and workflows
- sessionStorage — Temporary browser session and checkout data
- Vercel — Deployment and hosting
- GitHub — Version control

## Features

### Authentication
- User registration with full name, email, password, and phone number.
- Email confirmation through Supabase.
- Secure password-based sign-in.
- User profile creation after registration.
- Role-based redirection.
- Three user roles: Renter, Owner, and Admin.
- New accounts receive the Renter role by default.

### Renter
- Browse available vehicles.
- Search and filter vehicles.
- View vehicle details.
- Submit booking requests.
- View booking history.
- Cancel eligible booking requests.
- Submit reviews after completed trips.

### Owner
- Create vehicle listings.
- Manage personal listings.
- View booking requests.
- Approve or decline booking requests.

### Admin
- View platform overview.
- Approve or reject vehicle listings.
- Manage demo user suspension and reinstatement.
- Resolve disputes.
- Manage announcements.
- View CSV reports.

### User Interface
- Responsive design for desktop and mobile.
- Accessible navigation.
- Search, filtering, and sorting.
- Vehicle images stored locally in WebP format.
- Loading, empty, and status states.

## User Roles

| Role | Description |
|---|---|
| Renter | Searches for vehicles and requests bookings. |
| Owner | Lists vehicles and manages rental requests. |
| Admin | Oversees platform operations. |

New registrations are assigned the `renter` role automatically. Owner and Admin roles are assigned through administrative database management.

## Supabase Configuration

The project uses Supabase for authentication and user profile management.

The `profiles` table contains:

| Column | Type | Description |
|---|---|---|
| id | UUID | References auth.users.id |
| full_name | Text | User's full name |
| phone | Text | User's phone number |
| role | Text | User account role |
| created_at | Timestamp | Profile creation date |

A database trigger named `handle_new_user()` automatically creates a profile when a new user registers.

## Local Installation

Clone the repository:

```bash
git clone https://github.com/joeleyuel/sheggar-wheels.git
```

Navigate into the project:

```bash
cd sheggar-wheels
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Add your own Supabase project credentials. Never commit `.env.local` or expose private credentials.

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

For a production build:

```bash
npm run build
npm start
```

## Browser Storage

Some marketplace workflows still use browser storage for demonstration purposes.

Current storage keys include:

- `sw_users_v1`
- `sw_cars_v1`
- `sw_bookings_v1`
- `sw_reviews_v1`
- `sw_disputes_v1`
- `sw_announcements_v1`
- `sw_session_v1`
- `sw_checkout_draft_v1`

These demo records are stored locally and are not automatically shared between devices or users.

## Important Limitations

Sheggar Wheels is an evolving capstone project.

- Supabase handles user authentication and profile management.
- Some marketplace operations still rely on localStorage and fictional seed data.
- Marketplace records are not yet fully connected to a shared backend.
- Production-grade authorization and booking conflict enforcement must be implemented on the server.
- No real payments are processed.
- Vehicle prices and specifications must be verified by vehicle owners before real-world use.

The application should not be treated as a fully operational commercial rental platform yet.

## Project Routes

- `/` — Homepage
- `/cars` — Vehicle catalogue
- `/cars/[id]` — Vehicle details
- `/signin` — Sign in
- `/signup` — Create account
- `/dashboard` — Renter dashboard
- `/bookings` — Booking history
- `/owner` — Owner dashboard
- `/admin` — Admin dashboard

## Future Improvements

- Fully integrate vehicle listings with Supabase.
- Store bookings in the database.
- Implement database-level role permissions and Row Level Security.
- Add real-time booking availability.
- Integrate payment processing.
- Add vehicle location and map functionality.
- Improve owner reports and administration tools.

## Vehicle Catalogue and Images

Vehicle photos are stored locally in:

`public/images/cars/`

The catalogue includes nine vehicle image entries in optimized WebP format.

The BYD Song Plus 2025 daily rate is ETB 2,200 as supplied by the project owner. Other vehicle prices and specifications are illustrative and require verification.

## Performance and Responsiveness

- Responsive mobile navigation with a hamburger menu.
- Locally stored optimized vehicle images.
- No external Google Fonts import.
- Accessible labels and visible keyboard focus.

Performance should be evaluated using Lighthouse on both mobile and desktop environments.

## Author

**Eyuel Bilhatu**

GitHub: https://github.com/joeleyuel
