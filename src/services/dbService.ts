import { 
  collection, query, where, documentId, type Query, type DocumentData,
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  arrayUnion,
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const SYSTEM_METADATA_COLLECTION = '_system_metadata';
const SYSTEM_METADATA_DOC = 'seed_state';
const LOCAL_STORAGE_SEEDED_PREFIX = 'insight_hrm_col_seeded_';
const LOCAL_STORAGE_DELETED_PREFIX = 'insight_hrm_deleted_';

interface SeedState {
  seededCollections: string[];
  lastInitializedAt: string;
}

export class DBService {
  private async scopedCollection(name: string): Promise<Query<DocumentData> | null> {
    const user=auth.currentUser;
    if(!user)return null;
    const snap=await getDoc(doc(db,'_access',user.uid));
    if(!snap.exists())return null;
    const access=snap.data(),base=collection(db,name),admin=access.role==='admin',manager=access.role==='manager';
    if(admin)return base;
    const ids=access.ids as string[];
    if(name==='user_accounts')return query(base,where(documentId(),'==',user.uid));
    if(name==='employees')return manager?query(base,where('department','==',access.department)):query(base,where(documentId(),'in',ids));
    if(name==='tasks')return manager?query(base,where('department','==',access.department)):query(base,where('assignedTo.id','in',ids));
    if(['attendance','leave_requests','payroll_records'].includes(name))return manager&&name!=='payroll_records'?query(base,where('department','==',access.department)):query(base,where('empId','in',ids));
    if(name==='assets')return query(base,where('assignedTo.empId','in',ids));
    if(name==='documents')return query(base,where('restrictedTo','in',manager?['all','admin-manager']:['all']));
    if(['activities','interviews','hiring_velocity','performance_feedback'].includes(name))return manager?base:null;
    if(['notifications','top_performers','job_openings'].includes(name))return base;
    return null;
  }
  private seededCache: Set<string> = new Set();
  private deletedCache: Set<string> = new Set();
  private metaLoaded = false;

  constructor() {
    // Read local storage seed status on startup
    try {
      const stored = localStorage.getItem('insight_hrm_seeded_collections');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(c => this.seededCache.add(c));
        }
      }
    } catch (e) {
      console.warn('Error reading local seed cache:', e);
    }

    // Read local storage deleted items cache on startup
    try {
      const deletedStored = localStorage.getItem('insight_hrm_deleted_items_all');
      if (deletedStored) {
        const parsed = JSON.parse(deletedStored);
        if (Array.isArray(parsed)) {
          parsed.forEach(id => this.deletedCache.add(id));
        }
      }
    } catch (e) {
      console.warn('Error reading local deleted cache:', e);
    }
  }

  /**
   * Check if an item ID has been deleted by the user
   */
  isItemDeleted(collectionName: string, id: string): boolean {
    if (!id) return false;
    const compoundKey = `${collectionName}_${id}`;
    if (this.deletedCache.has(compoundKey) || this.deletedCache.has(id)) {
      return true;
    }
    try {
      if (localStorage.getItem(`${LOCAL_STORAGE_DELETED_PREFIX}${collectionName}_${id}`) === 'true') {
        this.deletedCache.add(compoundKey);
        this.deletedCache.add(id);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  /**
   * Track deleted item ID permanently across memory, localStorage, and Firestore
   */
  markItemDeleted(collectionName: string, id: string): void {
    if (!id) return;
    const compoundKey = `${collectionName}_${id}`;
    this.deletedCache.add(compoundKey);
    this.deletedCache.add(id);

    try {
      localStorage.setItem(`${LOCAL_STORAGE_DELETED_PREFIX}${collectionName}_${id}`, 'true');
      localStorage.setItem('insight_hrm_deleted_items_all', JSON.stringify(Array.from(this.deletedCache)));
    } catch (e) {
      console.warn('Error saving deleted item tombstone:', e);
    }

    // Persist tombstones to Firestore asynchronously so all accounts and reloads respect it
    try {
      if(!auth.currentUser)return;
      const metaRef = doc(db, SYSTEM_METADATA_COLLECTION, 'deleted_records');
      setDoc(metaRef, {
        deletedKeys: arrayUnion(id, compoundKey),
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    } catch {
      // background non-blocking
    }
  }

  /**
   * Fetch global deletion tombstones from Firestore
   */
  async loadGlobalDeletedTombstones(): Promise<void> {
    try {
      const metaRef = doc(db, SYSTEM_METADATA_COLLECTION, 'deleted_records');
      const snap = await getDoc(metaRef);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.deletedKeys)) {
          data.deletedKeys.forEach((k: string) => {
            if (k) this.deletedCache.add(k);
          });
          try {
            localStorage.setItem('insight_hrm_deleted_items_all', JSON.stringify(Array.from(this.deletedCache)));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Could not load global deleted tombstones:', e);
    }
  }

  /**
   * Load seed tracking metadata to ensure collections are seeded only once.
   */
  private async getSeededCollections(): Promise<Set<string>> {
    // Check localStorage first
    try {
      const stored = localStorage.getItem('insight_hrm_seeded_collections');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(c => this.seededCache.add(c));
        }
      }
    } catch (e) {
      console.warn('Error reading local seed storage:', e);
    }

    if (this.metaLoaded && this.seededCache.size > 0) {
      return this.seededCache;
    }

    try {
      const metaRef = doc(db, SYSTEM_METADATA_COLLECTION, SYSTEM_METADATA_DOC);
      const snap = await getDoc(metaRef);
      if (snap.exists()) {
        const data = snap.data() as SeedState;
        if (Array.isArray(data.seededCollections)) {
          data.seededCollections.forEach(c => this.seededCache.add(c));
        }
      }
      this.metaLoaded = true;
    } catch (err) {
      console.warn('[Firestore] Could not load seed metadata:', err);
    }
    return this.seededCache;
  }

  /**
   * Mark a collection as permanently initialized in both Firestore and localStorage.
   */
  async markCollectionSeeded(collectionName: string): Promise<void> {
    try {
      this.seededCache.add(collectionName);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_SEEDED_PREFIX}${collectionName}`, 'true');
        localStorage.setItem('insight_hrm_seeded_collections', JSON.stringify(Array.from(this.seededCache)));
      } catch (e) {
        console.warn('Local storage write warning:', e);
      }

      const metaRef = doc(db, SYSTEM_METADATA_COLLECTION, SYSTEM_METADATA_DOC);
      await setDoc(metaRef, {
        seededCollections: Array.from(this.seededCache),
        lastInitializedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn(`[Firestore] Failed to update seed state for ${collectionName}:`, err);
    }
  }

  /**
   * Load collection from Firestore. If Firestore collection has never been seeded before, seed it once.
   * If a user intentionally deleted all records or modified them, it will NEVER re-seed!
   */
  async loadOrSeedCollection<T extends { id: string }>(
    collectionName: string, 
    initialData: T[]
  ): Promise<T[]> {
    // Migration owns initialization; browsers never seed fallback/demo records.
    try {
      const target=await this.scopedCollection(collectionName);
      if(!target)return [];
      const snapshot=await getDocs(target);
      return snapshot.docs.map(d=>({...d.data() as object,id:d.id}) as T).filter(item=>!this.isItemDeleted(collectionName,item.id));
    } catch(error) { console.warn('Unable to load '+collectionName); return []; }
  }

  /**
   * Create or update a document in Firestore
   */
  async saveItem<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
    try {
      if (!item.id) {
        throw new Error('Item must have a unique id');
      }
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, item, { merge: true });

      // Remove from tombstone if it was previously deleted and recreated
      try {
        localStorage.removeItem(`${LOCAL_STORAGE_DELETED_PREFIX}${collectionName}_${item.id}`);
      } catch {}
    } catch (error) {
      console.warn(`[Firestore Notice] Failed to save document in '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * Update specific fields in a Firestore document
   */
  async updateItemFields(collectionName: string, id: string, fields: Record<string, any>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await setDoc(docRef, fields, { merge: true });

    } catch (error) {
      console.warn(`[Firestore Notice] Failed to update document '${id}' in '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * Permanently delete a document from Firestore
   */
  async deleteItem(collectionName: string, id: string): Promise<void> {
    if (!id) return;
    if(collectionName==='tasks') {
      const token=await auth.currentUser?.getIdToken();
      if(!token)throw new Error('Please sign in first.');
      const response=await fetch('/api/delete-task',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({id})});
      if(!response.ok)throw new Error('Unable to delete this task.');
      this.markItemDeleted(collectionName,id);
      return;
    }
    // 1. Immediately mark tombstone locally and in cache
    this.markItemDeleted(collectionName, id);

    try {

      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn(`[Firestore Notice] Could not delete doc '${id}' from '${collectionName}' (may be local-only or already removed):`, error);
      // Tombstone is already preserved, operation is considered complete
    }
  }

  /**
   * Clear all documents in a collection permanently
   */
  async clearCollection(collectionName: string): Promise<void> {
    try {

      const colRef = collection(db, collectionName);
      const snap = await getDocs(colRef);
      for (const docSnap of snap.docs) {
        await this.deleteItem(collectionName, docSnap.id);
      }
    } catch (error) {
      console.warn(`[Firestore Notice] Failed to clear collection '${collectionName}':`, error);
    }
  }

  /**
   * Subscribe to real-time updates for a collection
   */
  subscribeToCollection<T extends { id: string }>(
    collectionName: string, 
    onData: (items: T[]) => void
  ): () => void {
    let stopped=false;
    let unsubscribe: (()=>void)|undefined;
    void this.scopedCollection(collectionName).then(target=>{
      if(stopped)return;
      if(!target){onData([]);return;}
      unsubscribe=onSnapshot(target,(snapshot)=>{
        const items=snapshot.docs.map(docSnap=>({...docSnap.data() as object,id:docSnap.id}) as T).filter(item=>!this.isItemDeleted(collectionName,item.id));
        onData(items);
      },()=>{console.warn('Unable to subscribe to '+collectionName);onData([]);});
    }).catch(()=>{if(!stopped)onData([]);});
    return ()=>{stopped=true;unsubscribe?.();};
  }
}
export const dbService = new DBService();
