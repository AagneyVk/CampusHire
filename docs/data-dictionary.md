# Data Dictionary

| Table | Key columns / types | Important attributes | Purpose / constraints |
|---|---|---|---|
| `departments` | `department_id INT PK` | `code VARCHAR UNIQUE`, `name VARCHAR UNIQUE` | Academic department reference. |
| `industries` | `industry_id INT PK` | `name VARCHAR UNIQUE` | Normalizes company industry classification. |
| `users` | `user_id BIGINT PK` | `email VARCHAR UNIQUE`, `password_hash`, `role ENUM`, `is_active BOOL` | Authentication identity separated from role-specific profile. |
| `students` | `student_id BIGINT PK`, `user_id FK UNIQUE`, `department_id FK` | registration no UNIQUE, names, graduation year, CGPA, phone, resume URL, bio | Student profile; CGPA CHECK 0–10. |
| `companies` | `company_id BIGINT PK`, `industry_id FK` | name UNIQUE, website, location, description, active flag | Recruiting organization. |
| `company_users` | `user_id PK/FK`, `company_id FK` | job title | Optional normalized company-account ownership. |
| `skills` | `skill_id INT PK` | name UNIQUE, category | Canonical skill dictionary. |
| `student_skills` | `(student_id,skill_id) composite PK/FKs` | proficiency ENUM | M:N student-skill relationship. |
| `internships` | `internship_id BIGINT PK`, `company_id FK` | title, description, location, mode, stipend, duration, openings, minimum CGPA, deadline, start date, status | Posting fact; range/date checks and search indexes. |
| `internship_skills` | `(internship_id,skill_id) composite PK/FKs` | required flag | M:N posting-skill requirements. |
| `applications` | `application_id BIGINT PK`, student/internship FKs | cover letter, status ENUM, timestamps | M:N associative transactional entity; student+internship UNIQUE. |
| `application_status_history` | `history_id BIGINT PK`, application FK, changed_by user FK nullable | old/new status, changed_at, reason | Auditable state transitions and time-to-stage analytics. |
| `interviews` | `interview_id BIGINT PK`, application FK | round, schedule, mode, meeting/venue, result, notes | 1:N interview rounds; `(application_id,round_no)` UNIQUE. |
| `offers` | `offer_id BIGINT PK`, application FK UNIQUE | offered time, response deadline, stipend, status, responded time | At most one offer per application; deadline/stipend checks. |
| `internship_records` | `record_id BIGINT PK`, offer FK UNIQUE | start/end, status, completion notes | Materialized internship outcome only after accepted offer. |
| `evaluations` | `evaluation_id BIGINT PK`, record FK UNIQUE | score, feedback, evaluated time | One evaluation per completed record; score CHECK 0–10. |

All foreign-key columns are NOT NULL unless the relationship is intentionally optional. `changed_by` is nullable so historical/generated system transitions remain valid even if an actor account is removed. See `database/schema.sql` for exact lengths/defaults and `docs/database-design.md` for normalization rationale.
