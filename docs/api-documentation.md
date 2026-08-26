# CampusHire REST API
Base: `http://localhost:4000/api`. Protected requests use `Authorization: Bearer <JWT>`. Errors are consistently `{ "error": "human-readable message" }`.

## Public/auth
- `GET /health`
- `GET /meta`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /internships?q=&company=&location=&mode=&skill=&minStipend=&page=&limit=&sort=`
- `GET /internships/:id`

## Student (`student` role)
- `GET /student/profile`
- `PUT /student/profile`
- `PUT /student/skills`
- `GET /student/dashboard` — counts, upcoming interviews, recent applications, database-derived skill matches.
- `POST /student/internships/:id/apply`
- `GET /student/applications`
- `GET /student/applications/:id` — includes status history.
- `GET /student/interviews`
- `GET /student/offers`
- `PATCH /student/offers/:id/respond`
- `GET /student/records` — internship history plus evaluation.

## Placement admin (`admin` role)
- `GET /admin/analytics`
- `GET /admin/{students|companies|internships|applications|interviews|offers|records|evaluations}`
- `POST /admin/companies`
- `POST /admin/internships`
- `PATCH /admin/internships/:id`
- `DELETE /admin/internships/:id` (blocked once applications exist)
- `PATCH /admin/applications/:id/status` — state-machine validated and audited.
- `POST /admin/interviews`
- `PATCH /admin/interviews/:id/result`
- `POST /admin/offers`
- `POST /admin/records`
- `PATCH /admin/records/:id`
- `POST /admin/evaluations`

All dynamic values use mysql2 placeholders. The only interpolated SQL identifier is the generic admin table selector, whose value is selected from a fixed server-side whitelist rather than arbitrary input.
