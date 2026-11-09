import { GoogleAuth } from 'google-auth-library';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const SHEET_ID = '1WH4SiBj5YNOiJ00xRkra-1O4RDzLv2eMzGO9__VqfiU';
const SHEETS = ['2026-11','2026-12',...Array.from({length:12},(_,i)=>'2027-'+String(i+1).padStart(2,'0'))];
const validStatus = new Set(['Pending','In Progress','Under Review','Completed','Blocked']);
const validPriority = new Set(['low','medium','high','urgent']);
const cell = (r,i) => String(r[i] ?? '').trim();

export default async function handler(req,res) {
  if(req.method!=='POST' && req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const secret = process.env.CRON_SECRET;
  if(!secret || req.headers.authorization !== 'Bearer '+secret) return res.status(401).json({error:'Unauthorized'});
  if(!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return res.status(503).json({error:'Missing GOOGLE_SERVICE_ACCOUNT_JSON'});
  let account;
  try { account = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON); }
  catch { return res.status(503).json({error:'Invalid service account configuration'}); }
  try {
    // Never let a credential silently select an unintended project or old database.
    const projectId=process.env.FIREBASE_PROJECT_ID;
    const databaseId=process.env.FIRESTORE_DATABASE_ID;
    if(projectId!=='hrm-designer-insight' || account.project_id!==projectId || !databaseId) {
      return res.status(503).json({error:'Firebase target configuration is incomplete or mismatched'});
    }
    const appName='hrm-sheet-sync';
    const app=getApps().find(a=>a.name===appName) || initializeApp({credential:cert(account),projectId},appName);
    const db=getFirestore(app,databaseId);
    const auth=new GoogleAuth({credentials:account,scopes:['https://www.googleapis.com/auth/spreadsheets.readonly']});
    const client=await auth.getClient();
    const tokenObj=await client.getAccessToken();
    const token=tokenObj.token;
    const people=(await db.collection('employees').get()).docs.map(d=>({id:d.id,...d.data()}));
    const tombstone=await db.collection('_system_metadata').doc('deleted_records').get();
    const deleted=new Set(tombstone.data()?.deletedKeys || []);
    // Read every tab before any writes, so a missing/inaccessible tab cannot cause a partial import.
    const months=[];
    for(const month of SHEETS){
      const range=encodeURIComponent("'"+month+"'!A5:Q500");
      const response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+SHEET_ID+'/values/'+range,{headers:{Authorization:'Bearer '+token}});
      if(!response.ok) throw new Error('Sheets '+month+': HTTP '+response.status);
      months.push({month,values:(await response.json()).values || []});
    }
    const seenIds=new Set();
    for(const {values} of months) for(const row of values) {
      if(!cell(row,1)) continue;
      const id=cell(row,0);
      if(!/^[A-Za-z0-9_-]{1,110}$/.test(id) || seenIds.has(id)) {
        return res.status(422).json({error:'Every nonempty task needs a unique, permanent Task ID in column A'});
      }
      seenIds.add(id);
    }
    let created=0, updated=0, skipped=0;
    for(const {month,values} of months){
      for(const [index,row] of values.entries()){
        const title=cell(row,1);
        if(!title){skipped++;continue;}
        const empId=cell(row,7),empName=cell(row,6);
        const matches=people.filter(p=>empId ? (p.empId===empId||p.id===empId) : (empName && String(p.name||'').toLowerCase()===empName.toLowerCase()));
        const person=matches.length===1?matches[0]:null;
        // Never assign to the wrong employee on ambiguous or missing identity.
        if((empName||empId) && !person){skipped++;continue;}
        const id=cell(row,0);
        if(deleted.has(id)||deleted.has('tasks_'+id)){skipped++;continue;}
        const ref=db.collection('tasks').doc(id);
        const old=await ref.get();
        // A Sheet row must never overwrite a manually created or migrated HRM task.
        if(old.exists && (old.data().source!=='google_sheet' || (old.data().sheetId && old.data().sheetId!==SHEET_ID))){skipped++;continue;}
        const status=cell(row,14);
        const priority=cell(row,4).toLowerCase();
        const fields={
          id,title,description:cell(row,2),category:cell(row,3),
          priority:validPriority.has(priority)?priority:'medium',
          dueDate:cell(row,5),department:cell(row,8) || person?.department || '',
          tags:cell(row,9).split(',').map(s=>s.trim()).filter(Boolean),
          hasNumericTarget:/^(yes|true|1)$/i.test(cell(row,10)),
          targetCount:Number(cell(row,11))||0,currentCount:Number(cell(row,12))||0,
          unitName:cell(row,13),notes:cell(row,15),
          source:'google_sheet',sheetId:SHEET_ID,sheetMonth:month,sheetRow:index+5,
          sheetSyncedAt:FieldValue.serverTimestamp()
        };
        if(validStatus.has(status)){fields.status=status;fields.completed=status==='Completed';}
        if(person) fields.assignedTo={id:person.empId||person.id,name:person.name,role:person.designation||'Employee',roleType:'employee',department:person.department||'',email:person.email||'',avatar:person.avatar||''};
        if(!old.exists){
          fields.pinned=false;
          fields.createdAt=new Date().toISOString();
          if(!fields.status){fields.status='Pending';fields.completed=false;}
        }
        await ref.set(fields,{merge:true});
        old.exists?updated++:created++;
      }
    }
    return res.status(200).json({ok:true,created,updated,skipped,months:SHEETS.length});
  } catch(error) {
    console.error('Sheet sync error',error.message);
    return res.status(500).json({error:'Sync failed; check server logs'});
  }
}

