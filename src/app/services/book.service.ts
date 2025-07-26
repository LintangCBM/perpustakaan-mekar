import {
  Injectable,
  Injector,
  inject
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
  addDoc, updateDoc, deleteDoc, documentId
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
    const allBooks$ = from(getDocs(this.booksCollection)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data() as Book))
    );
    return this.enrichBooksWithFavorites(allBooks$);
  }

  getBookById(bookId: string): Observable<Book | undefined> {
    const q = query(this.booksCollection, where('id', '==', bookId));
    const book$ = from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) return undefined;
        return snapshot.docs[0].data() as Book;
      })
    );
    return this.enrichBooksWithFavorites(
      book$.pipe(map((b) => (b ? [b] : [])))
    ).pipe(map((books) => books[0]));
  }

  getNewestBooks(count: number): Observable<Book[]> {
    const q = query(this.booksCollection, orderBy('id', 'desc'), limit(count));
    const books$ = from(getDocs(q)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data() as Book))
    );
    return this.enrichBooksWithFavorites(books$);
  }

  getDaftarBukuPreview(count: number): Observable<Book[]> {
    const q = query(this.booksCollection, orderBy('title'), limit(count));
    const books$ = from(getDocs(q)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data() as Book))
    );
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
            const q = query(this.booksCollection, where('id', 'in', ids));
            return from(getDocs(q)).pipe(
              map((bookSnapshot) =>
                bookSnapshot.docs.map((doc) => ({
                  ...(doc.data() as Book),
                  isFavorite: true,
                }))
              )
            );
          })
        );
      })
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
        return collectionData(favoritesRef, { idField: 'id' }).pipe(
          map(
            (favorites) =>
              new Set(favorites.map((fav) => fav['bookId'] as string))
          )
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

  async addBook(bookData: Omit<Book, 'id'>): Promise<string> {
    const newId = Date.now().toString();
    const newBook: Book = { ...bookData, id: newId };
    const docRef = doc(this.booksCollection, newId);
    await addDoc(this.booksCollection, newBook);
    return newId;
  }

  async updateBook(bookId: string, bookData: Partial<Book>): Promise<void> {
    const q = query(this.booksCollection, where("id", "==", bookId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Book not found to update.");
    }
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, bookData);
  }

  async deleteBook(bookId: string): Promise<void> {
    const q = query(this.booksCollection, where("id", "==", bookId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Book not found to delete.");
    }
    const docRef = querySnapshot.docs[0].ref;
    await deleteDoc(docRef);
  }
}
