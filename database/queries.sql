USE campushire;
-- 1 Top companies by applications
SELECT c.name,COUNT(a.application_id) applications FROM companies c JOIN internships i ON i.company_id=c.company_id LEFT JOIN applications a ON a.internship_id=i.internship_id GROUP BY c.company_id,c.name ORDER BY applications DESC LIMIT 10;
-- 2 Top students by applications
SELECT s.registration_no,CONCAT(s.first_name,' ',COALESCE(s.last_name,'')) student,COUNT(a.application_id) applications FROM students s JOIN applications a ON a.student_id=s.student_id GROUP BY s.student_id,s.registration_no,s.first_name,s.last_name ORDER BY applications DESC LIMIT 10;
-- 3 Internship count by industry
SELECT ind.name,COUNT(i.internship_id) internship_count FROM industries ind JOIN companies c ON c.industry_id=ind.industry_id LEFT JOIN internships i ON i.company_id=c.company_id GROUP BY ind.industry_id,ind.name ORDER BY internship_count DESC;
-- 4 Application-to-offer conversion by company
SELECT c.name,COUNT(DISTINCT a.application_id) applications,COUNT(DISTINCT o.offer_id) offers,ROUND(100*COUNT(DISTINCT o.offer_id)/NULLIF(COUNT(DISTINCT a.application_id),0),2) conversion_pct FROM companies c JOIN internships i ON i.company_id=c.company_id LEFT JOIN applications a ON a.internship_id=i.internship_id LEFT JOIN offers o ON o.application_id=a.application_id GROUP BY c.company_id,c.name ORDER BY conversion_pct DESC;
-- 5 Most demanded skills
SELECT sk.name,COUNT(*) demand_count FROM skills sk JOIN internship_skills x ON x.skill_id=sk.skill_id GROUP BY sk.skill_id,sk.name ORDER BY demand_count DESC LIMIT 20;
-- 6 Average stipend by industry
SELECT ind.name,ROUND(AVG(i.stipend),2) avg_stipend FROM industries ind JOIN companies c ON c.industry_id=ind.industry_id JOIN internships i ON i.company_id=c.company_id GROUP BY ind.industry_id,ind.name ORDER BY avg_stipend DESC;
-- 7 Average stipend by location
SELECT location,ROUND(AVG(stipend),2) avg_stipend FROM internships GROUP BY location ORDER BY avg_stipend DESC;
-- 8 Students with no applications (NOT EXISTS)
SELECT s.student_id,s.registration_no FROM students s WHERE NOT EXISTS(SELECT 1 FROM applications a WHERE a.student_id=s.student_id);
-- 9 Internships nearing deadline
SELECT internship_id,title,application_deadline FROM internships WHERE status='active' AND application_deadline BETWEEN NOW() AND DATE_ADD(NOW(),INTERVAL 7 DAY) ORDER BY application_deadline;
-- 10 Students with accepted offers
SELECT DISTINCT s.registration_no,c.name,i.title FROM students s JOIN applications a ON a.student_id=s.student_id JOIN internships i ON i.internship_id=a.internship_id JOIN companies c ON c.company_id=i.company_id JOIN offers o ON o.application_id=a.application_id WHERE o.status='accepted';
-- 11 Companies with highest offer rate
SELECT c.name,COUNT(DISTINCT a.application_id) applications,COUNT(DISTINCT o.offer_id) offers,ROUND(COUNT(DISTINCT o.offer_id)/NULLIF(COUNT(DISTINCT a.application_id),0),3) offer_rate FROM companies c JOIN internships i ON i.company_id=c.company_id LEFT JOIN applications a ON a.internship_id=i.internship_id LEFT JOIN offers o ON o.application_id=a.application_id GROUP BY c.company_id,c.name HAVING applications>=5 ORDER BY offer_rate DESC;
-- 12 Applications awaiting decisions
SELECT a.application_id,s.registration_no,i.title,a.status,a.applied_at FROM applications a JOIN students s ON s.student_id=a.student_id JOIN internships i ON i.internship_id=a.internship_id WHERE a.status IN('submitted','under_review','shortlisted','interview') ORDER BY a.applied_at;
-- 13 Interview success rate
SELECT ROUND(100*SUM(result='passed')/NULLIF(COUNT(*),0),2) interview_success_pct FROM interviews WHERE result<>'pending';
-- 14 Department-wise applications
SELECT d.code,COUNT(DISTINCT s.student_id) students,COUNT(a.application_id) applications FROM departments d JOIN students s ON s.department_id=d.department_id LEFT JOIN applications a ON a.student_id=s.student_id GROUP BY d.department_id,d.code ORDER BY applications DESC;
-- 15 Department-wise offers
SELECT d.code,COUNT(o.offer_id) offers,SUM(o.status='accepted') accepted FROM departments d JOIN students s ON s.department_id=d.department_id LEFT JOIN applications a ON a.student_id=s.student_id LEFT JOIN offers o ON o.application_id=a.application_id GROUP BY d.department_id,d.code ORDER BY offers DESC;
-- 16 Popular internship locations
SELECT i.location,COUNT(a.application_id) applications FROM internships i LEFT JOIN applications a ON a.internship_id=i.internship_id GROUP BY i.location ORDER BY applications DESC;
-- 17 Average applications per internship (nested aggregation)
SELECT ROUND(AVG(application_count),2) avg_applications FROM(SELECT i.internship_id,COUNT(a.application_id) application_count FROM internships i LEFT JOIN applications a ON a.internship_id=i.internship_id GROUP BY i.internship_id)x;
-- 18 Skill match percentage (correlated subquery)
SELECT s.student_id,i.internship_id,i.title,ROUND(100*(SELECT COUNT(*) FROM student_skills ss JOIN internship_skills req ON req.skill_id=ss.skill_id WHERE ss.student_id=s.student_id AND req.internship_id=i.internship_id)/NULLIF((SELECT COUNT(*) FROM internship_skills req2 WHERE req2.internship_id=i.internship_id AND req2.is_required=1),0),2) match_pct FROM students s CROSS JOIN internships i WHERE i.status='active' ORDER BY match_pct DESC LIMIT 100;
-- 19 Internship completion statistics
SELECT status,COUNT(*) records FROM internship_records GROUP BY status ORDER BY records DESC;
-- 20 Average evaluation score by company
SELECT c.name,ROUND(AVG(e.score),2) avg_score,COUNT(*) evaluations FROM companies c JOIN internships i ON i.company_id=c.company_id JOIN applications a ON a.internship_id=i.internship_id JOIN offers o ON o.application_id=a.application_id JOIN internship_records r ON r.offer_id=o.offer_id JOIN evaluations e ON e.record_id=r.record_id GROUP BY c.company_id,c.name ORDER BY avg_score DESC;
-- 21 Above-average internships
SELECT v.internship_id,v.title,v.applications FROM internship_application_stats v WHERE v.applications>(SELECT AVG(applications) FROM internship_application_stats) ORDER BY v.applications DESC;
-- 22 Active internships with pagination
SELECT i.internship_id,i.title,c.name company,i.location,i.work_mode,i.stipend FROM internships i JOIN companies c ON c.company_id=i.company_id WHERE i.status='active' AND i.application_deadline>NOW() ORDER BY i.application_deadline LIMIT 20 OFFSET 0;
-- 23 Students with more than five applications (HAVING)
SELECT s.registration_no,COUNT(*) applications FROM students s JOIN applications a ON a.student_id=s.student_id GROUP BY s.student_id,s.registration_no HAVING COUNT(*)>5 ORDER BY applications DESC;
-- 24 Student skills never demanded
SELECT sk.name FROM skills sk JOIN student_skills ss ON ss.skill_id=sk.skill_id WHERE NOT EXISTS(SELECT 1 FROM internship_skills x WHERE x.skill_id=sk.skill_id) GROUP BY sk.skill_id,sk.name;
-- 25 Average time application to first interview
SELECT ROUND(AVG(TIMESTAMPDIFF(HOUR,a.applied_at,x.first_interview))/24,2) avg_days FROM applications a JOIN(SELECT application_id,MIN(scheduled_at) first_interview FROM interviews GROUP BY application_id)x ON x.application_id=a.application_id;
-- 26 Average time interview to offer
SELECT ROUND(AVG(TIMESTAMPDIFF(HOUR,x.last_interview,o.offered_at))/24,2) avg_days FROM offers o JOIN(SELECT application_id,MAX(scheduled_at) last_interview FROM interviews GROUP BY application_id)x ON x.application_id=o.application_id WHERE o.offered_at>=x.last_interview;
-- 27 Offer acceptance rate by company
SELECT c.name,COUNT(o.offer_id) offers,SUM(o.status='accepted') accepted,ROUND(100*SUM(o.status='accepted')/NULLIF(COUNT(o.offer_id),0),2) acceptance_pct FROM companies c JOIN internships i ON i.company_id=c.company_id JOIN applications a ON a.internship_id=i.internship_id JOIN offers o ON o.application_id=a.application_id GROUP BY c.company_id,c.name ORDER BY acceptance_pct DESC;
-- 28 Application funnel by department using CASE
SELECT d.code,COUNT(a.application_id) total,SUM(a.status IN('shortlisted','interview','offered')) progressed,SUM(a.status='interview') interviewing,SUM(a.status='offered') offered,SUM(a.status='rejected') rejected FROM departments d JOIN students s ON s.department_id=d.department_id LEFT JOIN applications a ON a.student_id=s.student_id GROUP BY d.department_id,d.code;
-- 29 Most common pairs of demanded skills
SELECT s1.name skill_a,s2.name skill_b,COUNT(*) internships FROM internship_skills a JOIN internship_skills b ON b.internship_id=a.internship_id AND b.skill_id>a.skill_id JOIN skills s1 ON s1.skill_id=a.skill_id JOIN skills s2 ON s2.skill_id=b.skill_id GROUP BY a.skill_id,b.skill_id,s1.name,s2.name ORDER BY internships DESC LIMIT 20;
-- 30 Internship fill rate versus openings
SELECT i.title,c.name,i.openings,SUM(o.status='accepted') accepted,ROUND(100*SUM(o.status='accepted')/i.openings,2) fill_pct FROM internships i JOIN companies c ON c.company_id=i.company_id LEFT JOIN applications a ON a.internship_id=i.internship_id LEFT JOIN offers o ON o.application_id=a.application_id GROUP BY i.internship_id,i.title,c.name,i.openings ORDER BY fill_pct DESC;
-- 31 Companies below overall offer rate
SELECT x.* FROM(SELECT c.company_id,c.name,COUNT(o.offer_id)/NULLIF(COUNT(a.application_id),0) rate FROM companies c JOIN internships i ON i.company_id=c.company_id LEFT JOIN applications a ON a.internship_id=i.internship_id LEFT JOIN offers o ON o.application_id=a.application_id GROUP BY c.company_id,c.name)x WHERE x.rate<(SELECT COUNT(*)/(SELECT COUNT(*) FROM applications) FROM offers);
-- 32 Students satisfying every required skill of an internship (double NOT EXISTS)
SELECT s.student_id,s.registration_no,i.internship_id,i.title FROM students s CROSS JOIN internships i WHERE i.status='active' AND NOT EXISTS(SELECT 1 FROM internship_skills req WHERE req.internship_id=i.internship_id AND req.is_required=1 AND NOT EXISTS(SELECT 1 FROM student_skills ss WHERE ss.student_id=s.student_id AND ss.skill_id=req.skill_id)) LIMIT 100;
-- 33 Monthly application trend
SELECT DATE_FORMAT(applied_at,'%Y-%m') month,COUNT(*) applications FROM applications GROUP BY DATE_FORMAT(applied_at,'%Y-%m') ORDER BY month;
-- 34 Monthly offer trend
SELECT DATE_FORMAT(offered_at,'%Y-%m') month,COUNT(*) offers,SUM(status='accepted') accepted FROM offers GROUP BY DATE_FORMAT(offered_at,'%Y-%m') ORDER BY month;
-- 35 Average internship evaluation by industry
SELECT ind.name,ROUND(AVG(e.score),2) avg_score,COUNT(*) evaluations FROM industries ind JOIN companies c ON c.industry_id=ind.industry_id JOIN internships i ON i.company_id=c.company_id JOIN applications a ON a.internship_id=i.internship_id JOIN offers o ON o.application_id=a.application_id JOIN internship_records r ON r.offer_id=o.offer_id JOIN evaluations e ON e.record_id=r.record_id GROUP BY ind.industry_id,ind.name ORDER BY avg_score DESC;
