import {initializeApp,cert,getApps} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
export function services(){
 const account=JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON||'{}');
 if(account.project_id!=='hrm-designer-insight'||process.env.FIREBASE_PROJECT_ID!=='hrm-designer-insight'||process.env.FIRESTORE_DATABASE_ID!=='(default)')throw Error('Invalid Firebase target');
 const app=getApps().find(a=>a.name==='hrm-auth')||initializeApp({credential:cert(account),projectId:account.project_id},'hrm-auth');
 return {db:getFirestore(app,'(default)'),auth:getAuth(app)};
}
export const hashPassword=password=>{const salt=randomBytes(16).toString('hex');return 'scrypt$'+salt+'$'+scryptSync(password,salt,64).toString('hex')};
export function checkPassword(password,stored){
 if(typeof password!=='string'||password.length>1024||typeof stored!=='string')return false;
 const [scheme,salt,hash]=stored.split('$');if(scheme!=='scrypt'||!salt||!hash)return false;
 const actual=scryptSync(password,salt,64),expected=Buffer.from(hash,'hex');return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
export const cleanAccount=data=>({...data,passwordHash:''});
export function requestAllowed(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.status(405).json({success:false,error:'Method not allowed'});return false;}
 const origin=req.headers.origin;
 if(origin&&origin!==`https://${req.headers.host}`){res.status(403).json({success:false,error:'Invalid request origin'});return false;}
 if(!req.body||typeof req.body!=='object'||JSON.stringify(req.body).length>200000){res.status(400).json({success:false,error:'Invalid request'});return false;}
 return true;
}
export async function actor(req,db,auth){
 const token=String(req.headers.authorization||'');if(!token.startsWith('Bearer '))throw Error('Unauthorized');
 const decoded=await auth.verifyIdToken(token.slice(7),true);const snap=await db.doc('_access/'+decoded.uid).get();
 if(!snap.exists)throw Error('Unauthorized');return {uid:decoded.uid,...snap.data()};
}
export async function accessFor(db,account){
 const people=(await db.collection('employees').get()).docs.map(d=>({id:d.id,...d.data()}));
 const matches=people.filter(p=>String(p.email||'').toLowerCase()===account.email.toLowerCase());
 const person=matches.length===1?matches[0]:null;
 return {role:account.roleType,department:person?.department||account.profile?.department||'',name:account.name,
  ids:[...new Set([account.id,account.profile?.id,account.profile?.empId,person?.id,person?.empId].filter(x=>typeof x==='string'&&x))],
  employeeId:person?.id||'',empId:person?.empId||account.profile?.empId||''};
}
export async function rateLimit(db,req,email){
 const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];
 const ids=[['ip',ip,30],['email',email,12]];
 return db.runTransaction(async tx=>{
  const refs=ids.map(([type,value])=>db.doc('_auth_limits/'+createHash('sha256').update(type+':'+value).digest('hex')));
  const snapshots=await Promise.all(refs.map(ref=>tx.get(ref)));const now=Date.now();
  if(snapshots.some((s,i)=>s.exists&&now-s.data().start<900000&&s.data().count>=ids[i][2]))return false;
  snapshots.forEach((s,i)=>{const old=s.data();tx.set(refs[i],{start:old&&now-old.start<900000?old.start:now,count:old&&now-old.start<900000?old.count+1:1});});return true;
 });
}
