import React,{useEffect,useMemo,useState}from'react';
import{Edit3,Pause,Play,X,Save,Users}from'lucide-react';
import Layout from'../../components/Layout.jsx';
import{api}from'../../services/api.js';
import{StatCard,DataTable,LoadingState,ErrorState,EmptyState,StatusBadge}from'../../components/UI.jsx';

const blankForm={companyId:'',title:'',description:'',location:'',workMode:'remote',stipend:'0',durationWeeks:'12',openings:'1',minimumCgpa:'',applicationDeadline:'',startDate:'',status:'active'};
const nextApplicationStatuses={
 submitted:['under_review','rejected','withdrawn'],
 under_review:['shortlisted','rejected','withdrawn'],
 shortlisted:['interview','rejected','withdrawn'],
 interview:['offered','rejected','withdrawn'],
 offered:[],accepted:[],rejected:[],withdrawn:[]
};
const statusLabel=s=>String(s||'').replaceAll('_',' ');
const money=v=>'₹'+Number(v||0).toLocaleString('en-IN');
const dateLabel=v=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})};
const dateTimeInput=v=>{if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v).replace(' ','T').slice(0,16);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)};
const isDeadlineOpen=v=>{const d=new Date(v);return !Number.isNaN(d.getTime())&&d.getTime()>Date.now()};

function TrendPanel({title,items=[]}){
 const points=items.slice(-6),max=Math.max(1,...points.map(p=>Number(p.value)||0));
 return <section className="trend-panel"><div className="trend-heading"><h2>{title}</h2><span>Last {points.length} months</span></div>{points.length?<div className="trend-rows">{points.map(p=>{const value=Number(p.value)||0;return <div className="trend-row" key={p.month}><span className="trend-month">{p.month}</span><div className="trend-track"><span style={{width:value?Math.max(3,value/max*100)+'%':'0%'}}/></div><strong>{value.toLocaleString('en-IN')}</strong></div>})}</div>:<EmptyState>No trend data available yet.</EmptyState>}</section>
}

