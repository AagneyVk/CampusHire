# CampusHire Database Design

## Problem definition
CampusHire models the complete university internship lifecycle while keeping MySQL as the system of record. Student identity/profile data, companies, postings, skills, applications, interviews, offers, internship records and evaluations are represented separately so transactional facts are not duplicated.

## Entities and keys
| Table | Primary key | Important foreign keys |
|---|---|---|
| users | user_id | — |
| students | student_id | user_id, department_id |
| departments | department_id | — |
| industries | industry_id | — |
| companies | company_id | industry_id |
| company_users | user_id | company_id |
| internships | internship_id | company_id |
| skills | skill_id | — |
| student_skills | (student_id, skill_id) | both columns |
| internship_skills | (internship_id, skill_id) | both columns |
| applications | application_id | student_id, internship_id |
| interviews | interview_id | application_id |
| offers | offer_id | application_id |
| internship_records | record_id | offer_id |
| evaluations | evaluation_id | record_id |

## Cardinalities
- User to Student: 1:0..1.
- Industry to Company: 1:N.
- Company to Internship: 1:N.
- Student to Skill: M:N through `student_skills`.
- Internship to Skill: M:N through `internship_skills`.
- Student to Internship: M:N through `applications`, with a uniqueness constraint preventing duplicate applications.
- Application to Interview: 1:N.
- Application to Offer: 1:0..1.
- Accepted Offer to Internship Record: 1:0..1.
- Completed Internship Record to Evaluation: 1:0..1.

## Normalization
The schema targets 3NF. Repeating skill groups are junction tables, company attributes are not copied into internship rows, industry names are separated from companies, and lifecycle facts remain in their respective tables. Derived analytics are implemented as views rather than stored redundant columns.

## Integrity constraints
Primary/foreign keys enforce identity and references. CHECK constraints protect CGPA, score, stipend, duration and date ranges. Unique constraints protect emails, registration numbers, names where appropriate, application uniqueness, interview rounds and one-offer/record/evaluation relationships. Triggers additionally reject applications to closed postings, offers for unsuccessful applications, records without accepted offers and evaluations before completion.

## Indexing decisions
Indexes follow real access patterns: internship company/status/deadline/location/mode/stipend filters; application student/status and internship/status lookups; interview schedule/result; offer status/deadline; student department/year; skill reverse lookups. Composite indexes place equality columns before range/sort-oriented columns where practical.

## Transactions
Student registration creates `users` and `students` atomically. Student skill replacement deletes and recreates the junction rows in one transaction. Multi-step lifecycle operations should use transactions when a workflow modifies multiple records.

## Views
`student_application_summary`, `company_recruitment_summary`, `internship_application_stats`, and `placement_statistics` provide reusable reporting relations. `database/queries.sql` contains 24 evaluation queries demonstrating INNER/LEFT JOIN, aggregates, GROUP BY/HAVING, subqueries, correlated subqueries, ORDER BY, filtering and pagination.

## Assumptions
One application belongs to exactly one student and posting. A student can apply once per posting. One offer can be generated per application. An internship record represents an accepted offer. Evaluation score uses a 0–10 scale. Company accounts are structurally supported but Student + Admin are the primary evaluated roles to avoid unnecessary complexity.
