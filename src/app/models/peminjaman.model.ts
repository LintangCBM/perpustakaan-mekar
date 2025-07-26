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
