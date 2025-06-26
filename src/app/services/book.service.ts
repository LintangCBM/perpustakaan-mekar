import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Book } from '../components/shared/book-card/book-card.component';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private books$ = new BehaviorSubject<Book[]>(
    [
      {
        id: 1,
        title: 'Bumi Manusia',
        author: 'Pramoedya Ananta Toer',
        // coverImageUrl: 'assets/images/bumi-manusia.jpg',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Novel+Fiksi+Sejarah',
        categories: ['Novel', 'Fiksi', 'Sejarah'],
      },
      {
        id: 2,
        title: 'Laskar Pelangi',
        author: 'Andrea Hirata',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Novel+Fiksi',
        categories: ['Novel', 'Fiksi'],
      },
      {
        id: 3,
        title: 'Negeri 5 Menara',
        author: 'Ahmad Fuadi',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Novel+Religi',
        categories: ['Novel', 'Religi'],
      },
      {
        id: 4,
        title: 'Ayat-Ayat Cinta',
        author: 'Habiburrahman El Shirazy',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Novel+Religi+Romantis',
        categories: ['Novel', 'Religi', 'Romantis'],
      },
      {
        id: 5,
        title: 'Sang Pemimpi',
        author: 'Andrea Hirata',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Novel+Fiksi',
        categories: ['Novel', 'Fiksi'],
        isFavorite: false,
      },
      {
        id: 6,
        title: 'Perahu Kertas',
        author: 'Dee Lestari',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Novel+Romantis',
        categories: ['Novel', 'Romantis'],
        isFavorite: false,
      },
      {
        id: 7,
        title: 'Ronggeng Dukuh Paruk',
        author: 'Ahmad Tohari',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Novel+Sejarah+Budaya',
        categories: ['Novel', 'Sejarah', 'Budaya'],
      },
      {
        id: 8,
        title: 'Cantik Itu Luka',
        author: 'Eka Kurniawan',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Novel+Fiksi',
        categories: ['Novel', 'Fiksi'],
      },
      {
        id: 9,
        title: 'Ensiklopedia Anak Hebat',
        author: 'Tim Penulis',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Ensiklopedia',
        categories: ['Ensiklopedia', 'Anak'],
      },
      {
        id: 10,
        title: 'Jurnal Sains Populer Vol. 1',
        author: 'Ilmuwan Muda',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Jurnal+Sains',
        categories: ['Jurnal', 'Sains'],
      },
      {
        id: 11,
        title: 'Kisah Kancil dan Buaya',
        author: 'Anonim',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Cerita+Rakyat+Anak+Fabel',
        categories: ['Cerita Rakyat', 'Anak', 'Fabel'],
      },
      {
        id: 12,
        title: 'Dasar-dasar Kewirausahaan',
        author: 'Pengusaha Sukses',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Kewirausahaan+Bisnis',
        categories: ['Kewirausahaan', 'Bisnis'],
      },
    ].sort((a, b) => (b.id as number) - (a.id as number))
  );

  constructor() {
    const currentBooks = this.books$.getValue().map((book) => {
      if (
        !book.coverImageUrl.startsWith('assets/images/') &&
        !book.coverImageUrl.includes('placehold.co')
      ) {
        book.coverImageUrl = `https://placehold.co/180x240/EEE/333?text=${encodeURIComponent(
          book.title
        )}`;
      }
      return {
        ...book,
        categories: book.categories || [],
        isFavorite: book.isFavorite || false,
      };
    });
    this.books$.next(currentBooks);
  }

  getAllBooks(): Observable<Book[]> {
    return this.books$.asObservable();
  }

  getNewestBooks(limit: number): Observable<Book[]> {
    return this.books$.pipe(
      map(books => books.slice(0, limit))
    );
  }

  getDaftarBukuPreview(limit: number): Observable<Book[]> {
    return this.books$.pipe(
      map(books => [...books].sort((a,b) => a.title.localeCompare(b.title)).slice(0, limit))
    );
  }

  getFavoriteBooks(): Observable<Book[]> {
    return this.books$.pipe(
      map((books) => books.filter((book) => book.isFavorite))
    );
  }

  toggleFavorite(bookId: string | number): void {
    const currentBooks = this.books$.getValue();
    const updatedBooks = currentBooks.map((book) => {
      if (book.id === bookId) {
        return { ...book, isFavorite: !book.isFavorite };
      }
      return book;
    });
    this.books$.next(updatedBooks);
  }

  getUniqueCategories(): Observable<string[]> {
    return this.books$.pipe(
      map((books) => {
        const allCats = new Set<string>();
        books.forEach((book) => {
          (book.categories || []).forEach((cat) => allCats.add(cat));
        });
        return Array.from(allCats).sort();
      })
    );
  }
}
