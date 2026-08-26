<div align="center">
  <h1>CampusHire</h1>
  <p><strong>Enterprise-Grade Student Internship & Recruitment Management System</strong></p>
  <p>A database-first full-stack university placement platform covering discovery → application → interview → offer → internship → evaluation, with auditable workflow history and advanced SQL-driven analytics.</p>
</div>

<hr />

> **Data disclosure:** Bundled demo/reference records and generated full-lifecycle records are synthetic. CampusHire does not claim real university users, company partnerships, or production recruitment statistics.

## 🚀 Quick Start

Get CampusHire running locally in minutes:

```bash
git clone https://github.com/AagneyVk/CampusHire.git
cd CampusHire
docker compose up --build
```
- **Web App:** [http://localhost:5173](http://localhost:5173)
- **API Health Check:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

**Local Demo Accounts** (Docker development mode only):
- **Student:** `student@campushire.local` / `password`
- **Admin:** `admin@campushire.local` / `password`

*Note: The backend regenerates these bcrypt hashes at startup only when `DEMO_ACCOUNTS=true`. Production deployments must disable this and enforce a strong JWT secret.*

## 🏗 Architecture

```text
Browser → React + Vite → REST/JSON → Express → Parameterized mysql2 SQL → MySQL 8
```
MySQL serves as the authoritative system of record. The client application never interacts with it directly. 
For deep dives, see our [Architecture Diagram](docs/architecture-diagram.md) and [Entity-Relationship (ER) Model](docs/er-diagram.md).

## ✨ Functional Scope

- **Student Portal:** Secure registration/login, profile management, skill mapping, paginated internship discovery, search and filter capabilities, detail view/apply workflow, duplicate application protection, application status timeline, interview scheduling, offer response management, internship history logging, and database-driven skill matching.
- **Placement Administration:** Comprehensive dashboard analytics, management of students, companies, internships, applications, interviews, offers, and evaluations. Features robust APIs for company/posting creation, controlled application state transitions, and interview outcome workflows.

*Note: Company-user ownership is fully normalized within the database schema. While a dedicated company portal is a logical extension, the core system focuses on the Student and Admin experiences to maintain a tight, assessable core.*

## 🗄️ Database Design

The schema is built on **16 optimized relations**: `departments`, `industries`, `users`, `students`, `companies`, `company_users`, `skills`, `student_skills`, `internships`, `internship_skills`, `applications`, `application_status_history`, `interviews`, `offers`, `internship_records`, and `evaluations`.

The data model aggressively targets **defensible 3NF**. It demonstrates:
- Primary/Foreign/Composite Keys
- `UNIQUE`, `NOT NULL`, and `CHECK` constraints
- Sensible cascading delete behaviors
- M:N junction tables
- Composite indexes and Views
- DB-level Triggers and Transactions
- Immutable state history
- Advanced querying techniques: `INNER`/`LEFT JOIN`, `GROUP BY`/`HAVING`, nested/correlated subqueries, `EXISTS`/`NOT EXISTS`, temporal data analytics, relational division, and scalable pagination.

Detailed resources: [Database Design](docs/database-design.md), [Data Dictionary](docs/data-dictionary.md), and [Business Rules](docs/business-rules.md).

## 📊 SQL Analytics

The `database/queries.sql` file contains **35 evaluation-ready queries**. These cover advanced analytics such as time-to-stage tracking, funnel conversion analysis, skill co-occurrence mapping, relational skill matching, fill rate calculations, and monthly industry trends. Ten robust Viva examples are documented in [Query Demonstrations](docs/query-demonstration.md).

**Key Materialized Views:**
`student_application_summary`, `internship_application_stats`, `company_recruitment_summary`, `placement_statistics`, `application_funnel_statistics`, `skill_demand_statistics`, `internship_outcome_statistics`.

## 📈 Data Strategy & Generation

### Demo Mode
Running `docker compose up --build` automatically loads a small, deterministic synthetic dataset from `database/seed.sql` for rapid demonstration purposes.

### Enterprise Dataset Mode
To stress-test the system with high-volume data, utilize the provided generation script:

```bash
python scripts/generate_data.py
docker compose exec -T mysql mysql -ucampushire -pcampushire campushire < database/generated_seed.sql
```
The deterministic seed is `20260826`. **Target output configuration:**
- **Departments:** 20
- **Skills:** 120
- **Companies:** 1,000
- **Internships:** 5,000
- **Students:** 15,000
- **Applications:** 50,000
- **Interviews:** Up to 15,000
- **Offers:** ~6,000 (dictated by the deterministic funnel)
- **Internship Records:** Up to 3,500
- **Evaluations:** Up to 2,800

The generator automatically creates temporally ordered, highly realistic lifecycle data with an explicit application status history.

*Data Boundary: `clean_data.py` and `import_data.py` define an optional public-data boundary. No third-party dataset is bundled, ensuring zero unsupported licensing or provenance claims.*

## 🔒 Security & Data Integrity

- **Authentication & Authorization:** bcrypt password hashing, JWT authentication, and strict Student/Admin RBAC.
- **Network & Payload:** Helmet middleware, restricted CORS, 1 MB JSON payload limits, and API rate limiting.
- **Database Security:** Parameterized SQL queries to prevent injections, centralized safe error handling, `.env` file exclusion, strict input/range checks, owner-scoped student queries, and robust DB constraints/triggers.
- *(Note: JWT storage in `localStorage` is an accepted academic tradeoff; a production deployment should migrate to HTTP-only cookies with CSRF tokens.)*

## 🧪 Testing and CI/CD

The project leverages **GitHub Actions** for continuous integration. The pipeline:
1. Provisions a MySQL 8 instance.
2. Initializes the schema, views, triggers, and seed data.
3. Validates the 35 SQL analytics queries.
4. Executes backend MySQL integration tests.
5. Builds the React frontend.

Test coverage includes database health, user registration workflows, duplicate rejection, login mechanisms, RBAC enforcement, internship validation, duplicate application blocking, and closed-internship trigger enforcement. See [Testing Documentation](docs/testing.md).

## 📂 Project Structure

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

## 📚 Documentation Directory

- [Architecture Diagram](docs/architecture-diagram.md)
- [Entity-Relationship (ER) Diagram](docs/er-diagram.md)
- [Database Design & Normalization](docs/database-design.md)
- [Data Dictionary](docs/data-dictionary.md)
- [Business Rules & State Machine](docs/business-rules.md)
- [API Reference](docs/api-documentation.md)
- [SQL Viva Demonstrations](docs/query-demonstration.md)
- [Testing Strategy](docs/testing.md)

## 🔮 Future Roadmap

Future iterations could introduce a comprehensive company self-service portal utilizing the existing `company_users` relation, institution Single Sign-On (SSO) integration, resume object storage (S3/GCS), and automated notification delivery architectures. These are currently outside the primary DBMS-focused scope.

## 📄 License
Released under the **MIT License** — see `LICENSE` for details.
