import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, of, throwError } from 'rxjs';
import { PeminjamanAktif, RiwayatPeminjaman } from '../models/peminjaman.model';
import { Book } from '../models/book.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class PeminjamanService {
  private peminjamanAktif$ = new BehaviorSubject<
    Map<number, PeminjamanAktif[]>
  >(new Map());
  private riwayatPeminjaman$ = new BehaviorSubject<
    Map<number, RiwayatPeminjaman[]>
  >(new Map());

  getBukuDipinjam(userId: number): Observable<PeminjamanAktif[]> {
    return this.peminjamanAktif$.pipe(
      map((petaPeminjaman) => petaPeminjaman.get(userId) || [])
    );
  }

  getRiwayatPeminjaman(userId: number): Observable<RiwayatPeminjaman[]> {
    return this.riwayatPeminjaman$.pipe(
      map((petaRiwayat) => petaRiwayat.get(userId) || [])
    );
  }

  pinjamBuku(user: User, book: Book): Observable<PeminjamanAktif> {
    const petaPeminjamanSaatIni = this.peminjamanAktif$.getValue();
    const userPeminjaman = petaPeminjamanSaatIni.get(user.id) || [];

    if (userPeminjaman.some((p) => p.book.id === book.id)) {
      return throwError(() => new Error('Anda sudah meminjam buku ini.'));
    }

    const record: PeminjamanAktif = {
      userId: user.id,
      book,
      tanggalPinjam: new Date(),
      tanggalKembali: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    };

    const petaPeminjamanBaru = new Map(petaPeminjamanSaatIni);
    petaPeminjamanBaru.set(user.id, [...userPeminjaman, record]);
    this.peminjamanAktif$.next(petaPeminjamanBaru);

    return new Observable((subscriber) => subscriber.next(record));
  }

  kembalikanBuku(user: User, peminjaman: PeminjamanAktif): void {
    const petaPeminjamanAktifSaatIni = this.peminjamanAktif$.getValue();
    const petaPeminjamanAktifBaru = new Map(petaPeminjamanAktifSaatIni);
    const userPeminjamanAktif = petaPeminjamanAktifBaru.get(user.id) || [];

    const peminjamanDiperbarui = userPeminjamanAktif.filter(
      (p) => p.book.id !== peminjaman.book.id
    );
    petaPeminjamanAktifBaru.set(user.id, peminjamanDiperbarui);
    this.peminjamanAktif$.next(petaPeminjamanAktifBaru);

    const petaRiwayatSaatIni = this.riwayatPeminjaman$.getValue();
    const petaRiwayatBaru = new Map(petaRiwayatSaatIni);
    const userRiwayat = petaRiwayatBaru.get(user.id) || [];

    const recordRiwayat: RiwayatPeminjaman = {
      userId: user.id,
      book: peminjaman.book,
      tanggalPinjam: peminjaman.tanggalPinjam,
      tanggalDikembalikan: new Date(),
    };
    petaRiwayatBaru.set(user.id, [...userRiwayat, recordRiwayat]);
    this.riwayatPeminjaman$.next(petaRiwayatBaru);
  }
}
