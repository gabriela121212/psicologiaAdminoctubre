import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, CollectionReference} from '@angular/fire/firestore';
import { Storage, ref, getDownloadURL,uploadBytes } from '@angular/fire/storage';
import { doc, updateDoc,writeBatch, setDoc,getDocs } from '@angular/fire/firestore';
import { from,Observable,combineLatest,of,defaultIfEmpty } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface Question {
  options: string[];
  order: number;
  title: string;
  values: number[];
}

interface Category {
  id: string;
  title: string;
  colors: string[];
  order: number;
  questions?: Question[];
}



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



  fetchCategoriesWithQuestions(): Observable<Category[]> {
    const categoriesCollection = collection(this.firestore, 'categories') as CollectionReference<Category>;
    return collectionData(categoriesCollection, { idField: 'id' }).pipe(
      switchMap((categories: Category[]) => {
        if (!categories.length)return of([]); 

        const categoryObservables = categories.map((category) => {
          const questionsCollection = collection(this.firestore, `categories/${category.id}/questions`) as CollectionReference<Question>;
          return collectionData(questionsCollection, { idField: 'id' }).pipe(
            defaultIfEmpty([]),map((questions: Question[]) => ({...category,questions,}))
          );

        });
        return combineLatest(categoryObservables);
      })
    );
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


async  updateQuestions(documentId: string, newQuestions: Question[]) {
  try {
    const categoryDocRef = doc(this.firestore, 'categories', documentId);
    const questionsCollectionRef = collection(categoryDocRef, 'questions'); // Referencia a la colección 'questions' dentro del documento de categoría

    const batch = writeBatch(this.firestore);

    // Obtener los documentos existentes en la colección de 'questions'
    const snapshot = await getDocs(questionsCollectionRef);

    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref); // Borrar cada documento de la colección
    });

    // Agregar los nuevos documentos a la colección 'questions'
    newQuestions.forEach((question, index) => {
      const questionDocRef = doc(questionsCollectionRef, `question${index + 1}`); // Crear un nuevo documento con el nombre 'question1', 'question2', etc.
      batch.set(questionDocRef, question); // Añadir la pregunta a la operación en el batch
    });

    // Ejecutar la operación en batch
    await batch.commit().catch((error) => {
      console.error("Error en el batch commit:", error);
    });
    console.log('Colección de preguntas actualizada con éxito');
  } catch (error) {
    console.error('Error al actualizar las preguntas:', error);
  }
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


