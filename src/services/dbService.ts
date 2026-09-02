import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const SYSTEM_METADATA_COLLECTION = '_system_metadata';
const SYSTEM_METADATA_DOC = 'seed_state';

interface SeedState {
  seededCollections: string[];
  lastInitializedAt: string;
}

export class DBService {
  private seededCache: Set<string> = new Set();
  private metaLoaded = false;

  /**
   * Load seed tracking metadata to ensure collections are seeded only once.
   */
  private async getSeededCollections(): Promise<Set<string>> {
    if (this.metaLoaded && this.seededCache.size > 0) {
      return this.seededCache;
    }
    try {
      const metaRef = doc(db, SYSTEM_METADATA_COLLECTION, SYSTEM_METADATA_DOC);
      const snap = await getDoc(metaRef);
      if (snap.exists()) {
        const data = snap.data() as SeedState;
        if (Array.isArray(data.seededCollections)) {
          this.seededCache = new Set(data.seededCollections);
        }
      }
      this.metaLoaded = true;
    } catch (err) {
      console.warn('[Firestore] Could not load seed metadata:', err);
    }
    return this.seededCache;
  }

  /**
   * Mark a collection as permanently initialized in Firestore.
   */
  private async markCollectionSeeded(collectionName: string): Promise<void> {
    try {
      this.seededCache.add(collectionName);
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
   * If a user intentionally deleted all records, it will NOT re-seed.
   */
  async loadOrSeedCollection<T extends { id: string }>(
    collectionName: string, 
    initialData: T[]
  ): Promise<T[]> {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      
      if (!snapshot.empty) {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as T);
        });
        // Collection has data, ensure it's marked as seeded
        await this.markCollectionSeeded(collectionName);
        return items;
      }

      // Check if collection was already seeded in the past (e.g. user deleted all records)
      const seededSet = await this.getSeededCollections();
      if (seededSet.has(collectionName)) {
        // User intentionally deleted all items or collection is empty, DO NOT re-seed!
        console.log(`[Firestore] Collection '${collectionName}' is empty (user modified), skipping re-seed.`);
        return [];
      }

      // First-time launch: Collection has never been seeded before, seed it now
      console.log(`[Firestore] Initializing fresh collection '${collectionName}' with ${initialData.length} records...`);
      for (const item of initialData) {
        if (item.id) {
          await setDoc(doc(db, collectionName, item.id), item, { merge: true });
        }
      }
      await this.markCollectionSeeded(collectionName);
      return initialData;
    } catch (error) {
      console.error(`[Firestore Error] Failed to load/seed collection '${collectionName}':`, error);
      return initialData;
    }
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
      this.seededCache.add(collectionName);
    } catch (error) {
      console.error(`[Firestore Error] Failed to save document in '${collectionName}':`, error);
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
      console.error(`[Firestore Error] Failed to update document '${id}' in '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * Permanently delete a document from Firestore
   */
  async deleteItem(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`[Firestore Error] Failed to delete document '${id}' from '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for a collection
   */
  subscribeToCollection<T extends { id: string }>(
    collectionName: string, 
    onData: (items: T[]) => void
  ): () => void {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef, 
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as T);
        });
        // Always emit current state (even if empty after deletions)
        onData(items);
      },
      (error) => {
        console.error(`[Firestore Listener Error] for '${collectionName}':`, error);
      }
    );
  }
}

export const dbService = new DBService();
