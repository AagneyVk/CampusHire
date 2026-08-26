# ER Diagram
```mermaid
erDiagram
 USERS ||--o| STUDENTS : has
 USERS ||--o| COMPANY_USERS : represents
 USERS ||--o{ APPLICATION_STATUS_HISTORY : changes
 DEPARTMENTS ||--o{ STUDENTS : contains
 INDUSTRIES ||--o{ COMPANIES : classifies
 COMPANIES ||--o{ COMPANY_USERS : employs
 COMPANIES ||--o{ INTERNSHIPS : posts
 STUDENTS ||--o{ STUDENT_SKILLS : has
 SKILLS ||--o{ STUDENT_SKILLS : maps
 INTERNSHIPS ||--o{ INTERNSHIP_SKILLS : requires
 SKILLS ||--o{ INTERNSHIP_SKILLS : maps
 STUDENTS ||--o{ APPLICATIONS : submits
 INTERNSHIPS ||--o{ APPLICATIONS : receives
 APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORY : records
 APPLICATIONS ||--o{ INTERVIEWS : schedules
 APPLICATIONS ||--o| OFFERS : may_receive
 OFFERS ||--o| INTERNSHIP_RECORDS : becomes
 INTERNSHIP_RECORDS ||--o| EVALUATIONS : receives
```

`application_status_history` is deliberately separate from `applications`: the current state belongs on the application row for efficient filtering, while transitions are repeating temporal facts and therefore form a 1:N child relation.
