import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { firebaseConfig } from './environments/environment';

export const firebaseProviders = [
  provideFirebaseApp(() => initializeApp(firebaseConfig.firebase)),
  provideAuth(() => getAuth()),
  provideFirestore(() => getFirestore()),
];
