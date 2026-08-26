#!/usr/bin/env python3
"""Generate deterministic synthetic full-lifecycle SQL. All generated records are explicitly synthetic."""
import random
from datetime import datetime,timedelta,date
from pathlib import Path
R=random.Random(20260826);OUT=Path(__file__).resolve().parents[1]/'database'/'generated_seed.sql'
DEPTS=[f'DEP{i:02d}' for i in range(1,21)];IND=['Software','FinTech','Consulting','Manufacturing','Healthcare','Education','Telecom','Automotive','Energy','E-commerce','Semiconductor','Analytics'];SK=[f'Skill {i:03d}' for i in range(1,121)];LOCS=['Chennai','Bengaluru','Hyderabad','Pune','Mumbai','Delhi NCR','Kochi','Coimbatore'];TITLES=['Software Engineering Intern','Backend Intern','Frontend Intern','Data Analyst Intern','Systems Intern','Mobile Intern','Cloud Intern','QA Intern','Security Intern','Product Intern']
def q(x):return "'"+str(x).replace("'","''")+"'"
def ts(x):return q(x.strftime('%Y-%m-%d %H:%M:%S'))
L=['USE campushire;','SET @campushire_bulk_seed=1;','SET FOREIGN_KEY_CHECKS=0;'];base=datetime(2025,1,1,9)
for i,d in enumerate(DEPTS,1):L.append(f"INSERT IGNORE INTO departments(department_id,code,name) VALUES({i},{q(d)},{q('Department '+str(i))});")
for i,x in enumerate(IND,1):L.append(f"INSERT IGNORE INTO industries(industry_id,name) VALUES({i},{q(x)});")
for i,x in enumerate(SK,1):L.append(f"INSERT IGNORE INTO skills(skill_id,name,category) VALUES({i},{q(x)},'Technical');")
for i in range(1,301):L.append(f"INSERT INTO companies(company_id,industry_id,name,location,description) VALUES({i},{1+i%len(IND)},{q('Campus Partner '+str(i).zfill(3))},{q(LOCS[i%len(LOCS)])},{q('Synthetic company for academic DBMS demonstration.')});")
for i in range(1,801):
 deadline=base+timedelta(days=100+i%500);start=deadline+timedelta(days=30);status='active' if deadline>datetime(2026,8,26) else 'closed';L.append(f"INSERT INTO internships(internship_id,company_id,title,description,location,work_mode,stipend,duration_weeks,openings,minimum_cgpa,application_deadline,start_date,status,created_at) VALUES({i},{1+(i*17)%300},{q(TITLES[i%10])},{q('Synthetic posting for reproducible DBMS workloads.')},{q(LOCS[i%8])},{q(['remote','onsite','hybrid'][i%3])},{10000+(i%45)*1000},{8+i%17},{1+i%6},{6+(i%25)/10:.1f},{ts(deadline)},{q(start.date())},{q(status)},{ts(deadline-timedelta(days=60))});")
 for sk in R.sample(range(1,121),R.randint(3,7)):L.append(f'INSERT INTO internship_skills VALUES({i},{sk},1);')
H='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxYzPqDgV2QxZQw5XQbL1tR0r7e'
for i in range(1,3001):
 uid=10000+i;L.append(f"INSERT INTO users(user_id,email,password_hash,role) VALUES({uid},{q('student'+str(i).zfill(4)+'@example.edu')},{q(H)},'student');");L.append(f"INSERT INTO students(student_id,user_id,registration_no,department_id,first_name,last_name,graduation_year,cgpa) VALUES({i},{uid},{q('CH'+str(i).zfill(6))},{1+i%20},'Student',{q(str(i).zfill(4))},{2026+i%4},{6+(i%40)/10:.2f});")
 for sk in R.sample(range(1,121),R.randint(3,8)):L.append(f"INSERT INTO student_skills VALUES({i},{sk},{q(R.choice(['beginner','intermediate','advanced']))});")
apps=[];seen=set()
while len(apps)<10000:
 sid=R.randint(1,3000);iid=R.randint(1,800)
 if(sid,iid)in seen:continue
 seen.add((sid,iid));deadline=base+timedelta(days=100+iid%500);applied=min(base+timedelta(days=R.randrange(420),hours=R.randrange(8)),deadline-timedelta(days=2));status=R.choices(['submitted','under_review','shortlisted','interview','rejected','offered','withdrawn'],[10,12,12,12,35,10,9])[0];apps.append((len(apps)+1,sid,iid,applied,status))
for aid,sid,iid,applied,status in apps:L.append(f"INSERT INTO applications(application_id,student_id,internship_id,status,applied_at,updated_at) VALUES({aid},{sid},{iid},{q(status)},{ts(applied)},{ts(applied+timedelta(days=12))});")
hid=1
for aid,_,_,applied,status in apps:
 stages=['submitted']+(['under_review'] if status in('under_review','shortlisted','interview','offered') else[])+(['shortlisted'] if status in('shortlisted','interview','offered') else[])+(['interview'] if status in('interview','offered') else[])+(['offered'] if status=='offered' else[])+([status] if status in('rejected','withdrawn') else[]);old=None
 for n,new in enumerate(stages):L.append(f"INSERT INTO application_status_history(history_id,application_id,old_status,new_status,changed_at,reason) VALUES({hid},{aid},{'NULL' if old is None else q(old)},{q(new)},{ts(applied+timedelta(days=n*3))},'Synthetic lifecycle transition');");hid+=1;old=new
interview_apps=[x for x in apps if x[4] in('interview','offered')][:3000]
for j,(aid,_,_,applied,status) in enumerate(interview_apps,1):L.append(f"INSERT INTO interviews(interview_id,application_id,round_no,scheduled_at,mode,result) VALUES({j},{aid},1,{ts(applied+timedelta(days=10))},{q(['online','onsite','phone'][j%3])},{q('passed' if status=='offered' else R.choice(['pending','passed','failed']))});")
offer_apps=[x for x in apps if x[4]=='offered'][:1200]
for j,(aid,_,_,applied,_) in enumerate(offer_apps,1):
 offered=applied+timedelta(days=18);status='accepted' if j<=650 else R.choice(['rejected','pending']);responded='NULL' if status=='pending' else ts(offered+timedelta(days=2));L.append(f"INSERT INTO offers(offer_id,application_id,offered_at,response_deadline,stipend,status,responded_at) VALUES({j},{aid},{ts(offered)},{ts(offered+timedelta(days=10))},{18000+(j%40)*1000},{q(status)},{responded});")
for j in range(1,min(651,len(offer_apps)+1)):
 start=date(2025,7,1)+timedelta(days=j%120);completed=j<=500;end=start+timedelta(days=84) if completed else None;L.append(f"INSERT INTO internship_records(record_id,offer_id,start_date,end_date,status) VALUES({j},{j},{q(start)},{'NULL' if end is None else q(end)},{q('completed' if completed else 'ongoing')});")
 if completed:L.append(f"INSERT INTO evaluations(record_id,score,feedback,evaluated_at) VALUES({j},{6+(j%40)/10:.2f},'Synthetic post-internship evaluation.',{ts(datetime.combine(end,datetime.min.time())+timedelta(days=2))});")
L+=['SET FOREIGN_KEY_CHECKS=1;','SET @campushire_bulk_seed=0;'];OUT.write_text('\n'.join(L)+'\n',encoding='utf-8');print(f'Wrote {OUT}: departments=20 skills=120 companies=300 internships=800 students=3000 applications=10000 interviews={len(interview_apps)} offers={len(offer_apps)} records={min(650,len(offer_apps))} evaluations={min(500,len(offer_apps))}')
