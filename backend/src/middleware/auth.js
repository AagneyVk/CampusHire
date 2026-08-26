import jwt from 'jsonwebtoken';
export const asyncRoute=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
export const auth=(roles=[])=>asyncRoute(async(req,res,next)=>{const token=req.headers.authorization?.replace(/^Bearer\s+/,'');if(!token)return res.status(401).json({error:'Authentication required'});try{req.user=jwt.verify(token,process.env.JWT_SECRET);if(roles.length&&!roles.includes(req.user.role))return res.status(403).json({error:'Forbidden'});next();}catch{return res.status(401).json({error:'Invalid or expired token'});}});
