import bcrypt from'bcryptjs';import{pool}from'./db.js';
const demoCompanies=[
 {industry:'Software',name:'ByteForge Technologies',location:'Chennai',description:'Synthetic software company for CampusHire demonstration.'},
 {industry:'Consulting',name:'CloudNest Solutions',location:'Kochi',description:'Synthetic cloud consulting company for CampusHire demonstration.'},
 {industry:'Software',name:'SecureLayer Labs',location:'Kochi',description:'Synthetic cybersecurity company for CampusHire demonstration.'},
 {industry:'E-commerce',name:'PixelWave Commerce',location:'Remote',description:'Synthetic e-commerce company for CampusHire demonstration.'},
 {industry:'Energy',name:'GreenGrid Energy',location:'Bengaluru',description:'Synthetic energy technology company for CampusHire demonstration.'}
];
const demoInternships=[
 {company:'ByteForge Technologies',title:'Frontend Developer Intern',description:'Build responsive user interfaces, work with component-based frontend code and collaborate on accessibility and testing.',location:'Chennai',mode:'hybrid',stipend:18000,weeks:12,openings:3,cgpa:6.5,deadline:60,start:90,skills:['TypeScript','React','Git']},
 {company:'CloudNest Solutions',title:'Cloud Engineering Intern',description:'Help automate cloud deployments, monitor services and document reliable infrastructure workflows.',location:'Kochi',mode:'remote',stipend:22000,weeks:12,openings:2,cgpa:7.0,deadline:75,start:105,skills:['AWS','Linux','Docker']},
 {company:'SecureLayer Labs',title:'Cybersecurity Intern',description:'Assist with network security reviews, vulnerability triage and practical security testing in a supervised environment.',location:'Kochi',mode:'hybrid',stipend:16000,weeks:8,openings:2,cgpa:6.5,deadline:65,start:95,skills:['Cybersecurity','Networking','Linux']},
 {company:'PixelWave Commerce',title:'Data Analyst Intern',description:'Explore business datasets, write SQL queries and build concise reports that support product decisions.',location:'Remote',mode:'remote',stipend:20000,weeks:10,openings:3,cgpa:7.0,deadline:90,start:120,skills:['Python','MySQL','Data Structures']},
 {company:'GreenGrid Energy',title:'Embedded Systems Intern',description:'Prototype and test embedded software, work with device interfaces and document system-level behaviour.',location:'Bengaluru',mode:'onsite',stipend:18000,weeks:16,openings:2,cgpa:7.5,deadline:55,start:85,skills:['C','C++','Linux']}
];
export async function ensureDemoCredentials(){
 if(process.env.DEMO_ACCOUNTS!=='true')return;
 const hash=await bcrypt.hash('password',12);
 await pool.execute("UPDATE users SET password_hash=? WHERE email IN('admin@campushire.local','student@campushire.local')",[hash]);
 for(const c of demoCompanies)await pool.execute("INSERT INTO companies(industry_id,name,website,location,description) SELECT industry_id,?,'https://example.com',?,? FROM industries WHERE name=? ON DUPLICATE KEY UPDATE location=VALUES(location),description=VALUES(description)",[c.name,c.location,c.description,c.industry]);
 for(const j of demoInternships){
  await pool.execute("INSERT INTO internships(company_id,title,description,location,work_mode,stipend,duration_weeks,openings,minimum_cgpa,application_deadline,start_date,status) SELECT c.company_id,?,?,?,?,?,?,?,?,DATE_ADD(NOW(),INTERVAL "+Number(j.deadline)+" DAY),DATE_ADD(CURDATE(),INTERVAL "+Number(j.start)+" DAY),'active' FROM companies c WHERE c.name=? AND NOT EXISTS(SELECT 1 FROM internships i WHERE i.company_id=c.company_id AND i.title=?)",[j.title,j.description,j.location,j.mode,j.stipend,j.weeks,j.openings,j.cgpa,j.company,j.title]);
  for(const skill of j.skills)await pool.execute("INSERT IGNORE INTO internship_skills(internship_id,skill_id,is_required) SELECT i.internship_id,s.skill_id,1 FROM internships i JOIN companies c ON c.company_id=i.company_id JOIN skills s ON s.name=? WHERE c.name=? AND i.title=?",[skill,j.company,j.title]);
 }
}
