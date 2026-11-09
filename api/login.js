import {services,checkPassword,requestAllowed,rateLimit} from '../server/firebase.js';
export default async function handler(req,res){
 if(!requestAllowed(req,res))return;
 try{
  const {db,auth}=services(),email=String(req.body.email||'').trim().toLowerCase(),password=req.body.password;
  if(!email||typeof password!=='string'||password.length>1024)return res.status(401).json({success:false,error:'Invalid email or password.'});
  if(!await rateLimit(db,req,email))return res.status(429).json({success:false,error:'Too many attempts. Please try again in 15 minutes.'});
  const accounts=(await db.collection('user_accounts').get()).docs;
  const matches=accounts.filter(d=>String(d.data().email||'').toLowerCase()===email);
  const account=matches.length===1?matches[0]:null;
  const credential=account?await db.doc('_credentials/'+account.id).get():null;
  if(!account||!credential?.exists||!checkPassword(password,credential.data().hash))return res.status(401).json({success:false,error:'Invalid email or password.'});
  if(!(await db.doc('_access/'+account.id).get()).exists)return res.status(403).json({success:false,error:'Account is not enabled.'});
  const token=await auth.createCustomToken(account.id);
  return res.status(200).json({success:true,token});
 }catch(error){console.error('HRM login failed',error.code||'unknown');return res.status(503).json({success:false,error:'Sign-in is temporarily unavailable.'});}
}
