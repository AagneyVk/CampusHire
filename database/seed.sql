USE campushire;

INSERT INTO departments(code,name) VALUES
('CSE','Computer Science and Engineering'),('ECE','Electronics and Communication Engineering'),('EEE','Electrical and Electronics Engineering'),('MECH','Mechanical Engineering'),('CIVIL','Civil Engineering'),('IT','Information Technology'),('AIML','Artificial Intelligence and Machine Learning'),('DS','Data Science')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO industries(name) VALUES ('Software'),('FinTech'),('Consulting'),('Manufacturing'),('Healthcare'),('Education'),('Telecom'),('Automotive'),('Energy'),('E-commerce') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO skills(name,category) VALUES ('C','Programming'),('C++','Programming'),('Python','Programming'),('Java','Programming'),('JavaScript','Web'),('TypeScript','Web'),('React','Web'),('Node.js','Web'),('Express','Web'),('MySQL','Database'),('Git','Tools'),('Docker','DevOps'),('Linux','Systems'),('AWS','Cloud'),('Kotlin','Mobile'),('Android','Mobile'),('Data Structures','CS Fundamentals'),('Algorithms','CS Fundamentals'),('Networking','Systems'),('Cybersecurity','Security') ON DUPLICATE KEY UPDATE category=VALUES(category);

INSERT INTO companies(industry_id,name,website,location,description) SELECT industry_id,'Acme Software Labs','https://example.com','Chennai','Demo company for CampusHire.' FROM industries WHERE name='Software' ON DUPLICATE KEY UPDATE location=VALUES(location);
INSERT INTO companies(industry_id,name,website,location,description) SELECT industry_id,'Vertex FinTech','https://example.com','Bengaluru','Demo fintech company for CampusHire.' FROM industries WHERE name='FinTech' ON DUPLICATE KEY UPDATE location=VALUES(location);

-- bcrypt hash for password: password
INSERT INTO users(email,password_hash,role) VALUES
('admin@campushire.local','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxYzPqDgV2QxZQw5XQbL1tR0r7e','admin'),
('student@campushire.local','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxYzPqDgV2QxZQw5XQbL1tR0r7e','student')
ON DUPLICATE KEY UPDATE role=VALUES(role);

INSERT IGNORE INTO students(user_id,registration_no,department_id,first_name,last_name,graduation_year,cgpa,bio)
SELECT u.user_id,'DEMO2028001',d.department_id,'Demo','Student',2028,8.50,'Demo student account for local evaluation.' FROM users u JOIN departments d ON d.code='CSE' WHERE u.email='student@campushire.local';

INSERT INTO internships(company_id,title,description,location,work_mode,stipend,duration_weeks,openings,minimum_cgpa,application_deadline,start_date,status)
SELECT company_id,'Software Engineering Intern','Build and test production-style web services in a collaborative engineering team.','Chennai','hybrid',25000,12,4,7.0,DATE_ADD(NOW(),INTERVAL 90 DAY),DATE_ADD(CURDATE(),INTERVAL 120 DAY),'active' FROM companies WHERE name='Acme Software Labs';
INSERT INTO internships(company_id,title,description,location,work_mode,stipend,duration_weeks,openings,minimum_cgpa,application_deadline,start_date,status)
SELECT company_id,'Backend Engineering Intern','Work on APIs, relational data models and backend services.','Bengaluru','onsite',35000,16,3,7.5,DATE_ADD(NOW(),INTERVAL 75 DAY),DATE_ADD(CURDATE(),INTERVAL 100 DAY),'active' FROM companies WHERE name='Vertex FinTech';

INSERT IGNORE INTO internship_skills(internship_id,skill_id,is_required)
SELECT i.internship_id,s.skill_id,1 FROM internships i JOIN skills s ON s.name IN ('JavaScript','React','Git') WHERE i.title='Software Engineering Intern';
INSERT IGNORE INTO internship_skills(internship_id,skill_id,is_required)
SELECT i.internship_id,s.skill_id,1 FROM internships i JOIN skills s ON s.name IN ('Node.js','MySQL','Data Structures') WHERE i.title='Backend Engineering Intern';

-- Additional synthetic demo companies; names are unique so this remains safe on re-run.
INSERT INTO companies(industry_id,name,website,location,description) SELECT industry_id,'ByteForge Technologies','https://example.com','Chennai','Synthetic software company for CampusHire demonstration.' FROM industries WHERE name='Software' ON DUPLICATE KEY UPDATE location=VALUES(location),description=VALUES(description);
INSERT INTO companies(industry_id,name,website,location,description) SELECT industry_id,'CloudNest Solutions','https://example.com','Kochi','Synthetic cloud consulting company for CampusHire demonstration.' FROM industries WHERE name='Consulting' ON DUPLICATE KEY UPDATE location=VALUES(location),description=VALUES(description);
INSERT INTO companies(industry_id,name,website,location,description) SELECT industry_id,'SecureLayer Labs','https://example.com','Kochi','Synthetic cybersecurity company for CampusHire demonstration.' FROM industries WHERE name='Software' ON DUPLICATE KEY UPDATE location=VALUES(location),description=VALUES(description);
INSERT INTO companies(industry_id,name,website,location,description) SELECT industry_id,'PixelWave Commerce','https://example.com','Remote','Synthetic e-commerce company for CampusHire demonstration.' FROM industries WHERE name='E-commerce' ON DUPLICATE KEY UPDATE location=VALUES(location),description=VALUES(description);
INSERT INTO companies(industry_id,name,website,location,description) SELECT industry_id,'GreenGrid Energy','https://example.com','Bengaluru','Synthetic energy technology company for CampusHire demonstration.' FROM industries WHERE name='Energy' ON DUPLICATE KEY UPDATE location=VALUES(location),description=VALUES(description);

