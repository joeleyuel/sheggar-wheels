# FUTURE WORK

## Next frontend iteration
- Add dedicated route groups and nested layouts for renter, owner and admin sections.
- Add a detailed booking receipt/checkout route and a clearly labelled mock TeleBirr payment confirmation.
- Add availability calendar, owner earnings export/chart, owner review replies and dispute reply controls.
- Add admin detail pages, full booking filters, richer reports and announcement deactivation.
- Add Leaflet map with a non-map neighbourhood fallback and label all coordinates as seeded sample locations.
- Add automated tests for date overlap, role guards, CSV escaping and lifecycle transitions.
- Add sitemap/robots and canonical metadata once the final public URL is known.

## Backend phase (future)
- Replace localStorage with a database and validated API.
- Add secure authentication, password hashing, cookie/session handling and server-side authorization.
- Enforce booking conflicts transactionally on the server.
- Integrate real payment provider only through a secure backend.
- Add verified identity, vehicle documents, insurance, audit logs and privacy-aware location services.
- Add server notifications or SSE/WebSockets if needed.
