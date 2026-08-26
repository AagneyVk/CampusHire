USE campushire;

CREATE OR REPLACE VIEW student_application_summary AS
SELECT s.student_id, s.registration_no,
       CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name,
       COUNT(a.application_id) AS total_applications,
       SUM(a.status = 'offered') AS offered_applications,
       SUM(a.status = 'rejected') AS rejected_applications
FROM students s
LEFT JOIN applications a ON a.student_id = s.student_id
GROUP BY s.student_id, s.registration_no, s.first_name, s.last_name;

CREATE OR REPLACE VIEW internship_application_stats AS
SELECT i.internship_id, i.title, i.company_id,
       COUNT(a.application_id) AS applications,
       SUM(a.status = 'shortlisted') AS shortlisted,
       SUM(a.status = 'offered') AS offered
FROM internships i
LEFT JOIN applications a ON a.internship_id = i.internship_id
GROUP BY i.internship_id, i.title, i.company_id;

CREATE OR REPLACE VIEW company_recruitment_summary AS
SELECT c.company_id, c.name,
       COUNT(DISTINCT i.internship_id) AS internships,
       COUNT(a.application_id) AS applications,
       COUNT(o.offer_id) AS offers,
       SUM(o.status = 'accepted') AS accepted_offers
FROM companies c
LEFT JOIN internships i ON i.company_id = c.company_id
LEFT JOIN applications a ON a.internship_id = i.internship_id
LEFT JOIN offers o ON o.application_id = a.application_id
GROUP BY c.company_id, c.name;

CREATE OR REPLACE VIEW placement_statistics AS
SELECT d.department_id, d.code, d.name,
       COUNT(DISTINCT s.student_id) AS students,
       COUNT(DISTINCT a.application_id) AS applications,
       COUNT(DISTINCT o.offer_id) AS offers,
       COUNT(DISTINCT CASE WHEN o.status = 'accepted' THEN o.offer_id END) AS accepted_offers
FROM departments d
LEFT JOIN students s ON s.department_id = d.department_id
LEFT JOIN applications a ON a.student_id = s.student_id
LEFT JOIN offers o ON o.application_id = a.application_id
GROUP BY d.department_id, d.code, d.name;
