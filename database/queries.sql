USE campushire;

-- 1. Top companies by number of applications
SELECT c.name, COUNT(a.application_id) applications FROM companies c JOIN internships i ON i.company_id=c.company_id LEFT JOIN applications a ON a.internship_id=i.internship_id GROUP BY c.company_id,c.name ORDER BY applications DESC LIMIT 10;
-- 2. Top students by number of applications
SELECT s.registration_no, CONCAT(s.first_name,' ',COALESCE(s.last_name,'')) student, COUNT(a.application_id) applications FROM students s JOIN applications a ON a.student_id=s.student_id GROUP BY s.student_id,s.registration_no,s.first_name,s.last_name ORDER BY applications DESC LIMIT 10;
-- 3. Internship count by industry
SELECT ind.name, COUNT(i.internship_id) internship_count FROM industries ind JOIN companies c ON c.industry_id=ind.industry_id LEFT JOIN internships i ON i.company_id=c.company_id GROUP BY ind.industry_id,ind.name ORDER BY internship_count DESC;
-- 4. Application-to-offer conversion by company
SELECT c.name, COUNT(DISTINCT a.application_id) applications, COUNT(DISTINCT o.offer_id) offers, ROUND(100*COUNT(DISTINCT o.offer_id)/NULLIF(COUNT(DISTINCT a.application_id),0),2) conversion_pct FROM companies c JOIN internships i ON i.company_id=c.company_id LEFT JOIN applications a ON a.internship_id=i.internship_id LEFT JOIN offers o ON o.application_id=a.application_id GROUP BY c.company_id,c.name ORDER BY conversion_pct DESC;
-- 5. Most demanded skills
SELECT sk.name, COUNT(*) demand_count FROM skills sk JOIN internship_skills isk ON isk.skill_id=sk.skill_id GROUP BY sk.skill_id,sk.name ORDER BY demand_count DESC LIMIT 20;
-- 6. Average stipend by industry
SELECT ind.name, ROUND(AVG(i.stipend),2) avg_stipend FROM industries ind JOIN companies c ON c.industry_id=ind.industry_id JOIN internships i ON i.company_id=c.company_id GROUP BY ind.industry_id,ind.name ORDER BY avg_stipend DESC;
-- 7. Average stipend by location
SELECT location, ROUND(AVG(stipend),2) avg_stipend FROM internships GROUP BY location ORDER BY avg_stipend DESC;
-- 8. Students with no applications
SELECT s.student_id,s.registration_no,s.first_name,s.last_name FROM students s LEFT JOIN applications a ON a.student_id=s.student_id WHERE a.application_id IS NULL;
-- 9. Internships nearing deadline
SELECT internship_id,title,application_deadline FROM internships WHERE status='active' AND application_deadline BETWEEN NOW() AND DATE_ADD(NOW(),INTERVAL 7 DAY) ORDER BY application_deadline;
-- 10. Students with accepted offers
SELECT DISTINCT s.registration_no,s.first_name,s.last_name,c.name company,i.title FROM students s JOIN applications a ON a.student_id=s.student_id JOIN internships i ON i.internship_id=a.internship_id JOIN companies c ON c.company_id=i.company_id JOIN offers o ON o.application_id=a.application_id WHERE o.status='accepted';
-- 11. Companies with highest offer rate
SELECT c.name, COUNT(DISTINCT a.application_id) applications, COUNT(DISTINCT o.offer_id) offers, ROUND(COUNT(DISTINCT o.offer_id)/NULLIF(COUNT(DISTINCT a.application_id),0),3) offer_rate FROM companies c JOIN internships i ON i.company_id=c.company_id LEFT JOIN applications a ON a.internship_id=i.internship_id LEFT JOIN offers o ON o.application_id=a.application_id GROUP BY c.company_id,c.name HAVING applications>=5 ORDER BY offer_rate DESC;
-- 12. Applications waiting for decisions
SELECT a.application_id,s.registration_no,i.title,a.status,a.applied_at FROM applications a JOIN students s ON s.student_id=a.student_id JOIN internships i ON i.internship_id=a.internship_id WHERE a.status IN ('submitted','under_review','shortlisted','interview') ORDER BY a.applied_at;
-- 13. Interview success rate
SELECT ROUND(100*SUM(result='passed')/NULLIF(COUNT(*),0),2) interview_success_pct FROM interviews WHERE result<>'pending';
-- 14. Department-wise application statistics
SELECT d.code,COUNT(DISTINCT s.student_id) students,COUNT(a.application_id) applications FROM departments d JOIN students s ON s.department_id=d.department_id LEFT JOIN applications a ON a.student_id=s.student_id GROUP BY d.department_id,d.code ORDER BY applications DESC;
-- 15. Department-wise offer statistics
SELECT d.code,COUNT(o.offer_id) offers,SUM(o.status='accepted') accepted FROM departments d JOIN students s ON s.department_id=d.department_id LEFT JOIN applications a ON a.student_id=s.student_id LEFT JOIN offers o ON o.application_id=a.application_id GROUP BY d.department_id,d.code ORDER BY offers DESC;
-- 16. Most popular internship locations
SELECT i.location,COUNT(a.application_id) applications FROM internships i LEFT JOIN applications a ON a.internship_id=i.internship_id GROUP BY i.location ORDER BY applications DESC;
-- 17. Average applications per internship
SELECT ROUND(AVG(application_count),2) avg_applications FROM (SELECT i.internship_id,COUNT(a.application_id) application_count FROM internships i LEFT JOIN applications a ON a.internship_id=i.internship_id GROUP BY i.internship_id) x;
-- 18. Student/internship skill-match percentage (correlated subquery)
SELECT s.student_id,i.internship_id,i.title,ROUND(100*(SELECT COUNT(*) FROM student_skills ss JOIN internship_skills req ON req.skill_id=ss.skill_id WHERE ss.student_id=s.student_id AND req.internship_id=i.internship_id)/NULLIF((SELECT COUNT(*) FROM internship_skills req2 WHERE req2.internship_id=i.internship_id),0),2) match_pct FROM students s CROSS JOIN internships i WHERE i.status='active' ORDER BY match_pct DESC LIMIT 100;
-- 19. Internship completion statistics
SELECT status,COUNT(*) records FROM internship_records GROUP BY status ORDER BY records DESC;
-- 20. Average evaluation score by company
SELECT c.name,ROUND(AVG(e.score),2) avg_score,COUNT(e.evaluation_id) evaluations FROM companies c JOIN internships i ON i.company_id=c.company_id JOIN applications a ON a.internship_id=i.internship_id JOIN offers o ON o.application_id=a.application_id JOIN internship_records r ON r.offer_id=o.offer_id JOIN evaluations e ON e.record_id=r.record_id GROUP BY c.company_id,c.name HAVING COUNT(e.evaluation_id)>0 ORDER BY avg_score DESC;
-- 21. Internships receiving above-average application counts
SELECT stats.internship_id,stats.title,stats.applications FROM internship_application_stats stats WHERE stats.applications>(SELECT AVG(applications) FROM internship_application_stats) ORDER BY stats.applications DESC;
-- 22. Active internships with pagination
SELECT i.internship_id,i.title,c.name company,i.location,i.work_mode,i.stipend,i.application_deadline FROM internships i INNER JOIN companies c ON c.company_id=i.company_id WHERE i.status='active' AND i.application_deadline>NOW() ORDER BY i.application_deadline ASC LIMIT 20 OFFSET 0;
-- 23. Students having more than five applications (HAVING)
SELECT s.registration_no,COUNT(a.application_id) applications FROM students s JOIN applications a ON a.student_id=s.student_id GROUP BY s.student_id,s.registration_no HAVING COUNT(a.application_id)>5 ORDER BY applications DESC;
-- 24. Skills possessed by students but never requested by internships
SELECT sk.name FROM skills sk JOIN student_skills ss ON ss.skill_id=sk.skill_id LEFT JOIN internship_skills isk ON isk.skill_id=sk.skill_id WHERE isk.skill_id IS NULL GROUP BY sk.skill_id,sk.name;
