import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Book } from '../models/book.model';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

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
          'assets/images/bumimanusia.jpg',
        categories: ['Novel', 'Fiksi', 'Sejarah'],
        description:
          'Bumi Manusia adalah novel karya Pramoedya Ananta Toer yang mengisahkan perjuangan seorang pemuda pribumi di masa penjajahan Belanda. Novel ini menggambarkan konflik sosial, politik, dan budaya yang terjadi pada masa itu.',
      },
      {
        id: 2,
        title: 'Laskar Pelangi',
        author: 'Andrea Hirata',
        coverImageUrl: 'assets/images/laskar.jpg',
        categories: ['Novel', 'Fiksi'],
        description:
          'Laskar Pelangi adalah novel yang menceritakan kisah inspiratif sekelompok anak-anak di Belitung yang berjuang untuk mendapatkan pendidikan. Novel ini mengangkat tema persahabatan, impian, dan perjuangan melawan ketidakadilan.',
      },
      {
        id: 3,
        title: 'Negeri 5 Menara',
        author: 'Ahmad Fuadi',
        coverImageUrl: 'assets/images/menara.jpg',
        categories: ['Novel', 'Religi'],
        description:
          'Negeri 5 Menara adalah novel yang mengisahkan perjalanan seorang santri di pesantren yang memiliki cita-cita tinggi. Novel ini mengajarkan tentang pentingnya pendidikan, persahabatan, dan kepercayaan diri dalam mencapai impian.',
      },
      {
        id: 4,
        title: 'Ayat-Ayat Cinta',
        author: 'Habiburrahman El Shirazy',
        coverImageUrl:
          'assets/images/ayatayatcinta.jpg',
        categories: ['Novel', 'Religi', 'Romantis'],
        description:
          'Ayat-Ayat Cinta adalah novel yang mengisahkan cinta seorang mahasiswa Indonesia di Mesir. Novel ini menggabungkan tema cinta, agama, dan budaya, serta menggambarkan konflik antara cinta dan tanggung jawab.',
      },
      {
        id: 5,
        title: 'Sang Pemimpi',
        author: 'Andrea Hirata',
        coverImageUrl: 'assets/images/pemimpi.jpg',
        categories: ['Novel', 'Fiksi'],
        description:
          'Sang Pemimpi adalah kelanjutan dari Laskar Pelangi yang menceritakan perjalanan hidup Ikal dan Arai dalam mengejar impian mereka. Novel ini mengisahkan tentang persahabatan, cinta, dan perjuangan untuk mencapai cita-cita.',
      },
      {
        id: 6,
        title: 'Perahu Kertas',
        author: 'Dee Lestari',
        coverImageUrl:
          'assets/images/perahu.jpg',
        categories: ['Novel', 'Romantis'],
        description:
          'Perahu Kertas adalah novel yang mengisahkan perjalanan cinta antara Kugy dan Keenan. Novel ini menggambarkan bagaimana cinta dapat mengubah hidup seseorang, serta pentingnya mengikuti kata hati dalam menentukan pilihan hidup.',
      },
      {
        id: 7,
        title: 'Ronggeng Dukuh Paruk',
        author: 'Ahmad Tohari',
        coverImageUrl:
          'assets/images/ronggeng.jpg',
        categories: ['Novel', 'Sejarah', 'Budaya'],
        description:
          'Ronggeng Dukuh Paruk adalah novel yang mengisahkan kehidupan seorang ronggeng di sebuah desa di Jawa Tengah. Novel ini menggambarkan konflik antara tradisi dan modernitas, serta bagaimana seni dan budaya dapat menjadi sarana untuk menyampaikan pesan sosial.',
      },
      {
        id: 8,
        title: 'Cantik Itu Luka',
        author: 'Eka Kurniawan',
        coverImageUrl: 'assets/images/cantik.jpg',
        categories: ['Novel', 'Fiksi'],
        description:
          'Cantik Itu Luka adalah novel yang mengisahkan kehidupan seorang perempuan cantik di sebuah desa di Jawa. Novel ini menggambarkan bagaimana kecantikan dapat menjadi kutukan, serta bagaimana masyarakat seringkali menilai seseorang hanya dari penampilan fisiknya.',
      },
      {
        id: 9,
        title: 'Ensiklopedia Anak Hebat Negara',
        author: 'Tim Penulis',
        coverImageUrl: 'assets/images/ensiklopedia.jpg',
        categories: ['Ensiklopedia', 'Anak'],
        description:
          'Ensiklopedia Anak Hebat adalah buku yang ditujukan untuk anak-anak, berisi informasi menarik dan edukatif tentang berbagai topik. Buku ini dirancang untuk memperluas pengetahuan anak-anak dan menginspirasi mereka untuk belajar lebih banyak tentang dunia di sekitar mereka.',
      },
      {
        id: 10,
        title: 'Jurnal Sains Populer Vol. 1',
        author: 'Ilmuwan Muda',
        coverImageUrl: 'assets/images/sains.jpg',
        categories: ['Jurnal', 'Sains'],
        description:
          'Jurnal Sains Populer Vol. 1 adalah kumpulan artikel ilmiah yang ditulis dengan bahasa yang mudah dipahami oleh masyarakat umum. Jurnal ini mencakup berbagai topik sains, teknologi, dan inovasi, serta bertujuan untuk meningkatkan pemahaman masyarakat tentang ilmu pengetahuan.',
      },
      {
        id: 11,
        title: 'Kisah Kancil dan Buaya',
        author: 'Anonim',
        coverImageUrl:
          'assets/images/kdb.jpg',
        categories: ['Cerita Rakyat', 'Anak', 'Fabel'],
        description:
          'Kisah Kancil dan Buaya adalah cerita rakyat yang mengisahkan kecerdikan Kancil dalam menghadapi Buaya yang licik. Cerita ini mengajarkan nilai-nilai moral seperti kecerdikan, keberanian, dan pentingnya berpikir sebelum bertindak.',
      },
      {
        id: 12,
        title: 'Dasar-dasar Kewirausahaan',
        author: 'Pengusaha Sukses',
        coverImageUrl:
          'assets/images/kwu.jpg',
        categories: ['Kewirausahaan', 'Bisnis'],
        description:
          'Dasar-dasar Kewirausahaan adalah buku yang membahas konsep dasar kewirausahaan, mulai dari ide bisnis, perencanaan, hingga pelaksanaan. Buku ini ditujukan bagi mereka yang ingin memulai usaha atau mengembangkan bisnis yang sudah ada.',
      },
      {
        id: 13,
        title: 'Si Pitung Superhero Betawi Asli',
        author: 'Soekanto S.A',
        coverImageUrl:
          'assets/images/pitung.jpg',
        categories: ['Cerita Rakyat', 'Anak'],
        description:
          'Si pitung superhero betawi asli menceritakan seorang ahli silat yang melawan penjajah belanda yang selalu menindas masyarakat miskin.',
      },
      {
        id: 14,
        title: 'Gadis Kecil Penjaga Bintang',
        author: 'Wikan Satriati',
        coverImageUrl:
          'assets/images/bintang.jpg',
        categories: ['Nasehat', 'Anak'],
        description:
          'Gadis kecil penjaga bintang menceritakan tentang doa untuk orangtua, doa belajar, serta ungkapan rasa syukur dan harapan dengan nuansa agama Islam.',
      },
      {
        id: 15,
        title: 'Si Katak yang Tergesa-Gesa',
        author: 'Rizki Ayu W.P, Junissa Bianda & tim',
        coverImageUrl:
          'assets/images/katak.jpg',
        categories: ['Fabel', 'Anak'],
        description:
          'Si Katak yang Tergesa-Gesa bercerita pada latar di sebuah hutan, hiduplah Katak yang selalu melompat tergesa-gesa, sampai mengganggu hewan-hewan lainnya.',
      },
      {
        id: 16,
        title: 'Aku Sayang Ayah',
        author: 'Eka Wardhana, M. Isnaeni',
        coverImageUrl:
          'assets/images/ayah.jpg',
        categories: ['Nasehat', 'Anak'],
        description:
          'Aku sayang ayah menceritakan tentang doa untuk orangtua, doa belajar, serta ungkapan rasa syukur dan harapan dengan nuansa agama Islam.',
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

  searchBooks(query: string): Observable<Book[]> {
    return this.books$.pipe(
      map((books) => {
        if (!query) {
          return books;
        }
        const lowerCaseQuery = query.toLowerCase();
        return books.filter(
          (book) =>
            book.title.toLowerCase().includes(lowerCaseQuery) ||
            book.author.toLowerCase().includes(lowerCaseQuery)
        );
      })
    );
  }

  getAllBooks(): Observable<Book[]> {
    return this.books$.asObservable();
  }

  getNewestBooks(limit: number): Observable<Book[]> {
    return this.books$.pipe(map((books) => books.slice(0, limit)));
  }

  getDaftarBukuPreview(limit: number): Observable<Book[]> {
    return this.books$.pipe(
      map((books) =>
        [...books]
          .sort((a, b) => a.title.localeCompare(b.title))
          .slice(0, limit)
      )
    );
  }

  getFavoriteBooks(): Observable<Book[]> {
    return this.books$.pipe(
      map((books) => books.filter((book) => book.isFavorite))
    );
  }

  requestToggleFavorite(bookId: string | number): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.toggleFavorite(bookId);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private toggleFavorite(bookId: string | number): void {
    const currentBooks = this.books$.getValue();
    const updatedBooks = currentBooks.map((book) => {
      if (book.id !== bookId) {
        return book;
      }
      return { ...book, isFavorite: !book.isFavorite };
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

  getBookById(bookId: string | number): Observable<Book | undefined> {
    const numericId =
      typeof bookId === 'number' ? bookId : parseInt(bookId, 10);
    return this.books$.pipe(
      map((books) => books.find((book) => book.id === numericId))
    );
  }
}
