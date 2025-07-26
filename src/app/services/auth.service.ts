import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  from,
  of,
  throwError,
  firstValueFrom,
} from 'rxjs';
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

  public currentUser$: Observable<User | null> = authState(this.auth).pipe(
    switchMap((firebaseUser) => {
      if (!firebaseUser) {
        return of(null);
      }
      const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);
      return from(getDoc(userDocRef)).pipe(
        map((docSnap) => docSnap.data() as User)
      );
    })
  );
  onLogout: any;

  private formatEmail(nisn: string): string {
    return `${nisn}@sdngejayan.edu`;
  }

  async register(nama: string, nisn: string, password: string): Promise<User> {
    const email = this.formatEmail(nisn);
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );

    const userCount =
      (await getDoc(doc(this.firestore, 'meta/user-count'))).data()?.[
        'count'
      ] || 0;
    const role = userCount === 0 ? UserRole.Staff : UserRole.Student;

    const newUser: User = {
      uid: userCredential.user.uid,
      nama,
      nisn,
      role,
    };

    await setDoc(doc(this.firestore, `users/${newUser.uid}`), newUser);
    await setDoc(doc(this.firestore, 'meta/user-count'), {
      count: userCount + 1,
    });

    return newUser;
  }

  async login(nisn: string, password: string): Promise<User> {
    const email = this.formatEmail(nisn);
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );

    const userDoc = await getDoc(
      doc(this.firestore, `users/${userCredential.user.uid}`)
    );
    if (!userDoc.exists()) {
      throw new Error('User details not found in database.');
    }

    const user = userDoc.data() as User;
    return user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Promise<User | null> {
    return firstValueFrom(this.currentUser$);
  }
}
