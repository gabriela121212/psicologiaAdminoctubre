import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  getUsers(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'id' }); 
  }
  getPublic(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'public');
    return collectionData(usersCollection, { idField: 'id' }); 
  }
  updateColor(documentId: string, newColor: number) {
    const docRef = doc(this.firestore, 'public', documentId);
    return updateDoc(docRef, {color: newColor});
  }
}
