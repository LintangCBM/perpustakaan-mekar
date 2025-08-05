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
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  orderBy,
  getCountFromServer,
} from '@angular/fire/firestore';

export interface RegistrationData {
  nama: string;
  nisn: string;
  password: string;
  email?: string;
  telepon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  private injector: Injector;
  private usersCollection = collection(this.firestore, 'users');

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

  async register(
    nama: string,
    nisn: number,
    password: string,
    email?: string,
    telepon?: string
  ): Promise<User> {
    return runInInjectionContext(this.injector, async () => {
      const systemEmail = `${nisn}@sdngejayan.edu`;
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        systemEmail,
        password
      );
      const newUser: User = {
        uid: userCredential.user.uid,
        nama,
        nisn,
        role: UserRole.Student,
        email: email || '',
        telepon: telepon || '',
      };
      await setDoc(doc(this.firestore, `users/${newUser.uid}`), newUser);
      return newUser;
    });
  }

  async loginStudent(nisn: number, password: string): Promise<User> {
    return runInInjectionContext(this.injector, async () => {
      const systemEmail = `${nisn}@sdngejayan.edu`;
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        systemEmail,
        password
      );
      const userDoc = await getDoc(
        doc(this.firestore, `users/${userCredential.user.uid}`)
      );
      if (!userDoc.exists())
        throw new Error('User details not found in database.');
      const user = userDoc.data() as User;
      if (user.isArchived) {
        await signOut(this.auth);
        throw {
          code: 'auth/account-archived',
          message: 'Akun ini telah dinonaktifkan dan tidak dapat diakses.',
        };
      }
      return user;
    });
  }

  async loginStaff(email: string, password: string): Promise<User> {
    return runInInjectionContext(this.injector, async () => {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const userDoc = await getDoc(
        doc(this.firestore, `users/${userCredential.user.uid}`)
      );
      if (!userDoc.exists()) throw new Error('User details not found.');
      const user = userDoc.data() as User;
      if (user.isArchived) {
        await signOut(this.auth);
        throw {
          code: 'auth/account-archived',
          message: 'Akun ini telah dinonaktifkan dan tidak dapat diakses.',
        };
      }
      if (user.role !== UserRole.Staff) {
        await signOut(this.auth);
        throw {
          code: 'auth/invalid-credential',
          message: 'Akun ini bukan akun staf.',
        };
      }
      return user;
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

  getAllUsers(): Observable<User[]> {
    return runInInjectionContext(this.injector, () => {
      const q = query(this.usersCollection, orderBy('nama'));
      return from(getDocs(q)).pipe(
        map((snapshot) => snapshot.docs.map((doc) => doc.data() as User))
      );
    });
  }

  async updateUserData(uid: string, data: Partial<User>): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const currentUser = await this.getCurrentUser();
      if (
        currentUser?.uid === uid &&
        data.role &&
        data.role !== currentUser.role
      ) {
        throw new Error('You cannot change your own role.');
      }

      const userDocRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userDocRef, data);
    });
  }

  async archiveUser(uid: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userDocRef, { isArchived: true });
    });
  }

  async unarchiveUser(uid: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userDocRef, { isArchived: false });
    });
  }

  getTotalUserCount(): Observable<number> {
    return runInInjectionContext(this.injector, () => {
      const q = query(this.usersCollection);
      return from(getCountFromServer(q)).pipe(
        map((snapshot) => snapshot.data().count)
      );
    });
  }
}
