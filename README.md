# CampusHire — Student Internship & Recruitment Management System

CampusHire is a DBMS-focused full-stack application that models the university internship/recruitment lifecycle from student profile and opportunity discovery through application, interview, offer, internship completion and evaluation.

## Objectives
- Keep MySQL as the authoritative system of record.
- Demonstrate normalized relational modeling and meaningful DBMS concepts rather than artificial buzzwords.
- Give students one place to discover and track internships.
- Give placement administrators database-driven workflow and recruitment analytics.

## Features
**Students:** authentication, profile/skills APIs, internship search/filter/pagination, details, duplicate-safe application, application tracking, interview schedule, offer response, internship history/evaluation and dashboard metrics.

**Placement admins:** system-wide entity views, company/internship creation, application status workflow, interview scheduling/results, offer generation, internship records/evaluations and database-derived analytics.

## Technology
React + Vite · Node.js + Express · MySQL 8 · JWT + bcrypt · Docker Compose · Python data tooling · Mermaid documentation.

## Architecture
```text
Browser → React/Vite → REST/JSON → Express/JWT/RBAC → parameterized SQL → MySQL 8
```
See [docs/architecture-diagram.md](docs/architecture-diagram.md).

## Database schema
Core relations: `users`, `students`, `departments`, `industries`, `companies`, `company_users`, `internships`, `skills`, `student_skills`, `internship_skills`, `applications`, `interviews`, `offers`, `internship_records`, `evaluations`.

The design targets 3NF. Many-to-many skills use junction tables; company data is not duplicated in postings; lifecycle facts are separate relations. See [database design](docs/database-design.md) and the [ER diagram](docs/er-diagram.md).

### DBMS concepts demonstrated
Primary/foreign/composite keys, UNIQUE/NOT NULL/CHECK constraints, foreign-key actions, composite indexes, INNER/LEFT JOIN, GROUP BY, HAVING, aggregate functions, nested and correlated subqueries, ORDER BY, filtering, pagination, views, transactions and database triggers. `database/queries.sql` includes 24 evaluation-ready queries.

## Data strategy
CampusHire does **not** claim synthetic records are real. `database/seed.sql` contains a small deterministic demonstration dataset. `scripts/generate_data.py` produces larger reproducible synthetic company/internship/skill data. `clean_data.py` and `import_data.py` provide an explicit pipeline boundary for optional public CSV data. No third-party dataset is bundled, avoiding unsupported provenance/licensing claims.

## Run with Docker
Requirements: Docker + Docker Compose.

```bash
git clone https://github.com/AagneyVk/CampusHire.git
cd CampusHire
docker compose up --build
```

Open `http://localhost:5173`. API health is available at `http://localhost:4000/api/health`. MySQL is exposed at port 3306 for DBMS demonstrations.

If the schema changes after MySQL has already initialized, recreate the local development volume:
```bash
docker compose down -v
docker compose up --build
```

## Local development
Backend: copy `backend/.env.example` to `backend/.env`, run `npm install` then `npm run dev` inside `backend/`.
Frontend: run `npm install` then `npm run dev` inside `frontend/`.

Never commit `.env`. Production deployments must replace the development JWT/database credentials.

## Demo credentials
The seed file provides `admin@campushire.local` and `student@campushire.local`. For security/reproducibility, regenerate their bcrypt hashes with the backend's installed bcrypt version before an assessed live demo if the bundled demonstration hash is changed. The intended local demonstration password is `password`.

## API
See [docs/api-documentation.md](docs/api-documentation.md). All protected calls use `Authorization: Bearer <token>`.

## Repository structure
```text
frontend/                 React/Vite interface
backend/                  Express REST API, authentication and tests
database/                 schema, seed, views, triggers and 24 SQL queries
scripts/                  deterministic generation / ingestion utilities
docs/                     ER, architecture, API and database documentation
docker-compose.yml        reproducible local stack
```

## Database initialization
Docker executes `schema.sql` → `views.sql` → `business_rules.sql` → `seed.sql`. The database enforces duplicate application prevention and key lifecycle prerequisites in addition to API authorization/validation.

## Testing
`npm test` in `backend/` runs backend smoke tests. The project is designed for API workflow verification against the Docker MySQL service, including authentication, duplicate applications, authorization and lifecycle integrity. Database constraints/triggers intentionally reject invalid foreign-key/lifecycle operations.

## Screenshots
Screenshots should be captured from the locally running Docker build and stored under `docs/screenshots/`; no fabricated screenshots are committed.

## Future enhancements
Company self-service can be expanded using the already-present `company_users` relationship. Other sensible extensions are resume object storage, email notifications and institution SSO; these are intentionally outside the DBMS-first core.

## License
Academic/educational project. Add the institution/team's preferred license before external redistribution.
