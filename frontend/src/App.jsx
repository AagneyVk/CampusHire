import React from 'react';
import {Routes,Route,Navigate,useLocation} from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Internships from './pages/Internships.jsx';
import InternshipDetails from './pages/InternshipDetails.jsx';
import Dashboard from './pages/student/Dashboard.jsx';
import Profile from './pages/student/Profile.jsx';
import CompleteProfile from './pages/student/CompleteProfile.jsx';
import Applications from './pages/student/Applications.jsx';
import {StudentRecords} from './pages/student/Records.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';

const Guard=({role,children,allowIncomplete=false})=>{
  if(!localStorage.getItem('token')||localStorage.getItem('role')!==role)return <Navigate to="/login" replace/>;
  const complete=localStorage.getItem('profileComplete')==='true';
  if(role==='student'&&!complete&&!allowIncomplete)return <Navigate to="/complete-profile" replace/>;
  if(role==='student'&&complete&&allowIncomplete)return <Navigate to="/dashboard" replace/>;
  return children;
};

export default function App(){const location=useLocation();const loggedIn=Boolean(localStorage.getItem('token')),student=localStorage.getItem('role')==='student',complete=localStorage.getItem('profileComplete')==='true';if(loggedIn&&student&&!complete&&location.pathname!=='/complete-profile')return <Navigate to="/complete-profile" replace/>;return <Routes>
  <Route path="/" element={<Home/>}/>
  <Route path="/login" element={<Login/>}/>
  <Route path="/register" element={<Register/>}/>
  <Route path="/internships" element={<Internships/>}/>
  <Route path="/internships/:id" element={<InternshipDetails/>}/>
  <Route path="/complete-profile" element={<Guard role="student" allowIncomplete><CompleteProfile/></Guard>}/>
  <Route path="/dashboard" element={<Guard role="student"><Dashboard/></Guard>}/>
  <Route path="/profile" element={<Guard role="student"><Profile/></Guard>}/>
  <Route path="/applications" element={<Guard role="student"><Applications/></Guard>}/>
  <Route path="/interviews" element={<Guard role="student"><StudentRecords type="interviews"/></Guard>}/>
  <Route path="/offers" element={<Guard role="student"><StudentRecords type="offers"/></Guard>}/>
  <Route path="/history" element={<Guard role="student"><StudentRecords type="history"/></Guard>}/>
  <Route path="/admin" element={<Guard role="admin"><AdminDashboard/></Guard>}/>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes>}
