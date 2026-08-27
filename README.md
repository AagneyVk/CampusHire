# CampusHire

**Enterprise-Grade Student Internship & Recruitment Management System**

A database-first full-stack university placement platform covering the complete recruitment lifecycle: discovery, application, interview, offer, internship, and evaluation. The system features auditable workflow history and advanced SQL-driven analytics.

---

> **Data disclosure:** Bundled reference records and generated full-lifecycle records are synthetic. CampusHire does not claim real university users, company partnerships, or production recruitment statistics.

## Quick Start

Start the CampusHire environment locally using Docker:

```bash
git clone https://github.com/AagneyVk/CampusHire.git
cd CampusHire
docker compose up --build
```
- **Web Interface:** [http://localhost:5173](http://localhost:5173)
- **API Health Check:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

**Local Demo Accounts** (Docker development mode only):
- **Student:** `student@campushire.local` / `password`
- **Admin:** `admin@campushire.local` / `password`

*Note: The backend regenerates these bcrypt hashes at startup only when `DEMO_ACCOUNTS=true`. Production deployments must disable this and enforce a strong JWT secret.*

## Architecture

```text
Browser → React + Vite → REST/JSON → Express → Parameterized mysql2 SQL → MySQL 8
```
MySQL serves as the authoritative system of record. The client application interacts exclusively with the backend API. 
For further details, see the [Architecture Diagram](docs/architecture-diagram.md) and [Entity-Relationship (ER) Model](docs/er-diagram.md).

## Functional Scope

- **Student Portal:** Secure authentication, profile management, skill mapping, paginated internship discovery, search and filter capabilities, application workflow, application status timeline, interview scheduling, offer response management, internship history logging, and database-driven skill matching.
- **Placement Administration:** Comprehensive dashboard analytics, management of students, companies, internships, applications, interviews, offers, and evaluations. Features robust APIs for company and posting creation, controlled application state transitions, and interview outcome workflows.

*Note: Company-user ownership is normalized within the database schema. While a dedicated company portal is a logical extension, the current implementation focuses on the Student and Admin experiences to maintain a tight core.*

## Database Design

The schema is built on 16 optimized relations: `departments`, `industries`, `users`, `students`, `companies`, `company_users`, `skills`, `student_skills`, `internships`, `internship_skills`, `applications`, `application_status_history`, `interviews`, `offers`, `internship_records`, and `evaluations`.

The data model implements Third Normal Form (3NF) and demonstrates:
- Primary, Foreign, and Composite Keys
- `UNIQUE`, `NOT NULL`, and `CHECK` constraints
- Cascading delete behaviors
- Many-to-many junction tables
- Composite indexes and Views
- Database-level Triggers and Transactions
- Immutable state history
- Advanced querying techniques including nested and correlated subqueries, temporal data analytics, relational division, and scalable pagination.

Detailed resources: [Database Design](docs/database-design.md), [Data Dictionary](docs/data-dictionary.md), and [Business Rules](docs/business-rules.md).

## SQL Analytics

The `database/queries.sql` file contains 35 evaluation-ready queries covering analytics such as time-to-stage tracking, funnel conversion analysis, skill co-occurrence mapping, relational skill matching, fill rate calculations, and monthly industry trends. Documentation is available in [Query Demonstrations](docs/query-demonstration.md).

**Key Materialized Views:**
`student_application_summary`, `internship_application_stats`, `company_recruitment_summary`, `placement_statistics`, `application_funnel_statistics`, `skill_demand_statistics`, and `internship_outcome_statistics`.

## Data Strategy & Generation

### Demo Mode
Running `docker compose up --build` automatically loads a deterministic synthetic dataset from `database/seed.sql` for rapid demonstration purposes.

### Enterprise Dataset Mode
To stress-test the system with high-volume data, utilize the provided generation script:

```bash
python scripts/generate_data.py
docker compose exec -T mysql mysql -ucampushire -pcampushire campushire < database/generated_seed.sql
```
The deterministic seed ensures reproducible lifecycle data. The generator automatically creates temporally ordered, highly realistic lifecycle data with an explicit application status history.

*Data Boundary: No third-party dataset is bundled, ensuring zero unsupported licensing or provenance claims.*

## Security & Data Integrity

- **Authentication & Authorization:** bcrypt password hashing, JWT authentication, and strict Student/Admin RBAC.
- **Network & Payload:** Helmet middleware, restricted CORS, 1 MB JSON payload limits, and API rate limiting.
- **Database Security:** Parameterized SQL queries to prevent injections, centralized error handling, strict input and range checks, owner-scoped student queries, and robust database constraints and triggers.
- *(Note: JWT storage in `localStorage` is utilized for the academic demonstration. Production deployments should migrate to HTTP-only cookies with CSRF tokens.)*

## Testing and CI/CD

The project leverages GitHub Actions for continuous integration. The pipeline:
1. Provisions a MySQL 8 instance.
2. Initializes the schema, views, triggers, and seed data.
3. Validates the SQL analytics queries.
4. Executes backend MySQL integration tests.
5. Builds the React frontend.

Test coverage includes database health, user registration workflows, duplicate rejection, login mechanisms, RBAC enforcement, internship validation, duplicate application blocking, and closed-internship trigger enforcement. See [Testing Documentation](docs/testing.md).

## Project Structure

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

## Documentation Directory

- [Architecture Diagram](docs/architecture-diagram.md)
- [Entity-Relationship (ER) Diagram](docs/er-diagram.md)
- [Database Design & Normalization](docs/database-design.md)
- [Data Dictionary](docs/data-dictionary.md)
- [Business Rules & State Machine](docs/business-rules.md)
- [API Reference](docs/api-documentation.md)
- [SQL Viva Demonstrations](docs/query-demonstration.md)
- [Testing Strategy](docs/testing.md)

## Future Roadmap

Future iterations could introduce a comprehensive company self-service portal utilizing the existing `company_users` relation, institution Single Sign-On (SSO) integration, resume object storage, and automated notification delivery architectures.

## License
Released under the MIT License — see `LICENSE` for details.
