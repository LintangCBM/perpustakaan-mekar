import {
  Injectable,
  Injector,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { Observable, from, map, of, switchMap, combineLatest } from 'rxjs';
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
  updateDoc,
  setDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private booksCollection = collection(this.firestore, 'books');
  private injector: Injector;

  constructor() {
    this.injector = inject(Injector);
  }

  private enrichBooksWithFavorites(
    books$: Observable<Book[]>
  ): Observable<Book[]> {
    return combineLatest([books$, this.getUserFavoriteIds()]).pipe(
      map(([books, favoriteIds]) =>
        books.map((book) => ({
          ...book,
          isFavorite: favoriteIds.has(book.id),
        }))
      )
    );
  }

  getAllBooks(): Observable<Book[]> {
    const allBooks$ = runInInjectionContext(this.injector, () =>
      from(
        getDocs(query(this.booksCollection, where('isArchived', '==', false)))
      ).pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as Book)))
    );
    return this.enrichBooksWithFavorites(allBooks$);
  }

  getBookById(bookId: string): Observable<Book | undefined> {
    const book$ = runInInjectionContext(this.injector, () => {
      const q = query(this.booksCollection, where('id', '==', bookId));
      return from(getDocs(q)).pipe(
        map((snapshot) => {
          if (snapshot.empty) return undefined;
          return snapshot.docs[0].data() as Book;
        })
      );
    });
    return this.enrichBooksWithFavorites(
      book$.pipe(map((b) => (b ? [b] : [])))
    ).pipe(map((books) => books[0]));
  }

  getNewestBooks(count: number): Observable<Book[]> {
    const books$ = runInInjectionContext(this.injector, () => {
      const q = query(
        this.booksCollection,
        where('isArchived', '==', false),
        orderBy('id', 'desc'),
        limit(count)
      );
      return from(getDocs(q)).pipe(
        map((snapshot) => snapshot.docs.map((doc) => doc.data() as Book))
      );
    });
    return this.enrichBooksWithFavorites(books$);
  }

  getDaftarBukuPreview(count: number): Observable<Book[]> {
    const books$ = runInInjectionContext(this.injector, () => {
      const q = query(
        this.booksCollection,
        where('isArchived', '==', false),
        orderBy('title'),
        limit(count)
      );
      return from(getDocs(q)).pipe(
        map((snapshot) => snapshot.docs.map((doc) => doc.data() as Book))
      );
    });
    return this.enrichBooksWithFavorites(books$);
  }

  getFavoriteBooks(): Observable<Book[]> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }
        return this.getUserFavoriteIds().pipe(
          switchMap((favoriteIds) => {
            const ids = Array.from(favoriteIds);
            if (ids.length === 0) return of([]);
            return runInInjectionContext(this.injector, () => {
              const q = query(this.booksCollection, where('id', 'in', ids));
              return from(getDocs(q)).pipe(
                map((bookSnapshot) =>
                  bookSnapshot.docs.map((doc) => ({
                    ...(doc.data() as Book),
                    isFavorite: true,
                  }))
                )
              );
            });
          })
        );
      })
    );
  }

  async requestToggleFavorite(bookId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
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
    });
  }

  private getUserFavoriteIds(): Observable<Set<string>> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user) {
          return of(new Set<string>());
        }
        return runInInjectionContext(this.injector, () => {
          const favoritesRef = collection(
            this.firestore,
            `users/${user.uid}/favorites`
          );
          return collectionData(favoritesRef).pipe(
            map(
              (favorites) =>
                new Set(favorites.map((fav) => fav['bookId'] as string))
            )
          );
        });
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

  async addBook(bookData: Omit<Book, 'id'>): Promise<string> {
    return runInInjectionContext(this.injector, async () => {
      const newId = Date.now().toString();
      const newBook: Book = { ...bookData, id: newId, isArchived: false };
      const docRef = doc(this.booksCollection, newId);
      await setDoc(docRef, newBook);
      return newId;
    });
  }

  async updateBook(bookId: string, bookData: Partial<Book>): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.booksCollection, bookId);
      await updateDoc(docRef, bookData);
    });
  }

  async archiveBook(bookId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.booksCollection, bookId);
      await updateDoc(docRef, { isArchived: true });
    });
  }
}
