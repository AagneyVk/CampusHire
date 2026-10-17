import React,{useEffect,useState}from'react';import Layout from'../../components/Layout.jsx';import{api}from'../../services/api.js';import{StatCard,DataTable,LoadingState,ErrorState}from'../../components/UI.jsx';
const blankForm={companyId:'',title:'',description:'',location:'',workMode:'remote',stipend:'0',durationWeeks:'12',openings:'1',minimumCgpa:'',applicationDeadline:'',startDate:'',status:'active'};
export default function AdminDashboard(){
 const[x,setX]=useState(),[resource,setResource]=useState('applications'),[rows,setRows]=useState([]),[error,setError]=useState(''),[companies,setCompanies]=useState([]),[form,setForm]=useState(blankForm),[posting,setPosting]=useState(false),[postError,setPostError]=useState(''),[success,setSuccess]=useState('');
 useEffect(()=>{api('/admin/analytics').then(setX).catch(e=>setError(e.message))},[]);
 useEffect(()=>{api('/admin/'+resource).then(setRows).catch(e=>setError(e.message))},[resource]);
 useEffect(()=>{api('/admin/companies').then(v=>{setCompanies(v);if(v.length)setForm(f=>({...f,companyId:String(v[0].company_id)}))}).catch(e=>setPostError(e.message))},[]);
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 async function postInternship(e){e.preventDefault();setPosting(true);setPostError('');setSuccess('');try{const payload={...form,companyId:Number(form.companyId),stipend:Number(form.stipend),durationWeeks:Number(form.durationWeeks),openings:Number(form.openings),minimumCgpa:form.minimumCgpa===''?null:Number(form.minimumCgpa),applicationDeadline:form.applicationDeadline.replace('T',' '),startDate:form.startDate||null};const created=await api('/admin/internships',{method:'POST',body:JSON.stringify(payload)});setSuccess('Internship posted successfully. ID: '+created.internshipId);setForm({...blankForm,companyId:form.companyId});setResource('internships');try{setRows(await api('/admin/internships'))}catch(err){setPostError('Posted successfully, but the records list could not be refreshed: '+err.message)}}catch(err){setPostError(err.message)}finally{setPosting(false)}}
 if(error&&!x)return <Layout><main className="page"><ErrorState message={error}/></main></Layout>;
 return <Layout><main className="page"><span className="eyebrow">PLACEMENT CELL</span><h1>Admin dashboard</h1>{!x?<LoadingState/>:<><div className="stats">{Object.entries(x.totals).map(([k,v])=><StatCard key={k} label={k} value={v}/>)}</div><section className="analytics-grid"><div><h2>Application funnel</h2><DataTable data={[x.funnel]}/></div><div><h2>Top demanded skills</h2><DataTable data={x.skills}/></div><div><h2>Top recruiting companies</h2><DataTable data={x.companies}/></div><div><h2>Department performance</h2><DataTable data={x.departments}/></div></section></>}
 <section className="panel post-panel"><div className="post-panel-header"><span className="eyebrow">ADMIN ACTION</span><h2>Post an internship</h2><p>Add a new opportunity for students. Active posts appear in the public internship listings until their deadline.</p></div>
 <form className="post-form" onSubmit={postInternship}><div className="form-grid">
 <label>Company<select name="companyId" value={form.companyId} onChange={change} required><option value="">Select a company</option>{companies.map(c=><option value={c.company_id} key={c.company_id}>{c.name}</option>)}</select></label>
 <label>Internship title<input name="title" value={form.title} onChange={change} placeholder="e.g. Software Engineering Intern" maxLength="180" required/></label>
 <label className="wide-field">Description<textarea name="description" value={form.description} onChange={change} placeholder="Responsibilities, expected work and requirements" maxLength="5000" required/></label>
 <label>Location<input name="location" value={form.location} onChange={change} placeholder="e.g. Chennai or Remote" maxLength="160" required/></label>
 <label>Work mode<select name="workMode" value={form.workMode} onChange={change} required><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label>
 <label>Monthly stipend (₹)<input type="number" name="stipend" min="0" step="100" value={form.stipend} onChange={change} required/></label>
 <label>Duration (weeks)<input type="number" name="durationWeeks" min="1" max="104" value={form.durationWeeks} onChange={change} required/></label>
 <label>Number of openings<input type="number" name="openings" min="1" max="10000" value={form.openings} onChange={change} required/></label>
 <label>Minimum CGPA <span className="field-hint">(optional)</span><input type="number" name="minimumCgpa" min="0" max="10" step="0.01" value={form.minimumCgpa} onChange={change} placeholder="No minimum"/></label>
 <label>Application deadline<input type="datetime-local" name="applicationDeadline" value={form.applicationDeadline} onChange={change} required/></label>
 <label>Expected start date <span className="field-hint">(optional)</span><input type="date" name="startDate" value={form.startDate} onChange={change}/></label>
 <label>Posting status<select name="status" value={form.status} onChange={change}><option value="active">Publish now</option><option value="draft">Save as draft</option></select></label>
 </div>
 {postError&&<div className="form-alert error" role="alert">{postError}</div>}{success&&<div className="form-alert success" role="status">{success}</div>}
 <div className="post-form-footer"><p className="field-hint">Only active internships with a future deadline are visible to students.</p><button type="submit" disabled={posting||!companies.length}>{posting?'Posting…':'Post internship'}</button></div>
 </form></section>
 <h2>Manage records</h2><div className="tabs">{['students','companies','internships','applications','interviews','offers','records','evaluations'].map(v=><button className={resource===v?'active':''} onClick={()=>setResource(v)} key={v}>{v}</button>)}</div><DataTable data={rows}/></main></Layout>
}