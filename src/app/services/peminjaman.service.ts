import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  PeminjamanDiminta,
  PeminjamanAktif,
  RiwayatPeminjaman,
} from '../models/peminjaman.model';
import { Book } from '../models/book.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  deleteDoc,
} from '@angular/fire/firestore';

export interface PeminjamanAdminView extends PeminjamanAktif {
  userName: string;
}
export interface PermintaanAdminView extends PeminjamanDiminta {
  userName: string;
}

type PeminjamanStatus = 'diminta' | 'dipinjam' | 'dikembalikan';

interface PeminjamanDoc {
  userId: string;
  bookId: string;
  book: Book;
  status: PeminjamanStatus;
  tanggalPermintaan: any;
  tanggalPinjam?: any;
  tanggalDikembalikan?: any;
}

@Injectable({
  providedIn: 'root',
})
export class PeminjamanService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private peminjamanCollection = collection(this.firestore, 'peminjaman');

  getPermintaanPeminjamanForUser(
    userId: string
  ): Observable<PeminjamanDiminta[]> {
    const q = query(
      this.peminjamanCollection,
      where('userId', '==', userId),
      where('status', '==', 'diminta'),
      orderBy('tanggalPermintaan', 'asc')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data() as PeminjamanDoc;
          return {
            docId: doc.id,
            userId: data.userId,
            book: data.book,
            tanggalPermintaan: data.tanggalPermintaan.toDate(),
          };
        })
      )
    );
  }

  async approvePeminjaman(docId: string): Promise<void> {
    const docRef = doc(this.firestore, `peminjaman/${docId}`);
    await updateDoc(docRef, {
      status: 'dipinjam',
      tanggalPinjam: serverTimestamp(),
    });
  }

  async rejectPeminjaman(docId: string): Promise<void> {
    const docRef = doc(this.firestore, `peminjaman/${docId}`);
    await deleteDoc(docRef);
  }

  getBukuDipinjam(userId: string): Observable<PeminjamanAktif[]> {
    const q = query(
      this.peminjamanCollection,
      where('userId', '==', userId),
      where('status', '==', 'dipinjam')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data() as PeminjamanDoc;
          return {
            docId: doc.id,
            userId: data.userId,
            book: data.book,
            tanggalPinjam: data.tanggalPinjam.toDate(),
            tanggalKembali: new Date(
              data.tanggalPinjam.toDate().getTime() + 14 * 24 * 60 * 60 * 1000
            ),
          };
        })
      )
    );
  }

  getRiwayatPeminjaman(userId: string): Observable<RiwayatPeminjaman[]> {
    const q = query(
      this.peminjamanCollection,
      where('userId', '==', userId),
      where('status', '==', 'dikembalikan')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data() as PeminjamanDoc;
          return {
            docId: doc.id,
            userId: data.userId,
            book: data.book,
            tanggalPinjam: data.tanggalPinjam.toDate(),
            tanggalDikembalikan: data.tanggalDikembalikan.toDate(),
          };
        })
      )
    );
  }

  async pinjamBuku(user: User, book: Book): Promise<void> {
    const q = query(
      this.peminjamanCollection,
      where('userId', '==', user.uid),
      where('bookId', '==', book.id),
      where('status', 'in', ['diminta', 'dipinjam'])
    );

    const existingLoanSnapshot = await getDocs(q);
    if (!existingLoanSnapshot.empty) {
      throw new Error('Anda sudah meminta atau sedang meminjam buku ini.');
    }

    const newPeminjaman: Omit<
      PeminjamanDoc,
      'tanggalPinjam' | 'tanggalDikembalikan'
    > = {
      userId: user.uid,
      bookId: book.id,
      book,
      status: 'diminta',
      tanggalPermintaan: serverTimestamp(),
    };
    await addDoc(this.peminjamanCollection, newPeminjaman);
  }

  async tandaiSebagaiKembali(docId: string): Promise<void> {
    const docRef = doc(this.firestore, `peminjaman/${docId}`);
    await updateDoc(docRef, {
      status: 'dikembalikan',
      tanggalDikembalikan: serverTimestamp(),
    });
  }

  private async enrichPeminjamanWithUserDetails<T extends { userId: string }>(
    peminjaman: T[]
  ): Promise<(T & { userName: string })[]> {
    const userPromises = peminjaman.map((p) =>
      this.authService.getUserById(p.userId)
    );
    const users = await Promise.all(userPromises);

    return peminjaman.map((p, index) => ({
      ...p,
      userName: users[index]?.nama || 'Nama Tidak Ditemukan',
    }));
  }

  getSemuaPermintaan(): Observable<PermintaanAdminView[]> {
    const q = query(
      this.peminjamanCollection,
      where('status', '==', 'diminta'),
      orderBy('tanggalPermintaan', 'asc')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data() as PeminjamanDoc;
          return {
            docId: doc.id,
            userId: data.userId,
            book: data.book,
            tanggalPermintaan: data.tanggalPermintaan.toDate(),
          };
        })
      ),
      switchMap((permintaan) =>
        this.enrichPeminjamanWithUserDetails(permintaan)
      )
    );
  }

  getSemuaPeminjamanAktif(): Observable<PeminjamanAdminView[]> {
    const q = query(
      this.peminjamanCollection,
      where('status', '==', 'dipinjam'),
      orderBy('tanggalPinjam', 'desc')
    );
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data() as PeminjamanDoc;
          return {
            docId: doc.id,
            userId: data.userId,
            book: data.book,
            tanggalPinjam: data.tanggalPinjam.toDate(),
            tanggalKembali: new Date(
              data.tanggalPinjam.toDate().getTime() + 14 * 24 * 60 * 60 * 1000
            ),
          };
        })
      ),
      switchMap((peminjaman) =>
        this.enrichPeminjamanWithUserDetails(peminjaman)
      )
    );
  }
}
