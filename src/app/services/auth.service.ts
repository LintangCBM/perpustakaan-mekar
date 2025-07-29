import {
  Injectable,
  Injector,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, of, firstValueFrom } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserRole } from '../models/user-role.enum';

import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  private injector: Injector;

  constructor() {
    this.injector = inject(Injector);
  }

  public currentUser$: Observable<User | null> = authState(this.auth).pipe(
    switchMap((firebaseUser) => {
      if (!firebaseUser) {
        return of(null);
      }
      return runInInjectionContext(this.injector, () => {
        const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);
        return from(getDoc(userDocRef)).pipe(
          map((docSnap) => {
            if (!docSnap.exists()) {
              console.error(
                `User document not found for uid: ${firebaseUser.uid}`
              );
              return null;
            }
            return docSnap.data() as User;
          }),
          catchError((error) => {
            console.error('Error fetching user document:', error);
            return of(null);
          })
        );
      });
    })
  );

  private formatEmail(nisn: string): string {
    return `${nisn}@sdngejayan.edu`;
  }

  async register(nama: string, nisn: string, password: string): Promise<User> {
    return runInInjectionContext(this.injector, async () => {
      const email = this.formatEmail(nisn);
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const newUser: User = {
        uid: userCredential.user.uid,
        nama,
        nisn,
        role: UserRole.Student,
      };
      await setDoc(doc(this.firestore, `users/${newUser.uid}`), newUser);
      return newUser;
    });
  }

  async login(nisn: string, password: string): Promise<User> {
    return runInInjectionContext(this.injector, async () => {
      const email = this.formatEmail(nisn);
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const userDoc = await getDoc(
        doc(this.firestore, `users/${userCredential.user.uid}`)
      );
      if (!userDoc.exists())
        throw new Error('User details not found in database.');
      return userDoc.data() as User;
    });
  }

  async logout(): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    });
  }

  getCurrentUser(): Promise<User | null> {
    return firstValueFrom(this.currentUser$);
  }

  async getUserById(uid: string): Promise<User | null> {
    return runInInjectionContext(this.injector, async () => {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const docSnap = await getDoc(userDocRef);
      return docSnap.exists() ? (docSnap.data() as User) : null;
    });
  }
}
