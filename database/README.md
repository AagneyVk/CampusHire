# Database

Initialization order under Docker:
1. `schema.sql` — tables, foreign keys, constraints and indexes.
2. `views.sql` — reusable analytical views.
3. `business_rules.sql` — lifecycle integrity triggers.
4. `seed.sql` — small deterministic demo dataset.

`queries.sql` contains 24 meaningful DBMS evaluation queries. `../scripts/generate_data.py` creates a larger deterministic SQL dataset for performance/demo use. Run it with `python scripts/generate_data.py`, then import `database/generated_seed.sql` into the running MySQL database when a larger dataset is desired.

The schema is approximately 3NF: skills are modeled through junction tables; companies are referenced by internships rather than duplicated; transactional lifecycle entities are separate; analytics are derived rather than hard-coded.
