import { Book } from './book.model';

export interface PeminjamanAktif {
  userId: number;
  book: Book;
  tanggalPinjam: Date;
  tanggalKembali: Date;
}

export interface RiwayatPeminjaman {
  userId: number;
  book: Book;
  tanggalPinjam: Date;
  tanggalDikembalikan: Date;
}