-- Extra offers are synthetic and inserted only when the same company/title pair is absent.
INSERT INTO internships(company_id,title,description,location,work_mode,stipend,duration_weeks,openings,minimum_cgpa,application_deadline,start_date,status)
SELECT c.company_id,'Frontend Developer Intern','Build responsive user interfaces, work with component-based frontend code and collaborate on accessibility and testing.','Chennai','hybrid',18000,12,3,6.5,DATE_ADD(NOW(),INTERVAL 60 DAY),DATE_ADD(CURDATE(),INTERVAL 90 DAY),'active' FROM companies c WHERE c.name='ByteForge Technologies' AND NOT EXISTS(SELECT 1 FROM internships i WHERE i.company_id=c.company_id AND i.title='Frontend Developer Intern');
INSERT INTO internships(company_id,title,description,location,work_mode,stipend,duration_weeks,openings,minimum_cgpa,application_deadline,start_date,status)
SELECT c.company_id,'Cloud Engineering Intern','Help automate cloud deployments, monitor services and document reliable infrastructure workflows.','Kochi','remote',22000,12,2,7.0,DATE_ADD(NOW(),INTERVAL 75 DAY),DATE_ADD(CURDATE(),INTERVAL 105 DAY),'active' FROM companies c WHERE c.name='CloudNest Solutions' AND NOT EXISTS(SELECT 1 FROM internships i WHERE i.company_id=c.company_id AND i.title='Cloud Engineering Intern');
INSERT INTO internships(company_id,title,description,location,work_mode,stipend,duration_weeks,openings,minimum_cgpa,application_deadline,start_date,status)
SELECT c.company_id,'Cybersecurity Intern','Assist with network security reviews, vulnerability triage and supervised practical security testing.','Kochi','hybrid',16000,8,2,6.5,DATE_ADD(NOW(),INTERVAL 65 DAY),DATE_ADD(CURDATE(),INTERVAL 95 DAY),'active' FROM companies c WHERE c.name='SecureLayer Labs' AND NOT EXISTS(SELECT 1 FROM internships i WHERE i.company_id=c.company_id AND i.title='Cybersecurity Intern');
INSERT INTO internships(company_id,title,description,location,work_mode,stipend,duration_weeks,openings,minimum_cgpa,application_deadline,start_date,status)
SELECT c.company_id,'Data Analyst Intern','Explore business datasets, write SQL queries and build concise reports that support product decisions.','Remote','remote',20000,10,3,7.0,DATE_ADD(NOW(),INTERVAL 90 DAY),DATE_ADD(CURDATE(),INTERVAL 120 DAY),'active' FROM companies c WHERE c.name='PixelWave Commerce' AND NOT EXISTS(SELECT 1 FROM internships i WHERE i.company_id=c.company_id AND i.title='Data Analyst Intern');
INSERT INTO internships(company_id,title,description,location,work_mode,stipend,duration_weeks,openings,minimum_cgpa,application_deadline,start_date,status)
SELECT c.company_id,'Embedded Systems Intern','Prototype and test embedded software, work with device interfaces and document system-level behaviour.','Bengaluru','onsite',18000,16,2,7.5,DATE_ADD(NOW(),INTERVAL 55 DAY),DATE_ADD(CURDATE(),INTERVAL 85 DAY),'active' FROM companies c WHERE c.name='GreenGrid Energy' AND NOT EXISTS(SELECT 1 FROM internships i WHERE i.company_id=c.company_id AND i.title='Embedded Systems Intern');

INSERT IGNORE INTO internship_skills(internship_id,skill_id,is_required) SELECT i.internship_id,s.skill_id,1 FROM internships i JOIN companies c ON c.company_id=i.company_id JOIN skills s ON s.name IN('TypeScript','React','Git') WHERE c.name='ByteForge Technologies' AND i.title='Frontend Developer Intern';
INSERT IGNORE INTO internship_skills(internship_id,skill_id,is_required) SELECT i.internship_id,s.skill_id,1 FROM internships i JOIN companies c ON c.company_id=i.company_id JOIN skills s ON s.name IN('AWS','Linux','Docker') WHERE c.name='CloudNest Solutions' AND i.title='Cloud Engineering Intern';
INSERT IGNORE INTO internship_skills(internship_id,skill_id,is_required) SELECT i.internship_id,s.skill_id,1 FROM internships i JOIN companies c ON c.company_id=i.company_id JOIN skills s ON s.name IN('Cybersecurity','Networking','Linux') WHERE c.name='SecureLayer Labs' AND i.title='Cybersecurity Intern';
INSERT IGNORE INTO internship_skills(internship_id,skill_id,is_required) SELECT i.internship_id,s.skill_id,1 FROM internships i JOIN companies c ON c.company_id=i.company_id JOIN skills s ON s.name IN('Python','MySQL','Data Structures') WHERE c.name='PixelWave Commerce' AND i.title='Data Analyst Intern';
INSERT IGNORE INTO internship_skills(internship_id,skill_id,is_required) SELECT i.internship_id,s.skill_id,1 FROM internships i JOIN companies c ON c.company_id=i.company_id JOIN skills s ON s.name IN('C','C++','Linux') WHERE c.name='GreenGrid Energy' AND i.title='Embedded Systems Intern';
