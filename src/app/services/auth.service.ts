import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private users = new Map<string, User>();
  public readonly currentUser = this.currentUser$.asObservable();
  public get currentUserValue(): User | null {
    return this.currentUser$.getValue();
  }

  register(nama: string, nisn: string, password: string): Observable<User> {
    if (this.users.has(nisn)) {
      return throwError(
        () => new Error(`User with NISN "${nisn}" already exists.`)
      );
    }
    const newUser: User = {
      id: Date.now(),
      nama,
      nisn,
      password_DO_NOT_STORE_IN_PRODUCTION: password,
    };
    this.users.set(nisn, newUser);
    return of(newUser);
  }

  login(nisn: string, password: string): Observable<User> {
    const foundUser = this.users.get(nisn);
    if (
      foundUser &&
      foundUser.password_DO_NOT_STORE_IN_PRODUCTION === password
    ) {
      this.currentUser$.next(foundUser);
      return of(foundUser);
    }
    return throwError(() => new Error('NISN atau password salah.'));
  }

  logout(): void {
    this.currentUser$.next(null);
    this.router.navigate(['/login']);
  }
}