export default function AdminDashboard(){
 const[x,setX]=useState(),[resource,setResource]=useState('applications'),[rows,setRows]=useState([]),[error,setError]=useState(''),[recordsError,setRecordsError]=useState(''),[recordsLoading,setRecordsLoading]=useState(false);
 const[companies,setCompanies]=useState([]),[form,setForm]=useState(blankForm),[posting,setPosting]=useState(false),[postError,setPostError]=useState(''),[success,setSuccess]=useState(''),[editingId,setEditingId]=useState(null);
 const[internshipStatusFilter,setInternshipStatusFilter]=useState('all'),[applicationStatusFilter,setApplicationStatusFilter]=useState('all'),[applicationSearch,setApplicationSearch]=useState(''),[applicationInternshipFilter,setApplicationInternshipFilter]=useState('all'),[nextStatuses,setNextStatuses]=useState({}),[applicationSaving,setApplicationSaving]=useState(null),[managementMessage,setManagementMessage]=useState(''),[managementError,setManagementError]=useState('');

 useEffect(()=>{let alive=true;api('/admin/analytics').then(v=>{if(alive)setX(v)}).catch(e=>{if(alive)setError(e.message)});return()=>{alive=false}},[]);
 useEffect(()=>{let alive=true;setRecordsLoading(true);setRecordsError('');api('/admin/'+resource).then(v=>{if(alive)setRows(v)}).catch(e=>{if(alive){setRecordsError(e.message);setRows([])}}).finally(()=>{if(alive)setRecordsLoading(false)});return()=>{alive=false}},[resource]);
 useEffect(()=>{let alive=true;api('/admin/companies').then(v=>{if(alive){setCompanies(v);if(v.length)setForm(current=>current.companyId?current:{...current,companyId:String(v[0].company_id)})}}).catch(e=>{if(alive)setPostError(e.message)});return()=>{alive=false}},[]);

 const change=e=>setForm(current=>({...current,[e.target.name]:e.target.value}));
 async function refreshRows(which=resource){const v=await api('/admin/'+which);setRows(v);setRecordsError('');return v}
 function clearPostForm(){setEditingId(null);setForm({...blankForm,companyId:companies.length?String(companies[0].company_id):''});setPostError('');setSuccess('')}
 function beginEdit(job){
  setEditingId(job.internship_id);
  setForm({companyId:String(job.company_id),title:job.title||'',description:job.description||'',location:job.location||'',workMode:job.work_mode||'remote',stipend:String(job.stipend??0),durationWeeks:String(job.duration_weeks??12),openings:String(job.openings??1),minimumCgpa:job.minimum_cgpa==null?'':String(job.minimum_cgpa),applicationDeadline:dateTimeInput(job.application_deadline),startDate:job.start_date?String(job.start_date).slice(0,10):'',status:job.status||'active'});
  setPostError('');setSuccess('');document.getElementById('internship-editor')?.scrollIntoView({behavior:'smooth',block:'start'});
 }
 async function submitInternship(e){
  e.preventDefault();setPosting(true);setPostError('');setSuccess('');
  try{
   if(!form.companyId)throw new Error('Select a company before saving.');
   if(!form.applicationDeadline)throw new Error('Set an application deadline.');
   const deadline=form.applicationDeadline.length===16?form.applicationDeadline.replace('T',' ')+':00':form.applicationDeadline.replace('T',' ');
   const payload={...form,companyId:Number(form.companyId),stipend:Number(form.stipend),durationWeeks:Number(form.durationWeeks),openings:Number(form.openings),minimumCgpa:form.minimumCgpa===''?null:Number(form.minimumCgpa),applicationDeadline:deadline,startDate:form.startDate||null};
   const result=await api(editingId?'/admin/internships/'+editingId:'/admin/internships',{method:editingId?'PATCH':'POST',body:JSON.stringify(payload)});
   setSuccess(editingId?'Internship updated successfully.':'Internship posted successfully. ID: '+result.internshipId);
   setEditingId(null);setForm({...blankForm,companyId:form.companyId});setResource('internships');await refreshRows('internships');
  }catch(e){setPostError(e.message)}finally{setPosting(false)}
 }
 async function toggleInternship(job){
  const next=job.status==='active'?'closed':'active';
  if(next==='closed'&&!window.confirm('Close applications for "'+job.title+'"? Students will no longer be able to apply.'))return;
  if(next==='active'&&!isDeadlineOpen(job.application_deadline)){setManagementError('This deadline has passed. Edit the internship deadline before reopening it.');return}
  setManagementError('');setManagementMessage('');
  try{await api('/admin/internships/'+job.internship_id+'/status',{method:'PATCH',body:JSON.stringify({status:next})});setManagementMessage('"'+job.title+'" is now '+statusLabel(next)+'.');await refreshRows('internships')}
  catch(e){setManagementError(e.message)}
 }
 const visibleInternships=useMemo(()=>resource!=='internships'?[]:rows.filter(j=>internshipStatusFilter==='all'||j.status===internshipStatusFilter),[rows,resource,internshipStatusFilter]);
 const visibleApplications=useMemo(()=>{
  if(resource!=='applications')return[];
  const q=applicationSearch.trim().toLowerCase();
  return rows.filter(a=>(applicationStatusFilter==='all'||a.status===applicationStatusFilter)&&(applicationInternshipFilter==='all'||String(a.internship_id)===applicationInternshipFilter)&&(!q||[a.student_name,a.student_email,a.registration_no,a.internship_title,a.company].some(v=>String(v||'').toLowerCase().includes(q))));
 },[rows,resource,applicationStatusFilter,applicationInternshipFilter,applicationSearch]);
 async function updateApplication(a){
  const next=nextStatuses[a.application_id];
  if(!next)return;
  setApplicationSaving(a.application_id);setManagementError('');setManagementMessage('');
  try{await api('/admin/applications/'+a.application_id+'/status',{method:'PATCH',body:JSON.stringify({status:next,reason:'Updated by placement admin'})});setManagementMessage('Application status updated for '+(a.student_name||a.student_email)+'.');setNextStatuses(v=>({...v,[a.application_id]:''}));await refreshRows('applications')}
  catch(e){setManagementError(e.message)}finally{setApplicationSaving(null)}
 }
 if(error&&!x)return <Layout><main className="page"><ErrorState message={error}/></main></Layout>;

 return <Layout><main className="page admin-page">
  <span className="eyebrow">PLACEMENT CELL</span><h1>Admin dashboard</h1>
  {!x?<LoadingState/>:<>
   <div className="stats">{Object.entries(x.totals).map(([k,v])=><StatCard key={k} label={k.replaceAll(/([A-Z])/g,' $1')} value={k==='placementRate'?v+'%':v}/>)}</div>
   <section className="analytics-grid admin-analytics"><div><h2>Application funnel</h2><DataTable data={[x.funnel]}/></div><div><h2>Top demanded skills</h2><DataTable data={x.skills}/></div><div><h2>Top recruiting companies</h2><DataTable data={x.companies}/></div><div><h2>Department performance</h2><DataTable data={x.departments}/></div></section>
   <section className="admin-trends"><TrendPanel title="Applications over time" items={x.applicationTrend||[]}/><TrendPanel title="Offers over time" items={x.offerTrend||[]}/></section>
  </>}

  <section className="panel post-panel" id="internship-editor">
   <div className="post-panel-header"><span className="eyebrow">ADMIN ACTION</span><h2>{editingId?'Edit internship':'Post an internship'}</h2><p>{editingId?'Update the posting details. Changes are saved to the database.':'Add an opportunity for students. Active posts appear in listings until their deadline.'}</p></div>
   <form className="post-form" onSubmit={submitInternship}><div className="form-grid">
    <label>Company<select name="companyId" value={form.companyId} onChange={change} required><option value="">Select a company</option>{companies.map(c=><option value={c.company_id} key={c.company_id}>{c.name}</option>)}</select></label>
    <label>Internship title<input name="title" value={form.title} onChange={change} placeholder="e.g. Software Engineering Intern" maxLength="180" required/></label>
    <label className="wide-field">Description<textarea name="description" value={form.description} onChange={change} placeholder="Responsibilities, expected work and requirements" maxLength="10000" required/></label>
    <label>Location<input name="location" value={form.location} onChange={change} placeholder="e.g. Chennai or Remote" maxLength="160" required/></label>
    <label>Work mode<select name="workMode" value={form.workMode} onChange={change} required><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label>
    <label>Monthly stipend (₹)<input type="number" name="stipend" min="0" step="100" value={form.stipend} onChange={change} required/></label>
    <label>Duration (weeks)<input type="number" name="durationWeeks" min="1" max="104" step="1" value={form.durationWeeks} onChange={change} required/></label>
    <label>Number of openings<input type="number" name="openings" min="1" max="10000" step="1" value={form.openings} onChange={change} required/></label>
    <label>Minimum CGPA <span className="field-hint">(optional)</span><input type="number" name="minimumCgpa" min="0" max="10" step="0.01" value={form.minimumCgpa} onChange={change} placeholder="No minimum"/></label>
    <label>Application deadline<input type="datetime-local" name="applicationDeadline" value={form.applicationDeadline} onChange={change} required/></label>
    <label>Expected start date <span className="field-hint">(optional)</span><input type="date" name="startDate" value={form.startDate} onChange={change}/></label>
    <label>Posting status<select name="status" value={form.status} onChange={change}><option value="active">Published / active</option><option value="draft">Draft</option><option value="closed">Closed</option><option value="cancelled">Cancelled</option></select></label>
   </div>
   {postError&&<div className="form-alert error" role="alert">{postError}</div>}{success&&<div className="form-alert success" role="status">{success}</div>}
   <div className="post-form-footer"><p className="field-hint">Reopening a posting requires a future application deadline.</p><div className="editor-actions"><button type="submit" disabled={posting||!companies.length}><Save size={15}/>{posting?'Saving…':editingId?'Save changes':'Post internship'}</button>{editingId&&<button className="admin-secondary-button" type="button" onClick={clearPostForm}><X size={15}/>Cancel edit</button>}</div></div>
   </form>
  </section>

  <section className="admin-records">
   <div className="admin-section-heading"><div><span className="eyebrow">DATABASE MANAGEMENT</span><h2>Manage records</h2></div><span className="record-count">{recordsLoading?'Loading…':rows.length+' records'}</span></div>
   <div className="tabs admin-tabs">{['students','companies','internships','applications','interviews','offers','records','evaluations'].map(v=><button className={resource===v?'active':''} onClick={()=>{setResource(v);setManagementError('');setManagementMessage('')}} key={v}>{v}</button>)}</div>
   {managementError&&<div className="form-alert error" role="alert">{managementError}</div>}
   {managementMessage&&<div className="form-alert success" role="status">{managementMessage}</div>}
   {recordsError&&<ErrorState message={recordsError}/>}
   {recordsLoading?<LoadingState/>:resource==='internships'?
    <section className="management-panel">
     <div className="management-toolbar"><label className="filter-control">Posting status<select value={internshipStatusFilter} onChange={e=>setInternshipStatusFilter(e.target.value)}><option value="all">All postings</option><option value="active">Active</option><option value="draft">Draft</option><option value="closed">Closed</option><option value="cancelled">Cancelled</option></select></label><p>{visibleInternships.length} matching postings</p></div>
     {!visibleInternships.length?<EmptyState>No postings match this status.</EmptyState>:<div className="tablewrap admin-management-table"><table><thead><tr><th>Internship</th><th>Company</th><th>Stipend</th><th>Deadline</th><th>Applications</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleInternships.map(job=>{const active=job.status==='active',canReopen=isDeadlineOpen(job.application_deadline);return <tr key={job.internship_id}><td><strong>{job.title}</strong><small className="table-subtext">ID #{job.internship_id} · {job.location} · {job.work_mode}</small></td><td>{job.company_name}</td><td>{money(job.stipend)}</td><td>{dateLabel(job.application_deadline)}</td><td><span className="application-count"><Users size={14}/>{job.application_count||0}</span></td><td><StatusBadge value={job.status}/></td><td><div className="admin-row-actions"><button type="button" className="admin-secondary-button" onClick={()=>beginEdit(job)}><Edit3 size={14}/>Edit</button>{active?<button type="button" className="admin-secondary-button close-posting" onClick={()=>toggleInternship(job)}><Pause size={14}/>Close</button>:<button type="button" className="admin-secondary-button" disabled={!canReopen} title={canReopen?'Publish or reopen this posting':'Edit the deadline before reopening'} onClick={()=>toggleInternship(job)}><Play size={14}/>{job.status==='draft'?'Publish':'Reopen'}</button>}</div></td></tr>})}</tbody></table></div>}
    </section>
    :resource==='applications'?
    <section className="management-panel">
     <div className="application-review-toolbar"><label className="filter-control application-review-search">Search applicants<input type="search" value={applicationSearch} onChange={e=>setApplicationSearch(e.target.value)} placeholder="Name, email, registration, role…"/></label><label className="filter-control">Application status<select value={applicationStatusFilter} onChange={e=>setApplicationStatusFilter(e.target.value)}><option value="all">All statuses</option>{['submitted','under_review','shortlisted','interview','offered','rejected','withdrawn'].map(v=><option key={v} value={v}>{statusLabel(v)}</option>)}</select></label><label className="filter-control">Internship<select value={applicationInternshipFilter} onChange={e=>setApplicationInternshipFilter(e.target.value)}><option value="all">All internships</option>{[...new Map(rows.filter(a=>a.internship_id).map(a=>[String(a.internship_id),{id:String(a.internship_id),title:a.internship_title,company:a.company}])).values()].map(v=><option value={v.id} key={v.id}>{v.title} — {v.company}</option>)}</select></label></div>
     <p className="application-review-count">{visibleApplications.length} applicants shown{rows.length===500?' · Showing most recent 500 records':''}</p>
     {!visibleApplications.length?<EmptyState>No applicants match these filters.</EmptyState>:<div className="admin-applicant-list">{visibleApplications.map(a=>{const allowed=nextApplicationStatuses[a.status]||[];return <article className="applicant-card" key={a.application_id}>
      <div className="applicant-main"><div className="applicant-initial">{String(a.student_name||a.student_email||'?').trim().charAt(0).toUpperCase()}</div><div className="applicant-identity"><h3>{a.student_name||'Unnamed student'}</h3><p>{a.student_email} · {a.registration_no||'No registration number'}</p><div className="applicant-tags"><span>{a.internship_title}</span><span>{a.company}</span><span>CGPA {a.cgpa==null?'—':Number(a.cgpa).toFixed(2)}</span></div></div><div className="applicant-status"><StatusBadge value={a.status}/><small>Applied {dateLabel(a.applied_at)}</small></div></div>
      {a.cover_letter&&<details className="cover-letter-details"><summary>View cover letter</summary><p>{a.cover_letter}</p></details>}
      <div className="applicant-actions"><label className="filter-control">Next status<select aria-label={'Next status for '+(a.student_name||a.student_email)} value={nextStatuses[a.application_id]||''} onChange={e=>setNextStatuses(v=>({...v,[a.application_id]:e.target.value}))} disabled={!allowed.length||applicationSaving===a.application_id}><option value="">{allowed.length?'Select a transition':'No further transitions'}</option>{allowed.map(s=><option key={s} value={s}>{statusLabel(s)}</option>)}</select></label><button type="button" disabled={!nextStatuses[a.application_id]||applicationSaving===a.application_id} onClick={()=>updateApplication(a)}><Save size={14}/>{applicationSaving===a.application_id?'Updating…':'Update status'}</button></div>
     </article>})}</div>}
    </section>
    :<DataTable data={rows}/>}
  </section>
 </main></Layout>
}