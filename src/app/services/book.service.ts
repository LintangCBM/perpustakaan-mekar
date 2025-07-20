import { Injectable, inject } from '@angular/core';
import {
  Observable,
  from,
  map,
  of,
  switchMap,
  combineLatest,
  BehaviorSubject,
} from 'rxjs';
import { Book } from '../models/book.model';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

import {
  Firestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  writeBatch,
  orderBy,
  limit,
  collectionData,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private booksCollection = collection(this.firestore, 'books');
  private refreshFavorites$ = new BehaviorSubject<void>(undefined);

  getAllBooks(): Observable<Book[]> {
    return this.refreshFavorites$.pipe(
      switchMap(() => {
        const allBooks$ = collectionData(this.booksCollection) as Observable<
          Book[]
        >;
        return combineLatest([allBooks$, this.getUserFavoriteIds()]).pipe(
          map(([books, favoriteIds]) =>
            books.map((book) => ({
              ...book,
              isFavorite: favoriteIds.has(book.id),
            }))
          )
        );
      })
    );
  }

  getBookById(bookId: string): Observable<Book | undefined> {
    return this.refreshFavorites$.pipe(
      switchMap(() => {
        const q = query(this.booksCollection, where('id', '==', bookId));
        const book$ = (collectionData(q) as Observable<Book[]>).pipe(
          map((results) => results[0])
        );
        return combineLatest([book$, this.getUserFavoriteIds()]).pipe(
          map(([book, favoriteIds]) => {
            if (!book) return undefined;
            return { ...book, isFavorite: favoriteIds.has(book.id) };
          })
        );
      })
    );
  }

  getNewestBooks(count: number): Observable<Book[]> {
    return this.refreshFavorites$.pipe(
      switchMap(() => {
        const q = query(
          this.booksCollection,
          orderBy('id', 'desc'),
          limit(count)
        );
        const books$ = collectionData(q) as Observable<Book[]>;
        return combineLatest([books$, this.getUserFavoriteIds()]).pipe(
          map(([books, favoriteIds]) =>
            books.map((book) => ({
              ...book,
              isFavorite: favoriteIds.has(book.id),
            }))
          )
        );
      })
    );
  }

  getDaftarBukuPreview(count: number): Observable<Book[]> {
    return this.refreshFavorites$.pipe(
      switchMap(() => {
        const q = query(this.booksCollection, orderBy('title'), limit(count));
        const books$ = collectionData(q) as Observable<Book[]>;
        return combineLatest([books$, this.getUserFavoriteIds()]).pipe(
          map(([books, favoriteIds]) =>
            books.map((book) => ({
              ...book,
              isFavorite: favoriteIds.has(book.id),
            }))
          )
        );
      })
    );
  }

  getFavoriteBooks(): Observable<Book[]> {
    return this.refreshFavorites$.pipe(
      switchMap(() => this.authService.currentUser$),
      switchMap((user) => {
        if (!user) {
          return of([]);
        }
        const favoritesRef = collection(
          this.firestore,
          `users/${user.uid}/favorites`
        );
        return (
          collectionData(favoritesRef) as Observable<{ bookId: string }[]>
        ).pipe(
          map((favs) => favs.map((fav) => fav.bookId)),
          switchMap((favoriteIds) => {
            if (favoriteIds.length === 0) {
              return of([]);
            }
            const q = query(
              this.booksCollection,
              where('id', 'in', favoriteIds)
            );
            return (collectionData(q) as Observable<Book[]>).pipe(
              map((books) =>
                books.map((book) => ({ ...book, isFavorite: true }))
              )
            );
          })
        );
      })
    );
  }

  async searchBooks(searchTerm: string): Promise<Book[]> {
    if (!searchTerm) {
      return [];
    }
    const snapshot = await getDocs(this.booksCollection);
    const books = snapshot.docs.map((doc) => doc.data() as Book);
    const lowerCaseTerm = searchTerm.toLowerCase();

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerCaseTerm) ||
        book.author.toLowerCase().includes(lowerCaseTerm)
    );
  }

  async requestToggleFavorite(bookId: string): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const favoriteRef = doc(
      this.firestore,
      `users/${user.uid}/favorites/${bookId}`
    );
    const favoriteDoc = await getDoc(favoriteRef);
    const batch = writeBatch(this.firestore);

    if (favoriteDoc.exists()) {
      batch.delete(favoriteRef);
    } else {
      batch.set(favoriteRef, { bookId: bookId });
    }
    await batch.commit();
    this.refreshFavorites$.next();
  }

  private getUserFavoriteIds(): Observable<Set<string>> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user) {
          return of(new Set<string>());
        }
        const favoritesRef = collection(
          this.firestore,
          `users/${user.uid}/favorites`
        );
        return (
          collectionData(favoritesRef) as Observable<{ bookId: string }[]>
        ).pipe(map((favs) => new Set(favs.map((fav) => fav.bookId))));
      })
    );
  }
}
