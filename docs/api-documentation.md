# CampusHire REST API
Base URL: `http://localhost:4000/api`

Bearer JWT authentication is required except for health, metadata, authentication and public internship browsing.

## Authentication
- `POST /auth/register` — create student user/profile atomically.
- `POST /auth/login` — authenticate and return JWT.
- `GET /auth/me` — current token identity.

## Discovery
- `GET /meta` — departments and skills.
- `GET /internships` — paginated search/filter (`q`, `company`, `location`, `mode`, `skill`, `minStipend`, `page`, `limit`).
- `GET /internships/:id` — posting and required skills.

## Student
- `GET|PUT /student/profile`
- `PUT /student/skills`
- `GET /student/dashboard`
- `POST /internships/:id/apply`
- `GET /applications/me`
- `GET /interviews/me`
- `GET /offers/me`
- `PATCH /offers/:id/respond`
- `GET /records/me`

## Placement admin
- `GET /admin/{students|companies|internships|applications|interviews|offers|records|evaluations}`
- `POST /admin/companies`
- `POST /admin/internships`
- `PATCH /admin/applications/:id/status`
- `POST /admin/interviews`
- `PATCH /admin/interviews/:id/result`
- `POST /admin/offers`
- `POST /admin/records`
- `PATCH /admin/records/:id`
- `POST /admin/evaluations`
- `GET /admin/analytics`

Errors use an HTTP-appropriate status and JSON `{ "error": "..." }`. SQL values are supplied through parameterized mysql2 queries; resource identifiers used in the generic admin listing route are selected from a fixed server-side whitelist.
