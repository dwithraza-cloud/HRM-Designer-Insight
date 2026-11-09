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
    if(!getApps().length) initializeApp({credential:cert(account),projectId:account.project_id});
    const db=getFirestore(getApps()[0], 'ai-studio-aurahr-909b5d04-dddb-4f79-9437-e1d6627131c5');
    const auth=new GoogleAuth({credentials:account,scopes:['https://www.googleapis.com/auth/spreadsheets.readonly']});
    const client=await auth.getClient();
    const tokenObj=await client.getAccessToken();
    const token=tokenObj.token;
    const people=(await db.collection('employees').get()).docs.map(d=>({id:d.id,...d.data()}));
    let created=0, updated=0, skipped=0;
    for(const month of SHEETS){
      const range=encodeURIComponent("'"+month+"'!A5:Q500");
      const url='https://sheets.googleapis.com/v4/spreadsheets/'+SHEET_ID+'/values/'+range;
      const response=await fetch(url,{headers:{Authorization:'Bearer '+token}});
      if(!response.ok) throw new Error('Sheets '+month+': HTTP '+response.status);
      const data=await response.json();
      for(const [index,row] of (data.values||[]).entries()){
        const title=cell(row,1);
        if(!title){skipped++;continue;}
        const empId=cell(row,7),empName=cell(row,6);
        const person=people.find(p=> (empId && (p.empId===empId||p.id===empId)) || (empName && String(p.name||'').toLowerCase()===empName.toLowerCase()));
        // Never assign to the wrong employee on ambiguous or missing identity.
        if((empName||empId) && !person){skipped++;continue;}
        const rawId=cell(row,0);
        const id=rawId && /^[A-Za-z0-9_-]{1,110}$/.test(rawId)?rawId:'sheet-'+month+'-'+(index+5);
        const ref=db.collection('tasks').doc(id);
        const old=await ref.get();
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
          source:'google_sheet',sheetMonth:month,sheetRow:index+5,
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
