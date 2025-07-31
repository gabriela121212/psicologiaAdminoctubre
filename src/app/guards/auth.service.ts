import { Injectable, inject } from '@angular/core';
import { Auth,authState,GoogleAuthProvider,signInWithPopup,signOut,user,User,} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { UserModel } from '@core/models/user.model';
import { firebaseConfig } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  isLoggedIn(): boolean {
    // Por ejemplo, revisa si hay token
    return !!localStorage.getItem('token');
  }



  user$: Observable<UserModel | null>;
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private http = inject(HttpClient);

  private firebaseFunctionsBaseUrl = firebaseConfig.firebaseFunctionsBaseUrl;

  private userToken: string | null = null;

  constructor() {
    this.user$ = authState(this.auth).pipe(
      map((user: User | null) => (user ? this.mapUser(user) : null))
    );
  }

  private mapUser(user: User): UserModel {
    return {
      uid: user.uid,
      displayName: user.displayName ?? 'Usuario desconocido',
      email: user.email,
      role: 'admin',
    };
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);

      if (credential.user) {
        await this.saveUserData(credential.user);
        this.userToken = await credential.user.getIdToken();
      }
    } catch (error) {
      throw error;
    }
  }

  private async saveUserData(user: User) {
    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      const userData = this.mapUser(user);
      await setDoc(userRef, userData);
    } else if (!(userSnapshot.data() as UserModel)?.role) {
      await setDoc(userRef, { role: 'user' }, { merge: true });
    }
  }

  getUserSession(): Observable<UserModel | null> {
    return authState(this.auth).pipe(
      switchMap((user) => {
        if (!user) {
          return of(null);
        }

        return from((user as User).getIdToken()).pipe(
          switchMap((token) => {
            const headers = new HttpHeaders({
              Authorization: `Bearer ${token}`,
            });

            return this.http.get<UserModel | null>(
              `${this.firebaseFunctionsBaseUrl}/getUserSession`,
              { headers, withCredentials: true }
            );
          })
        );
      })
    );
  }

  getUser(): Observable<User | null> {
    return user(this.auth);
  }
  async logout() {
    await signOut(this.auth);
    this.userToken = null;
  }
  
  
}
