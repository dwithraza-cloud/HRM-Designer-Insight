import {FieldValue} from 'firebase-admin/firestore';
import {services,actor,requestAllowed} from '../server/firebase.js';
export default async function handler(req,res){
 if(!requestAllowed(req,res))return;
 try{
  const {db,auth}=services();let who;try{who=await actor(req,db,auth)}catch{return res.status(401).json({success:false,error:'Please sign in again.'})}
  const id=req.body.id;if(typeof id!=='string'||!id||id.length>1500||id.includes('/'))return res.status(400).json({success:false,error:'Invalid task ID.'});
  const ref=db.doc('tasks/'+id);
  await db.runTransaction(async tx=>{
   const task=await tx.get(ref);
   if(who.role!=='admin'&&!(who.role==='manager'&&task.exists&&task.data().department===who.department))throw Error('Forbidden');
   tx.set(db.doc('_system_metadata/deleted_records'),{deletedKeys:FieldValue.arrayUnion(id,'tasks_'+id),updatedAt:new Date().toISOString()},{merge:true});
   tx.delete(ref);
  });return res.json({success:true});
 }catch{return res.status(403).json({success:false,error:'Unable to delete this task.'});}
}
