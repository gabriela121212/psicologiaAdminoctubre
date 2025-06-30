import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, CollectionReference,onSnapshot} from '@angular/fire/firestore';
import { Storage, ref, getDownloadURL,uploadBytes } from '@angular/fire/storage';
import { doc, updateDoc,writeBatch, setDoc,getDocs,QueryDocumentSnapshot,DocumentData } from '@angular/fire/firestore';
import { from,Observable,combineLatest,of,defaultIfEmpty } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import {Usuario,SimpleExercise,ExpressiveExercise,GratitudeExercise,ExpressiveEntry,GratitudeEntry,CompletedExercises} from '@core/models/user.model';



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

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  order: number;
}

export interface Method {
  id: string;
  title: string;
  description: string;
  route: string;
  order: number;
  exercises: Exercise[];
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



  fetchCategoriesWithMethods(): Observable<Category[]> {
    const categoriesCollection = collection(this.firestore, 'categories') as CollectionReference<Category>;
    return collectionData(categoriesCollection, { idField: 'id' }).pipe(
      switchMap((categories: Category[]) => {
        if (!categories.length) return of([]);
  
        const categoryObservables = categories.map((category) => {
          const methodsCollection = collection(this.firestore, `categories/${category.id}/methods`) as CollectionReference<Method>;
          return collectionData(methodsCollection, { idField: 'id' }).pipe(
            switchMap((methods: Method[]) => {
              if (!methods.length) return of({ ...category, methods: [] });
  
              const methodObservables = methods.map((method) => {
                const exercisesCollection = collection(this.firestore, `categories/${category.id}/methods/${method.id}/exercises`) as CollectionReference<Exercise>;
                return collectionData(exercisesCollection, { idField: 'id' }).pipe(
                  defaultIfEmpty([]), // Si no hay ejercicios, se devuelve un array vacío
                  map((exercises: Exercise[]) => ({ ...method, exercises }))
                );
              });
  
              return combineLatest(methodObservables).pipe(
                map((methodsWithExercises) => ({ ...category, methods: methodsWithExercises }))
              );
            }),
            defaultIfEmpty({ ...category, methods: [] }) // Si no hay métodos, se devuelve un array vacío
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



async updateMethods(documentId: string, newQuestions: Method[]) {
  try {
    const categoryDocRef = doc(this.firestore, 'categories', documentId);
    const methodsCollectionRef = collection(categoryDocRef, 'methods'); // Referencia a la colección 'methods'

    const batch = writeBatch(this.firestore);

    // Obtener los documentos existentes en la colección 'methods' y eliminarlos
    const snapshot = await getDocs(methodsCollectionRef);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref); // Borrar cada documento de la colección
    });

    await batch.commit(); // Ejecutar la eliminación antes de agregar los nuevos documentos

    // Crear nuevos documentos en 'methods' y su subcolección 'exercises'
    for (const [index, method] of newQuestions.entries()) {
      const methodDocRef = doc(methodsCollectionRef, `tecnica${index + 1}`);
      
      // Crear el documento en 'methods' excluyendo 'exercises'
      const { exercises, ...methodData } = method; 
      await setDoc(methodDocRef, methodData);

      // Verificar si tiene ejercicios y agregarlos a la subcolección 'exercises'
      if (exercises && exercises.length > 0) {
        const exercisesCollectionRef = collection(methodDocRef, 'exercises');
        
        const batchExercises = writeBatch(this.firestore);
        
        exercises.forEach((exercise, exIndex) => {
          const exerciseDocRef = doc(exercisesCollectionRef, `ejercicio${exIndex + 1}`);
          batchExercises.set(exerciseDocRef, exercise);
        });

        await batchExercises.commit(); // Guardar todos los ejercicios en batch
      }
    }

    console.log('Colección de métodos y ejercicios actualizada con éxito');
  } catch (error) {
    console.error('Error al actualizar los métodos:', error);
  }
}


/////traer usuarios de firestore/////
    getAllUsersRealtime(): Observable<Usuario[]> {
    return new Observable((observer) => {
      const usersRef = collection(this.firestore, 'users');
      const unsubscribe = onSnapshot(usersRef, async (snapshot) => {

        // Procesar cada usuario en paralelo usando Promise.all
        const usuarioPromises = snapshot.docs.map(async (userDoc: QueryDocumentSnapshot<DocumentData>) => {
          const data = userDoc.data();
          const usuario: Usuario = {
            id: data['id'],
            displayName: data['displayName'] || 'Usuario sin nombre',
            email: data['email'],
            estado: data['estado'] || false,
            picture: data['picture'],
            resultados: data['resultados'] || {},
            completed_exercises: {},
          };

          const commentsRef = collection(userDoc.ref, 'comments');
          const commentsSnap = await getDocs(commentsRef);
          usuario.comments = {};

          if (!commentsSnap.empty) {
            for (const commentDoc of commentsSnap.docs) {
              const commentData = commentDoc.data();
              usuario.comments[commentDoc.id] = {
                comment: commentData['comment'],
                timestamp: commentData['timestamp']?.toDate?.() || null,
              };
            }
          }

          const completed: CompletedExercises = {};
          const completedExercisesRef = collection(userDoc.ref, 'completed_exercises');
          const completedSnap = await getDocs(completedExercisesRef);

          for (const exerciseDoc of completedSnap.docs) {
            const exerciseId = exerciseDoc.id;
            const exerciseData = exerciseDoc.data();
            if (exerciseId === 'ejercicio1' ||exerciseId === 'ejercicio2' || exerciseId === 'ejercicio3' || exerciseId === 'ejercicio4' || exerciseId === 'ejercicio5'){
                  completed[exerciseId as keyof Pick<CompletedExercises,'ejercicio1' | 'ejercicio2' | 'ejercicio3' | 'ejercicio4' | 'ejercicio5'>] = {
                    attempts: exerciseData['attempts'],
                    categoryId: exerciseData['categoryId'],
                    completed_at: exerciseData['completed_at']?.toDate?.() || null,
                    duration: exerciseData['duration'],
                    methodId: exerciseData['methodId'],
                    title: exerciseData['title'],
                 } as SimpleExercise;
              }

            if (exerciseId === 'expressive_tecnica3') {
              const entriesRef = collection(exerciseDoc.ref, 'entries');
              const entriesSnap = await getDocs(entriesRef);

              const entries: { [entryId: string]: ExpressiveEntry } = {};
              for (const entryDoc of entriesSnap.docs) {
                const entryData = entryDoc.data();
                entries[entryDoc.id] = {
                  content: entryData['content'],
                  created_at: entryData['created_at']?.toDate?.() || null,
                  duration: entryData['duration'],
                };
              }
              completed.expressive_tecnica3 = {
                attempts: exerciseData['attempts'],
                categoryId: exerciseData['categoryId'],
                created_at: exerciseData['created_at']?.toDate?.() || null,
                methodId: exerciseData['methodId'],
                title: exerciseData['title'],
                entries,
              };
            }

            if (exerciseId === 'gratitude_tecnica2') {
              const entriesRef = collection(exerciseDoc.ref, 'entries');
              const entriesSnap = await getDocs(entriesRef);

              const entries: { [entryId: string]: GratitudeEntry } = {};
              for (const entryDoc of entriesSnap.docs) {
                const entryData = entryDoc.data();
                entries[entryDoc.id] = {
                  created_at: entryData['created_at']?.toDate?.() || null,
                  duration: entryData['duration'],
                  gratitude_entries: entryData['gratitude_entries'] || [],
                };
              }

              completed.gratitude_tecnica2 = {
                attempts: exerciseData['attempts'],
                categoryId: exerciseData['categoryId'],
                created_at: exerciseData['created_at']?.toDate?.() || null,
                methodId: exerciseData['methodId'],
                title: exerciseData['title'],
                entries,
              };
            }
          }
          usuario.completed_exercises = completed;
          return usuario;
        });

          const usuariosFinales = await Promise.all(usuarioPromises);
          observer.next(usuariosFinales);
        });
      return () => unsubscribe();
    });
  }











  






  //multimedia//
  // Función para obtener la URL de la imagen en Firebase Storage
  getImageUrl(imageName: string): Observable<string> {
    const imageRef = ref(this.storage, `images/${imageName}`);
    return from(getDownloadURL(imageRef));
  }

  // Función para obtener la URL del audio en Firebase Storage
  getAudioUrl(audioName: string): Observable<string> {
    const audioRef = ref(this.storage, `audios/${audioName}`); // Ruta en Firebase
    return from(getDownloadURL(audioRef)); // Obtener URL del audio
  }

  getVideo(url: string): Observable<string> {
    if (!url) return of('');
    return this.http.get(url, { responseType: 'blob' }).pipe(
      switchMap(blob => {
        if (!blob) return of(''); 
        return of(URL.createObjectURL(blob));
      })
    );
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

   // Función para actualizar un audio en Firebase desde un HTMLAudioElement
   updateAudio(audioName: string, audioElement: HTMLAudioElement): Observable<void> {
    return new Observable(observer => {
      // Obtener la URL del audio
      fetch(audioElement.src).then(response => response.blob()) // Convertir a Blob
        .then(blob => {
          const audioFile = new File([blob], audioName, { type: blob.type }); // Convertir Blob a File
          const audioRef = ref(this.storage, `audios/${audioName}`); // Referencia en Firebase Storage

          // Subir archivo a Firebase
          uploadBytes(audioRef, audioFile)
            .then(() => {
              observer.next(); // Notificar que se completó
              observer.complete();
            })
            .catch(error => observer.error(error));
        })
        .catch(error => observer.error(error));
    });
  }



  //funcion para actualizar e insertar video al store//
  updateVideos(nuevosVideos: [string, number, File][]): Observable<void> {
    return new Observable(observer => {
      // Separar las tuplas en dos listas
      const insertar: [string, number, File][] = nuevosVideos.filter(([cadena]) => cadena === "nada");
      const actualizar: [string, number, File][] = nuevosVideos.filter(([cadena]) => cadena !== "nada");

      console.log("Videos a insertar:", insertar);
      console.log("Videos a actualizar:", actualizar);

      // Insertar videos nuevos
      const insertPromises = insertar.map(([_, __, file]) => {
        const videoRef = ref(this.storage, `videos/${file.name}`);
        return uploadBytes(videoRef, file);
      });

      // Actualizar videos existentes
      const updatePromises = actualizar.map(([url, __, file]) => {
        const filePath = this.extractStoragePath(url);
        if (!filePath) return Promise.resolve(); // Si no se pudo extraer el path, evitar error

        const videoRef = ref(this.storage, filePath);
        return uploadBytes(videoRef, file);
      });

      // Ejecutar todas las promesas en paralelo
      Promise.all([...insertPromises, ...updatePromises])
        .then(() => {
          console.log("Todos los videos han sido insertados/actualizados.");
          observer.next();
          observer.complete();
        })
        .catch(error => {
          console.error("Error al subir videos:", error);
          observer.error(error);
        });
    });
  }

  //funcion para extraer el nombre del video en el token//
  private extractStoragePath(url: string): string | null {
    const match = url.match(/%2F(.+?)\?alt=media/);
    return match ? `videos/${match[1]}` : null;
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


