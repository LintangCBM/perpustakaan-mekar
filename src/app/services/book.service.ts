import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
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
        descriprtion:
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

  getBookById(bookId: string | number): Observable<Book | undefined> {
    const numericId =
      typeof bookId === 'number' ? bookId : parseInt(bookId, 10);
    return this.books$.pipe(
      map((books) => books.find((book) => book.id === numericId))
    );
  }
}
