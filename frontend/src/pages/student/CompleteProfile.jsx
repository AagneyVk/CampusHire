import React,{useEffect,useState}from'react';
import {useNavigate} from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import {api} from '../../services/api.js';
import {ErrorState,LoadingState} from '../../components/UI.jsx';

export default function CompleteProfile(){
  const[profile,setProfile]=useState(null),[catalog,setCatalog]=useState([]),[form,setForm]=useState({firstName:'',lastName:'',cgpa:'',phone:'',resumeUrl:'',bio:''}),[selectedSkills,setSelectedSkills]=useState({}),[search,setSearch]=useState(''),[error,setError]=useState(''),[saving,setSaving]=useState(false),nav=useNavigate();
  useEffect(()=>{Promise.all([api('/student/profile'),api('/meta')]).then(([p,m])=>{setProfile(p);setCatalog(m.skills||[]);setForm({firstName:p.first_name||'',lastName:p.last_name||'',cgpa:p.cgpa==null?'':String(p.cgpa),phone:p.phone||'',resumeUrl:p.resume_url||'',bio:p.bio||''});const chosen={};(p.skills||[]).forEach(x=>{chosen[x.skill_id]=x.proficiency||'intermediate'});setSelectedSkills(chosen)}).catch(e=>setError(e.message))},[]);
  function change(e){setForm(p=>({...p,[e.target.name]:e.target.value}))}
  function toggleSkill(id,checked){setSelectedSkills(p=>{const next={...p};if(checked)next[id]='intermediate';else delete next[id];return next})}
  async function submit(e){e.preventDefault();setError('');if(!Object.keys(selectedSkills).length){setError('Select at least one skill to continue.');return}setSaving(true);try{await api('/student/complete-profile',{method:'PUT',body:JSON.stringify({...form,cgpa:Number(form.cgpa),skills:Object.entries(selectedSkills).map(([skillId,proficiency])=>({skillId:Number(skillId),proficiency}))})});localStorage.setItem('profileComplete','true');nav('/dashboard',{replace:true})}catch(e){setError(e.message)}finally{setSaving(false)}}
  if(!profile)return <Layout><main className="page">{error?<ErrorState message={error}/>:<LoadingState/>}</main></Layout>;
  const filtered=catalog.filter(x=>x.name.toLowerCase().includes(search.toLowerCase()));
  return <Layout><main className="page onboarding">
    <span className="eyebrow">ONE-TIME SETUP</span>
    <h1>Complete your profile</h1>
    <p className="lead">Before you continue, tell us a little about yourself. Your CGPA and skills help CampusHire identify relevant internships. You must save this information before accessing the student portal.</p>
    <form className="panel onboarding-form" onSubmit={submit}>
      <h2>Academic and personal details</h2>
      <div className="onboarding-fields">
        <label>First name <span className="required">*</span><input name="firstName" value={form.firstName} onChange={change} required maxLength="80"/></label>
        <label>Last name<input name="lastName" value={form.lastName} onChange={change} maxLength="80"/></label>
        <label>CGPA (out of 10) <span className="required">*</span><input name="cgpa" type="number" min="0" max="10" step="0.01" value={form.cgpa} onChange={change} required/></label>
        <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={change} maxLength="30" placeholder="Optional"/></label>
        <label className="full-field">Resume URL<input name="resumeUrl" type="url" value={form.resumeUrl} onChange={change} placeholder="https://… (optional)"/></label>
        <label className="full-field">Short bio<textarea name="bio" value={form.bio} onChange={change} maxLength="2000" placeholder="Your interests, strengths or career goals (optional)"/></label>
      </div>
      <div className="skills-heading"><div><h2>Your skills <span className="required">*</span></h2><p>Select at least one skill and set your proficiency level.</p></div><strong>{Object.keys(selectedSkills).length} selected</strong></div>
      <label className="skill-search">Find a skill<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Python, SQL, Java…"/></label>
      {catalog.length===0?<p className="notice">No skills are available yet. Please contact the administrator.</p>:<div className="skill-grid">{filtered.map(skill=><div className="skill-card" key={skill.skill_id}>
        <label className="skill-option"><input type="checkbox" checked={Boolean(selectedSkills[skill.skill_id])} onChange={e=>toggleSkill(skill.skill_id,e.target.checked)}/><span>{skill.name}</span></label>
        {selectedSkills[skill.skill_id]&&<label className="proficiency-label">Proficiency<select value={selectedSkills[skill.skill_id]} onChange={e=>setSelectedSkills(p=>({...p,[skill.skill_id]:e.target.value}))}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>}
      </div>)}</div>}
      {filtered.length===0&&catalog.length>0&&<p className="state">No skills match that search.</p>}
      {error&&<p className="notice" role="alert">{error}</p>}
      <button type="submit" disabled={saving||catalog.length===0}>{saving?'Saving profile…':'Save profile and continue'}</button>
      <p className="onboarding-footnote">Fields marked * are required. You can update your profile later.</p>
    </form>
  </main></Layout>
}
