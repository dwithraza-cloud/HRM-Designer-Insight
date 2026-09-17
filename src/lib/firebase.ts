import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, setLogLevel, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence Firestore internal offline/reconnection state-tracker logs from polluting console.error
setLogLevel('silent');

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Use standard getFirestore as mandated by Firebase Skill guidelines
export const db = getFirestore(app, dbId);
export const auth = getAuth(app);

// Validate connection to Firestore on boot (as specified in Firebase Skill)
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Operating in offline mode or awaiting connection.');
    }
    return false;
  }
}

// Non-blocking connection test
testConnection().catch(() => {});


