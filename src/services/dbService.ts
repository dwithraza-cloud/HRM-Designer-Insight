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
const LOCAL_STORAGE_SEEDED_PREFIX = 'insight_hrm_col_seeded_';
const LOCAL_STORAGE_DELETED_PREFIX = 'insight_hrm_deleted_';

interface SeedState {
  seededCollections: string[];
  lastInitializedAt: string;
}

export class DBService {
  private seededCache: Set<string> = new Set();
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
  }

  /**
   * Check if an item ID has been deleted by the user
   */
  isItemDeleted(collectionName: string, id: string): boolean {
    try {
      return localStorage.getItem(`${LOCAL_STORAGE_DELETED_PREFIX}${collectionName}_${id}`) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Track deleted item ID permanently
   */
  markItemDeleted(collectionName: string, id: string): void {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_DELETED_PREFIX}${collectionName}_${id}`, 'true');
    } catch (e) {
      console.warn('Error saving deleted item tombstone:', e);
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
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      
      if (!snapshot.empty) {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          const item = { ...docSnap.data(), id: docSnap.id } as T;
          // Filter out tombstones if any
          if (!this.isItemDeleted(collectionName, item.id)) {
            items.push(item);
          }
        });
        // Collection has data, ensure it's marked as seeded
        await this.markCollectionSeeded(collectionName);
        return items;
      }

      // Check if collection was already seeded in the past (e.g. user deleted all records)
      const isLocallySeeded = localStorage.getItem(`${LOCAL_STORAGE_SEEDED_PREFIX}${collectionName}`) === 'true';
      const seededSet = await this.getSeededCollections();

      if (isLocallySeeded || seededSet.has(collectionName)) {
        // User intentionally deleted all items or collection is empty, DO NOT re-seed!
        console.log(`[Firestore] Collection '${collectionName}' is empty (user deleted/cleared), skipping re-seed.`);
        return [];
      }

      // First-time launch: Collection has never been seeded before, seed it now
      console.log(`[Firestore] Initializing fresh collection '${collectionName}' with ${initialData.length} records...`);
      const seededItems: T[] = [];
      for (const item of initialData) {
        if (item.id && !this.isItemDeleted(collectionName, item.id)) {
          await setDoc(doc(db, collectionName, item.id), item, { merge: true });
          seededItems.push(item);
        }
      }
      await this.markCollectionSeeded(collectionName);
      return seededItems;
    } catch (error) {
      console.error(`[Firestore Error] Failed to load/seed collection '${collectionName}':`, error);
      return initialData.filter(i => !this.isItemDeleted(collectionName, i.id));
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
      await this.markCollectionSeeded(collectionName);
      // Remove from tombstone if it was previously deleted and recreated
      try {
        localStorage.removeItem(`${LOCAL_STORAGE_DELETED_PREFIX}${collectionName}_${item.id}`);
      } catch {}
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
      await this.markCollectionSeeded(collectionName);
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
      this.markItemDeleted(collectionName, id);
      await this.markCollectionSeeded(collectionName);
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`[Firestore Error] Failed to delete document '${id}' from '${collectionName}':`, error);
      throw error;
    }
  }

  /**
   * Clear all documents in a collection permanently
   */
  async clearCollection(collectionName: string): Promise<void> {
    try {
      await this.markCollectionSeeded(collectionName);
      const colRef = collection(db, collectionName);
      const snap = await getDocs(colRef);
      for (const docSnap of snap.docs) {
        this.markItemDeleted(collectionName, docSnap.id);
        await deleteDoc(doc(db, collectionName, docSnap.id));
      }
    } catch (error) {
      console.error(`[Firestore Error] Failed to clear collection '${collectionName}':`, error);
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
          const item = { ...docSnap.data(), id: docSnap.id } as T;
          if (!this.isItemDeleted(collectionName, item.id)) {
            items.push(item);
          }
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
