# CampusHire — Student Internship & Recruitment Management System

A database-first full-stack university placement platform covering discovery → application → interview → offer → internship → evaluation, with auditable workflow history and SQL-driven analytics.

> **Data disclosure:** bundled demo/reference records and generated full-lifecycle records are synthetic. CampusHire does not claim real university users, company partnerships, or production recruitment statistics.

## Quick start
```bash
git clone https://github.com/AagneyVk/CampusHire.git
cd CampusHire
docker compose up --build
```
Open `http://localhost:5173`. API health: `http://localhost:4000/api/health`.

**Local demo accounts** (Docker development mode only):
- Student: `student@campushire.local` / `password`
- Admin: `admin@campushire.local` / `password`

The backend regenerates those two bcrypt hashes at startup only when `DEMO_ACCOUNTS=true`; production should keep this disabled and use a strong JWT secret.

## Architecture
```text
Browser → React + Vite → REST/JSON → Express → parameterized mysql2 SQL → MySQL 8
```
MySQL is the authoritative system of record. The browser never connects to it directly. See [architecture](docs/architecture-diagram.md) and [ER model](docs/er-diagram.md).

## Functional scope
**Student:** register/login, profile, skills, paginated internship discovery, search/filter, detail/apply, duplicate protection, applications, status timeline, interviews, offers/response, internship history/evaluation, and database-driven skill matching.

**Placement admin:** dashboard analytics, students/companies/internships/applications/interviews/offers/records/evaluations, company/posting creation APIs, controlled application state transitions, interview/result workflow, offers, internship records and evaluations.

Company-user ownership is normalized in the schema but the full company portal remains a documented extension so the assessed core stays focused on Student + Admin.

## Database design
16 relations: `departments`, `industries`, `users`, `students`, `companies`, `company_users`, `skills`, `student_skills`, `internships`, `internship_skills`, `applications`, `application_status_history`, `interviews`, `offers`, `internship_records`, `evaluations`.

The model targets defensible 3NF. It demonstrates PK/FK/composite keys, UNIQUE/NOT NULL/CHECK constraints, sensible delete behavior, M:N junction tables, composite indexes, views, triggers, transactions, state history, INNER/LEFT JOIN, GROUP BY/HAVING, nested/correlated subqueries, EXISTS/NOT EXISTS, date analytics, relational division and pagination. See the [database design](docs/database-design.md), [data dictionary](docs/data-dictionary.md), and [business rules](docs/business-rules.md).

## SQL
`database/queries.sql` contains **35 evaluation-ready queries**, including time-to-stage, conversion/funnel analysis, skill co-occurrence, relational skill matching, fill rate, monthly trends and industry evaluation performance. Ten strong viva examples are explained in [query-demonstration.md](docs/query-demonstration.md).

Views: `student_application_summary`, `internship_application_stats`, `company_recruitment_summary`, `placement_statistics`, `application_funnel_statistics`, `skill_demand_statistics`, `internship_outcome_statistics`.

## Data strategy
### Demo mode
`docker compose up --build` loads a small deterministic synthetic dataset from `database/seed.sql` for fast demonstration.

### Full dataset mode
```bash
python scripts/generate_data.py
docker compose exec -T mysql mysql -ucampushire -pcampushire campushire < database/generated_seed.sql
```
The deterministic seed is `20260826`. Target output: 20 departments, 120 skills, 300 companies, 800 internships, 3,000 students, 10,000 applications, up to 3,000 interviews, ~1,000 offers depending on the deterministic funnel, up to 650 internship records, and up to 500 evaluations. The generator creates temporally ordered lifecycle data and explicit application status history.

`clean_data.py` / `import_data.py` define an optional public-data boundary. No third-party dataset is bundled, so there is no unsupported licensing/provenance claim.

## Security and integrity
bcrypt password hashing; JWT authentication; Student/Admin RBAC; Helmet; restricted CORS; 1 MB JSON limit; auth rate limiting; parameterized SQL; centralized safe errors; `.env` exclusion; input/range checks; owner-scoped student queries; DB constraints/triggers. JWT storage in localStorage is an accepted academic-project tradeoff; an HTTP-only cookie/CSRF design would be preferable for a public production deployment.

## Testing and CI
GitHub Actions starts MySQL 8, initializes schema → views → triggers → seed, executes the 35 SQL queries, runs backend MySQL integration tests, then builds the React frontend. Tests cover database health, registration, duplicate rejection, login, RBAC, internship pagination/validation, duplicate applications, and closed-internship trigger enforcement. See [testing.md](docs/testing.md).

## Project structure
```text
backend/src/
  app.js  db.js  server.js  demoSeed.js
  middleware/  routes/  services/
backend/test/
database/
  schema.sql  views.sql  business_rules.sql  seed.sql  queries.sql
frontend/src/
  App.jsx  main.jsx  components/  pages/  services/
scripts/
docs/
.github/workflows/ci.yml
docker-compose.yml
```

## Documentation
- [Architecture](docs/architecture-diagram.md)
- [ER diagram](docs/er-diagram.md)
- [Database design / normalization](docs/database-design.md)
- [Data dictionary](docs/data-dictionary.md)
- [Business rules / state machine](docs/business-rules.md)
- [API reference](docs/api-documentation.md)
- [SQL viva demonstrations](docs/query-demonstration.md)
- [Testing](docs/testing.md)

## Screenshots
Only real screenshots from a running build should be placed under `docs/screenshots/`. None are fabricated or committed merely to make the repository appear finished.

## Future work
A full company self-service portal using `company_users`, institution SSO, resume object storage, and notification delivery are sensible extensions but deliberately outside the DBMS-first assessed core.

## License
MIT — see `LICENSE`.
