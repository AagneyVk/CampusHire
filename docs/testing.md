# Testing and Verification

## Automated
- Backend: `cd backend && npm install && npm test`.
- Frontend: `cd frontend && npm install && npm run build`.
- GitHub Actions executes both checks on pushes and pull requests.

## Clean-stack verification
Run `docker compose down -v && docker compose up --build`. Verify `/api/health`, public internship listing, student/admin login, student application creation and admin analytics.

## Workflow matrix
1. Register student → verify both `users` and `students` are created.
2. Attempt duplicate registration → expect 409.
3. Browse/filter internships → expect only active, future-deadline rows.
4. Apply once → 201; apply twice → 409 via UNIQUE constraint.
5. Apply after deadline/inactive posting → rejected by DB trigger.
6. Access admin route with student JWT → 403.
7. Admin changes application status and schedules interview.
8. Offer creation before successful application → rejected by trigger.
9. Student responds only to own pending offer.
10. Internship record before accepted offer → rejected by trigger.
11. Evaluation before completed record → rejected by trigger.
12. Analytics → values derived from SQL tables/views, never hardcoded.
13. Invalid foreign keys → MySQL rejects operation.

This document records the intended reproducible verification procedure. A CI workflow is committed so build/test status can be observed directly in GitHub rather than claimed without execution evidence.
