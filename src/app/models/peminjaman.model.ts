import { Book } from './book.model';

export interface PeminjamanDiminta {
  docId: string;
  userId: string;
  book: Book;
  tanggalPermintaan: Date;
}

export interface PeminjamanAktif {
  docId: string;
  userId: string;
  book: Book;
  tanggalPinjam: Date;
  tanggalKembali: Date;
}

export interface RiwayatPeminjaman {
  docId: string;
  userId: string;
  book: Book;
  tanggalPinjam: Date;
  tanggalDikembalikan: Date;
}

export interface PeminjamanAdminView extends PeminjamanAktif {
  userName: string;
}
export interface PermintaanAdminView extends PeminjamanDiminta {
  userName: string;
}

export interface PeminjamanDoc {
  userId: string;
  bookId: string;
  book: Book;
  status: 'diminta' | 'dipinjam' | 'dikembalikan';
  tanggalPermintaan: any;
  tanggalPinjam?: any;
  tanggalDikembalikan?: any;
}
