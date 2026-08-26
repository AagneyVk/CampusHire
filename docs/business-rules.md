# Business Rules and Application State Machine

## Application lifecycle
`submitted → under_review → shortlisted → interview → offered`

Failure/exit branches: `submitted|under_review|shortlisted|interview → rejected`; a student may withdraw before a terminal decision. `offered`, `rejected`, and `withdrawn` are terminal application states. Offer acceptance/rejection is represented by the normalized `offers.status`, not overloaded into `applications.status`.

Every application status change is written to `application_status_history`, including timestamp, actor when available, and reason. The API service rejects illegal state jumps.

## Database invariants
1. `(student_id, internship_id)` is unique.
2. Application trigger rejects inactive/expired postings and students below minimum CGPA.
3. Interview round number is unique per application and its scheduled time must follow application time.
4. One offer exists per application; the trigger permits offers only at eligible stages.
5. Internship record requires an accepted offer and cannot begin before acceptance.
6. Evaluation is unique per record, score is 0–10, and the record must be completed with an end date before evaluation.
7. Foreign keys protect all lifecycle ownership relationships.
8. Student endpoints derive `student_id` from the authenticated JWT user; clients never choose another student's owner ID.
9. Admin routes require the admin role.
10. Deleting a posting that already has applications is blocked; it should be closed/cancelled instead to preserve history.

## Controlled bulk seed mode
Historical synthetic data must represent past closed internships. The trigger file therefore recognizes the session-local `@campushire_bulk_seed=1` flag used only by `generate_data.py` output. It bypasses time-sensitive trigger checks during deterministic offline dataset construction while foreign keys/check constraints remain available when re-enabled. Normal application sessions never set this variable.

## Transaction boundaries
- Registration: `users + students` commit or rollback together.
- Skill update: junction-table replacement is atomic.
- Admin interview creation plus appropriate application progression is atomic.
- Offer generation plus application transition is atomic.
- Offer response is locked to the authenticated student's pending offer.
