#!/usr/bin/env python3
"""Deterministic relational seed generator for CampusHire."""
import random
from datetime import date, timedelta
from pathlib import Path
random.seed(20260826)
OUT=Path(__file__).resolve().parents[1]/'database'/'generated_seed.sql'
DEPTS=['CSE','ECE','EEE','MECH','CIVIL','IT','AIML','DS','BME','CHEM','AUTO','AERO','BIOTECH','MATH','PHYS','MBA','DES','ARCH','LAW','COMM']
INDUSTRIES=['Software','FinTech','Consulting','Manufacturing','Healthcare','Education','Telecom','Automotive','Energy','E-commerce']
SKILLS=['C','C++','Python','Java','JavaScript','TypeScript','React','Node.js','Express','MySQL','PostgreSQL','Git','Docker','Linux','AWS','Azure','Kotlin','Android','HTML','CSS','REST APIs','Data Structures','Algorithms','Networking','Cybersecurity','Machine Learning','Pandas','NumPy','Power BI','Figma']
COMPANY_WORDS=['Nova','Vertex','Orbit','Nimbus','Apex','Quantum','Blue','Cobalt','Pixel','Vector','Helix','Atlas','Fusion','Nexa','Core','Delta','Lumen','Prime','Terra','Zenith']

def q(v): return "'"+str(v).replace("'","''")+"'"
lines=['USE campushire;','SET FOREIGN_KEY_CHECKS=0;']
for n,d in enumerate(DEPTS,1): lines.append(f"INSERT INTO departments(code,name) VALUES({q(d)},{q(d+' Department')});")
for x in INDUSTRIES: lines.append(f"INSERT INTO industries(name) VALUES({q(x)});")
for s in SKILLS: lines.append(f"INSERT INTO skills(name,category) VALUES({q(s)},{q('Technical')});")
for i in range(1,201):
    name=f'{COMPANY_WORDS[(i-1)%len(COMPANY_WORDS)]} {"Labs" if i%3 else "Systems"} {i}'
    lines.append(f"INSERT INTO companies(industry_id,name,location,description) VALUES({1+(i%len(INDUSTRIES))},{q(name)},{q(['Chennai','Bengaluru','Hyderabad','Pune','Mumbai','Delhi NCR'][i%6])},{q('Synthetic company generated for academic demonstration.')});")
# Password hashes are intentionally not generated here: application/demo-user seeding should use bcrypt.
for i in range(1,501):
    company=1+(i*17)%200; title=['Software Engineering Intern','Backend Intern','Frontend Intern','Data Intern','Systems Intern','Mobile Intern'][i%6]; loc=['Chennai','Bengaluru','Hyderabad','Pune','Remote'][i%5]; mode=['onsite','hybrid','remote'][i%3]; deadline=date.today()+timedelta(days=15+(i%180)); stipend=8000+(i%35)*1000
    lines.append(f"INSERT INTO internships(company_id,title,description,location,work_mode,stipend,duration_weeks,openings,minimum_cgpa,application_deadline,status) VALUES({company},{q(title)},{q('Synthetic internship posting for reproducible DBMS testing.')},{q(loc)},{q(mode)},{stipend},{8+i%17},{1+i%5},{6+(i%20)/10:.1f},{q(deadline.isoformat()+' 23:59:59')},'active');")
    for sid in random.sample(range(1,len(SKILLS)+1),random.randint(2,6)): lines.append(f'INSERT IGNORE INTO internship_skills(internship_id,skill_id,is_required) VALUES({i},{sid},1);')
lines.append('SET FOREIGN_KEY_CHECKS=1;')
OUT.write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(f'Wrote {OUT}')
