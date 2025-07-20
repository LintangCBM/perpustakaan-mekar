import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { PeminjamanAktif, RiwayatPeminjaman } from '../models/peminjaman.model';
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
} from '@angular/fire/firestore';

interface PeminjamanDoc {
  userId: string;
  bookId: string;
  book: Book;
  status: 'dipinjam' | 'dikembalikan';
  tanggalPinjam: any;
  tanggalDikembalikan?: any;
}

@Injectable({
  providedIn: 'root',
})
export class PeminjamanService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private peminjamanCollection = collection(this.firestore, 'peminjaman');

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
      where("userId", "==", user.uid),
      where("bookId", "==", book.id),
      where("status", "==", "dipinjam")
    );

    const existingLoanSnapshot = await getDocs(q);
    if (!existingLoanSnapshot.empty) {
      throw new Error('Anda sudah meminjam buku ini.');
    }

    const newPeminjaman: Omit<PeminjamanDoc, 'tanggalDikembalikan'> = {
      userId: user.uid,
      bookId: book.id,
      book,
      status: 'dipinjam',
      tanggalPinjam: serverTimestamp()
    };
    await addDoc(this.peminjamanCollection, newPeminjaman);
  }

  async kembalikanBuku(peminjaman: PeminjamanAktif): Promise<void> {
    const docRef = doc(this.firestore, `peminjaman/${peminjaman.docId}`);
    await updateDoc(docRef, {
      status: 'dikembalikan',
      tanggalDikembalikan: serverTimestamp(),
    });
  }
}
