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
  private authService = inject(AuthService);
  private router = inject(Router);
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
        description:
          'Bumi Manusia adalah novel karya Pramoedya Ananta Toer yang mengisahkan perjuangan seorang pemuda pribumi di masa penjajahan Belanda. Novel ini menggambarkan konflik sosial, politik, dan budaya yang terjadi pada masa itu.',
      },
      {
        id: 2,
        title: 'Laskar Pelangi',
        author: 'Andrea Hirata',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Novel+Fiksi',
        categories: ['Novel', 'Fiksi'],
        description:
          'Laskar Pelangi adalah novel yang menceritakan kisah inspiratif sekelompok anak-anak di Belitung yang berjuang untuk mendapatkan pendidikan. Novel ini mengangkat tema persahabatan, impian, dan perjuangan melawan ketidakadilan.',
      },
      {
        id: 3,
        title: 'Negeri 5 Menara',
        author: 'Ahmad Fuadi',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Novel+Religi',
        categories: ['Novel', 'Religi'],
        description:
          'Negeri 5 Menara adalah novel yang mengisahkan perjalanan seorang santri di pesantren yang memiliki cita-cita tinggi. Novel ini mengajarkan tentang pentingnya pendidikan, persahabatan, dan kepercayaan diri dalam mencapai impian.',
      },
      {
        id: 4,
        title: 'Ayat-Ayat Cinta',
        author: 'Habiburrahman El Shirazy',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Novel+Religi+Romantis',
        categories: ['Novel', 'Religi', 'Romantis'],
        description:
          'Ayat-Ayat Cinta adalah novel yang mengisahkan cinta seorang mahasiswa Indonesia di Mesir. Novel ini menggabungkan tema cinta, agama, dan budaya, serta menggambarkan konflik antara cinta dan tanggung jawab.',
      },
      {
        id: 5,
        title: 'Sang Pemimpi',
        author: 'Andrea Hirata',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Novel+Fiksi',
        categories: ['Novel', 'Fiksi'],
        description:
          'Sang Pemimpi adalah kelanjutan dari Laskar Pelangi yang menceritakan perjalanan hidup Ikal dan Arai dalam mengejar impian mereka. Novel ini mengisahkan tentang persahabatan, cinta, dan perjuangan untuk mencapai cita-cita.',
      },
      {
        id: 6,
        title: 'Perahu Kertas',
        author: 'Dee Lestari',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Novel+Romantis',
        categories: ['Novel', 'Romantis'],
        description:
          'Perahu Kertas adalah novel yang mengisahkan perjalanan cinta antara Kugy dan Keenan. Novel ini menggambarkan bagaimana cinta dapat mengubah hidup seseorang, serta pentingnya mengikuti kata hati dalam menentukan pilihan hidup.',
      },
      {
        id: 7,
        title: 'Ronggeng Dukuh Paruk',
        author: 'Ahmad Tohari',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Novel+Sejarah+Budaya',
        categories: ['Novel', 'Sejarah', 'Budaya'],
        description:
          'Ronggeng Dukuh Paruk adalah novel yang mengisahkan kehidupan seorang ronggeng di sebuah desa di Jawa Tengah. Novel ini menggambarkan konflik antara tradisi dan modernitas, serta bagaimana seni dan budaya dapat menjadi sarana untuk menyampaikan pesan sosial.',
      },
      {
        id: 8,
        title: 'Cantik Itu Luka',
        author: 'Eka Kurniawan',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Novel+Fiksi',
        categories: ['Novel', 'Fiksi'],
        description:
          'Cantik Itu Luka adalah novel yang mengisahkan kehidupan seorang perempuan cantik di sebuah desa di Jawa. Novel ini menggambarkan bagaimana kecantikan dapat menjadi kutukan, serta bagaimana masyarakat seringkali menilai seseorang hanya dari penampilan fisiknya.',
      },
      {
        id: 9,
        title: 'Ensiklopedia Anak Hebat',
        author: 'Tim Penulis',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Ensiklopedia',
        categories: ['Ensiklopedia', 'Anak'],
        description:
          'Ensiklopedia Anak Hebat adalah buku yang ditujukan untuk anak-anak, berisi informasi menarik dan edukatif tentang berbagai topik. Buku ini dirancang untuk memperluas pengetahuan anak-anak dan menginspirasi mereka untuk belajar lebih banyak tentang dunia di sekitar mereka.',
      },
      {
        id: 10,
        title: 'Jurnal Sains Populer Vol. 1',
        author: 'Ilmuwan Muda',
        coverImageUrl: 'https://placehold.co/180x240/DDD/555?text=Jurnal+Sains',
        categories: ['Jurnal', 'Sains'],
        description:
          'Jurnal Sains Populer Vol. 1 adalah kumpulan artikel ilmiah yang ditulis dengan bahasa yang mudah dipahami oleh masyarakat umum. Jurnal ini mencakup berbagai topik sains, teknologi, dan inovasi, serta bertujuan untuk meningkatkan pemahaman masyarakat tentang ilmu pengetahuan.',
      },
      {
        id: 11,
        title: 'Kisah Kancil dan Buaya',
        author: 'Anonim',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Cerita+Rakyat+Anak+Fabel',
        categories: ['Cerita Rakyat', 'Anak', 'Fabel'],
        description:
          'Kisah Kancil dan Buaya adalah cerita rakyat yang mengisahkan kecerdikan Kancil dalam menghadapi Buaya yang licik. Cerita ini mengajarkan nilai-nilai moral seperti kecerdikan, keberanian, dan pentingnya berpikir sebelum bertindak.',
      },
      {
        id: 12,
        title: 'Dasar-dasar Kewirausahaan',
        author: 'Pengusaha Sukses',
        coverImageUrl:
          'https://placehold.co/180x240/DDD/555?text=Kewirausahaan+Bisnis',
        categories: ['Kewirausahaan', 'Bisnis'],
        description:
          'Dasar-dasar Kewirausahaan adalah buku yang membahas konsep dasar kewirausahaan, mulai dari ide bisnis, perencanaan, hingga pelaksanaan. Buku ini ditujukan bagi mereka yang ingin memulai usaha atau mengembangkan bisnis yang sudah ada.',
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
