import React,{useEffect,useState}from'react';
import{Link}from'react-router-dom';
import{Search,MapPin,CalendarClock,ArrowUpRight,RotateCcw}from'lucide-react';
import Layout from'../components/Layout.jsx';
import{api}from'../services/api.js';
import{LoadingState,ErrorState,EmptyState}from'../components/UI.jsx';

const PAGE_SIZE=12;
const SORT_OPTIONS=[
 {value:'deadline',label:'Deadline: soonest'},
 {value:'newest',label:'Newest first'},
 {value:'stipend_high',label:'Highest stipend'},
 {value:'stipend_low',label:'Lowest stipend'}
];
const dateLabel=value=>{
 if(!value)return 'Not specified';
 const date=new Date(String(value).replace(' ','T'));
 return Number.isNaN(date.getTime())?'Not specified':date.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
};
const money=value=>'₹'+Number(value||0).toLocaleString('en-IN');

export default function Internships(){
 const[data,setData]=useState([]),[q,setQ]=useState(''),[location,setLocation]=useState(''),[mode,setMode]=useState(''),[skill,setSkill]=useState(''),[minStipend,setMinStipend]=useState(''),[sort,setSort]=useState('deadline'),[page,setPage]=useState(1),[pages,setPages]=useState(1),[total,setTotal]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState(''),[skills,setSkills]=useState([]),[skillsError,setSkillsError]=useState('');

 useEffect(()=>{api('/meta').then(x=>setSkills(x.skills||[])).catch(e=>setSkillsError(e.message))},[]);

 useEffect(()=>{
  const controller=new AbortController();
  const params=new URLSearchParams({page:String(page),limit:String(PAGE_SIZE),sort});
  if(q.trim())params.set('q',q.trim());
  if(location.trim())params.set('location',location.trim());
  if(mode)params.set('mode',mode);
  if(skill)params.set('skill',skill);
  if(minStipend!=='')params.set('minStipend',minStipend);
  setLoading(true);setError('');
  api('/internships?'+params.toString(),{signal:controller.signal})
   .then(x=>{setData(x.data||[]);setPages(x.pages||0);setTotal(Number(x.total)||0)})
   .catch(e=>{if(e.name!=='AbortError')setError(e.message)})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[q,location,mode,skill,minStipend,sort,page]);

 const filtersActive=Boolean(q.trim()||location.trim()||mode||skill||minStipend!==''||sort!=='deadline');
 function clearFilters(){setQ('');setLocation('');setMode('');setSkill('');setMinStipend('');setSort('deadline');setPage(1)}
 function setFilter(setter,value){setter(value);setPage(1)}

 return <Layout><main className="page internships-page">
  <span className="eyebrow">OPPORTUNITIES</span>
  <h1>Find your next internship.</h1>
  <p className="internships-intro">Explore opportunities by role, location, skills and stipend. Open a listing to review its details and apply.</p>

  <section className="internship-toolbar" aria-label="Internship search and filters">
   <div className="filterbar internship-search-row">
    <div className="search internship-keyword-search"><Search size={18} aria-hidden="true"/><input aria-label="Search internships" type="search" value={q} onChange={e=>setFilter(setQ,e.target.value)} placeholder="Search roles, descriptions or companies"/></div>
    <label className="filter-control top-filter">Work mode<select aria-label="Filter by work mode" value={mode} onChange={e=>setFilter(setMode,e.target.value)}><option value="">All modes</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label>
    <label className="filter-control top-filter">Sort by<select aria-label="Sort internships" value={sort} onChange={e=>setFilter(setSort,e.target.value)}>{SORT_OPTIONS.map(o=><option value={o.value} key={o.value}>{o.label}</option>)}</select></label>
   </div>
   <div className="internship-extra-filters">
    <label className="filter-control">Location<input aria-label="Filter by location" type="search" value={location} onChange={e=>setFilter(setLocation,e.target.value)} placeholder="e.g. Chennai, Kochi"/></label>
    <label className="filter-control">Required skill<select aria-label="Filter by skill" value={skill} onChange={e=>setFilter(setSkill,e.target.value)} disabled={!skills.length}><option value="">All skills</option>{skills.map(s=><option value={s.name} key={s.skill_id}>{s.name}</option>)}</select></label>
    <label className="filter-control">Minimum monthly stipend<input aria-label="Minimum monthly stipend" type="number" min="0" step="500" value={minStipend} onChange={e=>setFilter(setMinStipend,e.target.value)} placeholder="Any amount"/></label>
    <div className="filter-actions"><button type="button" className="clear-filters" onClick={clearFilters} disabled={!filtersActive}><RotateCcw size={15}/>Clear filters</button></div>
   </div>
   {skillsError&&<p className="filter-hint">Skill options couldn't be loaded. Keyword, location and other filters are still available.</p>}
  </section>

  <div className="results-header" aria-live="polite">
   <p>{loading?'Updating opportunities…':<><strong>{total.toLocaleString('en-IN')}</strong> {total===1?'opportunity':'opportunities'} found{filtersActive?' for your search':''}</>}</p>
   {!loading&&total>0&&<span className="results-range">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,total)} of {total.toLocaleString('en-IN')}</span>}
  </div>

  {loading?<LoadingState/>:error?<ErrorState message={error}/>:data.length?
   <div className="grid internship-grid">{data.map(job=>{
    const tags=String(job.skills||'').split(',').map(s=>s.trim()).filter(Boolean);
    return <Link className="job internship-card" to={`/internships/${job.internship_id}`} key={job.internship_id}>
     <div className="internship-card-top"><span className="job-company">{job.company}</span><span className="work-mode-pill">{job.work_mode}</span></div>
     <h2>{job.title}</h2>
     <p className="internship-description">{job.description||'Explore the opportunity details to learn more about this role.'}</p>
     <div className="internship-tags">{tags.slice(0,4).map(tag=><span className="internship-tag" key={tag}>{tag}</span>)}{tags.length>4&&<span className="internship-tag tag-more">+{tags.length-4}</span>}</div>
     <div className="internship-card-metrics">
      <div><span>Monthly stipend</span><strong>{money(job.stipend)}</strong></div>
      <div><span>Duration</span><strong>{job.duration_weeks} weeks</strong></div>
      <div><span>Minimum CGPA</span><strong>{job.minimum_cgpa==null?'Not specified':Number(job.minimum_cgpa).toFixed(1)}</strong></div>
      <div><span>Openings</span><strong>{job.openings}</strong></div>
     </div>
     <div className="internship-card-footer"><span><MapPin size={14}/>{job.location}</span><span><CalendarClock size={14}/>Apply by {dateLabel(job.application_deadline)}</span><span className="view-opportunity">View details <ArrowUpRight size={15}/></span></div>
    </Link>
   })}</div>
   :<section className="internship-empty"><EmptyState>No matching internships found.</EmptyState><p>Try a different keyword or remove one or more filters to see more opportunities.</p><button type="button" className="clear-filters" onClick={clearFilters} disabled={!filtersActive}><RotateCcw size={15}/>Clear all filters</button></section>}

  {!loading&&!error&&total>0&&<nav className="pagination internship-pagination" aria-label="Internship result pages"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page} of {pages||1}</span><button disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button></nav>}
 </main></Layout>
}