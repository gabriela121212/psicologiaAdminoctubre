import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Storage, ref, getDownloadURL,uploadBytes } from '@angular/fire/storage';
import { doc, updateDoc } from '@angular/fire/firestore';
import { from,Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root', 
})
export class FirestoreService {
  constructor(private firestore: Firestore, private storage: Storage, private http: HttpClient) {}

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

 
async updateTitles(titlesMap: Map<string, string>) {
  const promises: Promise<any>[] = []; 

  titlesMap.forEach((newTitle, id) => {
    const docRef = doc(this.firestore, 'categories', id);
    const updatePromise = updateDoc(docRef, { title: newTitle });
    promises.push(updatePromise); 
  });
  return Promise.all(promises)
    .then(() => {
      console.log('Todos los títulos han sido actualizados');
    })
    .catch((error) => {
      console.error('Error al actualizar los títulos:', error);
    });
}

async updateColors(colorsMap: Map<string, string[]>) {
  const promises: Promise<any>[] = []; 

  colorsMap.forEach((newColors, id) => {
    const docRef = doc(this.firestore, 'categories', id);
    const updatePromise = updateDoc(docRef, { colors: newColors });
    promises.push(updatePromise); 
  });

  return Promise.all(promises)
    .then(() => {
      console.log('Todos los colores han sido actualizados');
    })
    .catch((error) => {
      console.error('Error al actualizar los colores:', error);
    });
}

  //multimedia//
  // Función para obtener la URL de la imagen en Firebase Storage
  getImageUrl(imageName: string): Observable<string> {
    const imageRef = ref(this.storage, `images/${imageName}`);
    return from(getDownloadURL(imageRef));
  }

  // Función para obtener la imagen en base64
  getImageBase64(imageName: string): Observable<string> {
    return this.getImageUrl(imageName).pipe(
      switchMap((url) => this.http.get(url, { responseType: 'blob' })), // Descargar la imagen como Blob
      switchMap((blob) => this.blobToBase64(blob)) // Convertir Blob a base64
    );
  }

   // Función auxiliar para convertir Blob a base64
   private blobToBase64(blob: Blob): Observable<string> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        observer.next(reader.result as string);
        observer.complete();
      };
    });
  }

  ///////////////////////////////////////////////////
  // Función para actualizar la imagen en Firebase Storage
  updateImage(imageName: string, base64Image: string): Observable<any> {
    const imageRef = ref(this.storage,`images/${imageName}`);
    // Convertir la imagen base64 a Blob
    const blob = this.base64ToBlob(base64Image);
    // Subir la imagen a Firebase Storage
    return from(uploadBytes(imageRef, blob));
  }
  // Función auxiliar para convertir base64 a Blob
  private base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ua = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ua[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab]);
  }
}
