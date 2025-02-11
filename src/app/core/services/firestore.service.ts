import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', 
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  getPublic(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'public');
    return collectionData(usersCollection, { idField: 'id' }); 
  }

  getTematicas(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'categories');
    return collectionData(usersCollection, { idField: 'id' }); 
  }

  updateColor(documentId: string, newColor: number) {
    const docRef = doc(this.firestore, 'public', documentId);
    return updateDoc(docRef, {color: newColor});
  }

  updateTitle(id: string, newTitle: string) {
    const docRef = doc(this.firestore, 'categories', id); 
    return updateDoc(docRef, { title: newTitle });
  }
}
