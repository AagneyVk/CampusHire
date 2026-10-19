import {Router} from 'express';
import {pool} from '../db.js';
import {asyncRoute} from '../middleware/auth.js';

const r=Router();
const sortOptions={
 deadline:'i.application_deadline ASC',
 newest:'i.created_at DESC',
 stipend_high:'i.stipend DESC',
 stipend_low:'i.stipend ASC'
};

r.get('/',asyncRoute(async(q,s)=>{
 const page=Math.max(1,Number.parseInt(q.query.page,10)||1);
 const limit=Math.min(50,Math.max(1,Number.parseInt(q.query.limit,10)||12));
 const off=(page-1)*limit;
 const w=["i.status='active'","i.application_deadline>NOW()"],p=[];

 if(q.query.location?.trim()){
  w.push('i.location LIKE ?');
  p.push(`%${q.query.location.trim()}%`);
 }
 if(['remote','onsite','hybrid'].includes(q.query.mode)){
  w.push('i.work_mode=?');
  p.push(q.query.mode);
 }
 if(q.query.company?.trim()){
  w.push('c.name LIKE ?');
  p.push(`%${q.query.company.trim()}%`);
 }
 if(q.query.minStipend!==undefined&&q.query.minStipend!==''){
  const minimum=Number(q.query.minStipend);
  if(!Number.isFinite(minimum)||minimum<0)return s.status(400).json({error:'Minimum stipend must be a non-negative number'});
  w.push('i.stipend>=?');
  p.push(minimum);
 }
 if(q.query.q?.trim()){
  const term=`%${q.query.q.trim()}%`;
  w.push('(i.title LIKE ? OR i.description LIKE ? OR c.name LIKE ?)');
  p.push(term,term,term);
 }
 if(q.query.skill?.trim()){
  w.push('EXISTS(SELECT 1 FROM internship_skills x JOIN skills sk ON sk.skill_id=x.skill_id WHERE x.internship_id=i.internship_id AND sk.name=?)');
  p.push(q.query.skill.trim());
 }
 const where=w.join(' AND ');
 const sort=sortOptions[q.query.sort]||sortOptions.deadline;
 const[[count]]=await pool.execute(`SELECT COUNT(*) total FROM internships i JOIN companies c ON c.company_id=i.company_id WHERE ${where}`,p);
 const[data]=await pool.execute(`SELECT i.*,c.name company,ind.name industry,
  (SELECT GROUP_CONCAT(DISTINCT sk.name ORDER BY sk.name SEPARATOR ', ')
   FROM internship_skills x JOIN skills sk ON sk.skill_id=x.skill_id
   WHERE x.internship_id=i.internship_id) AS skills
  FROM internships i
  JOIN companies c ON c.company_id=i.company_id
  JOIN industries ind ON ind.industry_id=c.industry_id
  WHERE ${where}
  ORDER BY ${sort},i.internship_id ASC
  LIMIT ? OFFSET ?`,[...p,limit,off]);
 s.json({data,page,limit,total:count.total,pages:Math.ceil(count.total/limit)});
}));

r.get('/:id',asyncRoute(async(q,s)=>{
 if(!/^\\d+$/.test(q.params.id))return s.status(400).json({error:'Invalid internship id'});
 const[rows]=await pool.execute('SELECT i.*,c.name company,c.website,ind.name industry FROM internships i JOIN companies c ON c.company_id=i.company_id JOIN industries ind ON ind.industry_id=c.industry_id WHERE i.internship_id=?',[q.params.id]);
 if(!rows[0])return s.status(404).json({error:'Internship not found'});
 const[skills]=await pool.execute('SELECT sk.skill_id,sk.name,x.is_required FROM internship_skills x JOIN skills sk ON sk.skill_id=x.skill_id WHERE x.internship_id=?',[q.params.id]);
 s.json({...rows[0],skills});
}));

export default r;
