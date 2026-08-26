# SQL Demonstration Guide

`database/queries.sql` contains **35 non-trivial queries**. Recommended viva demonstrations:

1. **Top recruiting companies** — multi-table JOIN + LEFT JOIN + GROUP BY; explains demand concentration.
2. **Application-to-offer conversion** — distinct aggregation and `NULLIF`; compares recruiting efficiency.
3. **Students with no applications** — `NOT EXISTS`; demonstrates anti-join semantics.
4. **Average applications per internship** — nested aggregation; shows why aggregate-of-aggregate requires a derived table.
5. **Skill match percentage** — correlated subqueries across M:N junction tables; demonstrates relational recommendation logic.
6. **Average application → interview time** — grouped first interview plus `TIMESTAMPDIFF`; measures process latency.
7. **Application funnel by department** — conditional `SUM`/CASE-style boolean aggregation across several joins.
8. **Most common skill pairs** — self-join of `internship_skills`; discovers co-occurrence without comma-separated attributes.
9. **Students satisfying every required skill** — double `NOT EXISTS`, expressing relational division.
10. **Companies below overall offer rate** — grouped derived table compared with an overall nested aggregate.

For live output, run:
```bash
mysql -h127.0.0.1 -ucampushire -pcampushire campushire < database/queries.sql
```

Outputs depend on the selected demo/full dataset and are intentionally not fabricated in documentation. The insight should be explained from the live database during evaluation.
