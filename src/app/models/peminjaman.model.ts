import { Book } from './book.model';

export interface PeminjamanDiminta {
  docId: string;
  userId: string;
  book: Book;
  tanggalPermintaan: Date;
}

export interface PeminjamanDisetujui {
  docId: string;
  userId: string;
  book: Book;
  tanggalPersetujuan: Date;
}

export interface PeminjamanAktif {
  docId: string;
  userId: string;
  book: Book;
  tanggalPinjam: Date;
  tanggalKembali: Date;
  isOverdue?: boolean;
  jumlahPerpanjangan?: number;
}

export interface RiwayatPeminjaman {
  docId: string;
  userId: string;
  book: Book;
  tanggalPinjam: Date;
  tanggalDikembalikan: Date;
  wasReturnedLate?: boolean;
  denda?: number;
}

export interface PeminjamanAdminView extends PeminjamanAktif {
  userName: string;
  userEmail?: string;
  userTelepon?: string;
}
export interface PermintaanAdminView extends PeminjamanDiminta {
  userName: string;
  userEmail?: string;
  userTelepon?: string;
}
export interface RiwayatAdminView extends RiwayatPeminjaman {
  userName: string;
  userNisn?: number;
}

export interface PeminjamanDoc {
  userId: string;
  bookId: string;
  book: Book;
  status: 'diminta' | 'disetujui' | 'dipinjam' | 'dikembalikan';
  tanggalPermintaan: any;
  tanggalDisetujui?: any;
  tanggalPinjam?: any;
  tanggalKembali?: any;
  tanggalDikembalikan?: any;
  jumlahPerpanjangan?: number;
  denda: number;
}
