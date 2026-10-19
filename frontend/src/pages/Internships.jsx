import React,{useEffect,useState}from'react';import{Link}from'react-router-dom';import{Search}from'lucide-react';import Layout from'../components/Layout.jsx';import{api}from'../services/api.js';import{LoadingState,ErrorState,EmptyState}from'../components/UI.jsx';
export default function Internships(){
 const[data,setData]=useState([]),[q,setQ]=useState(''),[mode,setMode]=useState(''),[page,setPage]=useState(1),[pages,setPages]=useState(1),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{
  const controller=new AbortController();
  setLoading(true);setError('');
  const delay=setTimeout(()=>{
   api(`/internships?q=${encodeURIComponent(q.trim())}&mode=${encodeURIComponent(mode)}&page=${page}`,{signal:controller.signal})
    .then(x=>{setData(x.data||[]);setPages(x.pages||1)})
    .catch(e=>{if(e.name!=='AbortError')setError(e.message)})
    .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  },q.trim()?300:0);
  return()=>{clearTimeout(delay);controller.abort()};
 },[q,mode,page]);
 return <Layout><main className="page"><span className="eyebrow">OPPORTUNITIES</span><h1>Internships</h1><div className="filterbar"><div className="search"><Search size={18}/><input aria-label="Search internships" value={q} onChange={e=>{setQ(e.target.value);setPage(1)}} placeholder="Search role or company"/></div><select aria-label="Work mode" value={mode} onChange={e=>{setMode(e.target.value);setPage(1)}}><option value="">All modes</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></div>{loading?<LoadingState/>:error?<ErrorState message={error}/>:data.length?<div className="grid">{data.map(x=><Link className="job" to={`/internships/${x.internship_id}`} key={x.internship_id}><small>{x.company}</small><h2>{x.title}</h2><p>{x.location} · {x.work_mode} · ₹{Number(x.stipend).toLocaleString()}</p><span>Apply by {new Date(x.application_deadline).toLocaleDateString()}</span></Link>)}</div>:<EmptyState>No matching internships.</EmptyState>}<div className="pagination"><button disabled={loading||page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page} of {pages||1}</span><button disabled={loading||page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button></div></main></Layout>
}