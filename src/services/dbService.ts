import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export class DBService {
  /**
   * Load collection from Firestore. If Firestore collection is empty, seed it once with initialData.
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
        return items;
      }

      // Collection is completely empty: seed once into production Firestore database
      console.log(`[Firestore] Seeding empty collection '${collectionName}' with ${initialData.length} records...`);
      for (const item of initialData) {
        if (item.id) {
          await setDoc(doc(db, collectionName, item.id), item);
        }
      }
      return initialData;
    } catch (error) {
      console.error(`[Firestore Error] Failed to load/seed collection '${collectionName}':`, error);
      return initialData;
    }
  }

  /**
   * Create or overwrite a document in Firestore
   */
  async saveItem<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
    try {
      if (!item.id) {
        throw new Error('Item must have a unique id');
      }
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, item, { merge: true });
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
      await updateDoc(docRef, fields);
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
        if (!snapshot.empty) {
          const items: T[] = [];
          snapshot.forEach((docSnap) => {
            items.push({ ...docSnap.data(), id: docSnap.id } as T);
          });
          onData(items);
        }
      },
      (error) => {
        console.error(`[Firestore Listener Error] for '${collectionName}':`, error);
      }
    );
  }
}

export const dbService = new DBService();
