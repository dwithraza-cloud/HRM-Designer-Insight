import {services,actor,requestAllowed,checkPassword,hashPassword,cleanAccount,accessFor} from '../server/firebase.js';
const roles=new Set(['admin','manager','employee']);
export default async function handler(req,res){
 if(!requestAllowed(req,res))return;
 try{
  const {db,auth}=services();let who;try{who=await actor(req,db,auth)}catch{return res.status(401).json({success:false,error:'Please sign in again.'})}
  const {action}=req.body;
  if(action==='theme'){
   if(!['light','dark'].includes(req.body.theme))return res.status(400).json({success:false,error:'Invalid theme.'});
   await db.doc('user_accounts/'+who.uid).update({themePreference:req.body.theme,'profile.themePreference':req.body.theme});
   return res.json({success:true});
  }
  if(action==='delete'){
   if(who.role!=='admin'||req.body.id===who.uid)return res.status(403).json({success:false,error:'This account cannot be deleted.'});
   const id=String(req.body.id||'');if(!/^[\w-]{1,128}$/.test(id))return res.status(400).json({success:false,error:'Invalid account ID.'});
   const batch=db.batch();for(const col of ['user_accounts','_credentials','_access'])batch.delete(db.doc(col+'/'+id));await batch.commit();
   try{await auth.revokeRefreshTokens(id)}catch{}return res.json({success:true});
  }
  let account,newPassword;
  if(action==='self'){
   const snap=await db.doc('user_accounts/'+who.uid).get();if(!snap.exists)throw Error('Account not found');account={...snap.data(),id:who.uid};
   const cred=await db.doc('_credentials/'+who.uid).get();
   if(!checkPassword(req.body.currentPassword,cred.data()?.hash))return res.status(403).json({success:false,error:'Current password is incorrect.'});
   if(req.body.newEmail)account.email=String(req.body.newEmail).trim().toLowerCase();
   if(req.body.newPassword)newPassword=req.body.newPassword;
   account.profile={...account.profile,email:account.email};
  }else if(action==='save'){
   if(who.role!=='admin')return res.status(403).json({success:false,error:'Only administrators can manage accounts.'});
   account=req.body.account;
   if(!account||typeof account.id!=='string'||!/^[\w-]{1,128}$/.test(account.id)||!roles.has(account.roleType)||typeof account.name!=='string'||!account.name.trim()||!account.profile||typeof account.profile!=='object')return res.status(400).json({success:false,error:'Invalid account.'});
   if(account.id===who.uid&&account.roleType!=='admin')return res.status(403).json({success:false,error:'You cannot remove your own administrator access.'});
   const old=await db.doc('user_accounts/'+account.id).get();
   newPassword=account.passwordHash||undefined;
   if(!old.exists&&!newPassword)return res.status(400).json({success:false,error:'Set an initial password for the new account.'});
   account={...account,email:String(account.email||'').trim().toLowerCase(),profile:{...account.profile,id:account.id,roleType:account.roleType}};
  }else return res.status(400).json({success:false,error:'Unknown account action.'});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email))return res.status(400).json({success:false,error:'Invalid email.'});
  if(newPassword&&(typeof newPassword!=='string'||newPassword.length<8||newPassword.length>1024))return res.status(400).json({success:false,error:'Password must have at least 8 characters.'});
  account={...account,passwordHash:'',profile:{...account.profile,email:account.email,name:account.name},lastUpdated:new Date().toISOString()};
  const access=await accessFor(db,account);
  await db.runTransaction(async tx=>{
   const all=await tx.get(db.collection('user_accounts'));
   if(all.docs.some(d=>d.id!==account.id&&String(d.data().email||'').toLowerCase()===account.email))throw Error('Email is already registered.');
   tx.set(db.doc('user_accounts/'+account.id),account);tx.set(db.doc('_access/'+account.id),access);
   if(newPassword)tx.set(db.doc('_credentials/'+account.id),{hash:hashPassword(newPassword)});
  });
  if(newPassword)try{await auth.revokeRefreshTokens(account.id)}catch{}
  return res.json({success:true,account:cleanAccount(account),updatedProfile:account.profile});
 }catch(error){console.error('HRM account operation failed');return res.status(400).json({success:false,error:error.message==='Email is already registered.'?error.message:'Unable to update this account.'});}
}
