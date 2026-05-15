import { Injectable } from '@angular/core';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, Timestamp, onSnapshot, QuerySnapshot, QueryDocumentSnapshot, serverTimestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface Couple {
  id?: string;
  ownerId: string;
  names: string;
  weddingDate?: string;
  time?: string;
  venue?: string;
  address?: string;
  message?: string;
  rsvpDeadline?: string;
  themeId?: string;
  themeConfig?: {
    primaryColor?: string;
    backgroundColor?: string;
    font?: string;
    coverImage?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Guest {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  groupName?: string;
  status: 'pending' | 'confirmed' | 'declined';
  companions?: number;
  dietaryNotes?: string;
  message?: string;
  openCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Gift {
  id?: string;
  name: string;
  category?: string;
  price?: number;
  store?: string;
  link?: string;
  reserved: boolean;
  reservedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  
  async createCouple(coupleId: string, data: Partial<Couple>) {
    try {
      const docRef = doc(db, 'couples', coupleId);
      await setDoc(docRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `couples/${coupleId}`);
    }
  }

  async updateCouple(coupleId: string, data: Partial<Couple>) {
    try {
      const docRef = doc(db, 'couples', coupleId);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `couples/${coupleId}`);
    }
  }

  getCouplesByOwner(ownerId: string): Observable<Couple[]> {
    return new Observable<Couple[]>(observer => {
      const q = query(collection(db, 'couples'), where('ownerId', '==', ownerId));
      return onSnapshot(q, (snapshot: QuerySnapshot) => {
        const couples = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as Couple));
        observer.next(couples);
      }, (error: Error) => {
        handleFirestoreError(error, OperationType.LIST, 'couples');
        observer.error(error);
      });
    });
  }

  async getCouple(coupleId: string): Promise<Couple | null> {
    try {
      const snap = await getDoc(doc(db, 'couples', coupleId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Couple;
      }
      return null;
    } catch (error) {
       handleFirestoreError(error, OperationType.GET, `couples/${coupleId}`);
       return null;
    }
  }

  getGuests(coupleId: string): Observable<Guest[]> {
    return new Observable<Guest[]>(observer => {
      const collRef = collection(db, 'couples', coupleId, 'guests');
      return onSnapshot(collRef, (snapshot: QuerySnapshot) => {
        const guests = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as Guest));
        observer.next(guests);
      }, (error: Error) => {
        handleFirestoreError(error, OperationType.LIST, `couples/${coupleId}/guests`);
        observer.error(error);
      });
    });
  }

  async addGuest(coupleId: string, guestId: string, guest: Partial<Guest>) {
    try {
      const docRef = doc(db, 'couples', coupleId, 'guests', guestId);
      await setDoc(docRef, { ...guest, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `couples/${coupleId}/guests/${guestId}`);
    }
  }

  async updateGuest(coupleId: string, guestId: string, guest: Partial<Guest>) {
    try {
      const docRef = doc(db, 'couples', coupleId, 'guests', guestId);
      await updateDoc(docRef, { ...guest, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `couples/${coupleId}/guests/${guestId}`);
    }
  }

  async deleteGuest(coupleId: string, guestId: string) {
    try {
      const docRef = doc(db, 'couples', coupleId, 'guests', guestId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `couples/${coupleId}/guests/${guestId}`);
    }
  }

  async getGuest(coupleId: string, guestId: string): Promise<Guest | null> {
    try {
      const snap = await getDoc(doc(db, 'couples', coupleId, 'guests', guestId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Guest;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `couples/${coupleId}/guests/${guestId}`);
      return null;
    }
  }

  getGifts(coupleId: string): Observable<Gift[]> {
    return new Observable<Gift[]>(observer => {
      const collRef = collection(db, 'couples', coupleId, 'gifts');
      return onSnapshot(collRef, (snapshot: QuerySnapshot) => {
        const gifts = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as Gift));
        observer.next(gifts);
      }, (error: Error) => {
        handleFirestoreError(error, OperationType.LIST, `couples/${coupleId}/gifts`);
        observer.error(error);
      });
    });
  }

  async addGift(coupleId: string, giftId: string, gift: Partial<Gift>) {
    try {
      const docRef = doc(db, 'couples', coupleId, 'gifts', giftId);
      await setDoc(docRef, { ...gift, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `couples/${coupleId}/gifts/${giftId}`);
    }
  }

  async updateGift(coupleId: string, giftId: string, gift: Partial<Gift>) {
    try {
      const docRef = doc(db, 'couples', coupleId, 'gifts', giftId);
      await updateDoc(docRef, { ...gift, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `couples/${coupleId}/gifts/${giftId}`);
    }
  }

  async deleteGift(coupleId: string, giftId: string) {
    try {
      const docRef = doc(db, 'couples', coupleId, 'gifts', giftId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `couples/${coupleId}/gifts/${giftId}`);
    }
  }
}
