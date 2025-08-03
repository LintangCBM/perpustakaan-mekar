import {
  Injectable,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  PeminjamanDiminta,
  PeminjamanDisetujui,
  PeminjamanAktif,
  PeminjamanDoc,
  RiwayatPeminjaman,
} from '../models/peminjaman.model';
import { Book } from '../models/book.model';
import { User } from '../models/user.model';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  orderBy,
  deleteDoc,
} from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class StudentPeminjamanService {
  private firestore: Firestore = inject(Firestore);
  private peminjamanCollection = collection(this.firestore, 'peminjaman');
  private injector: Injector = inject(Injector);

  getPermintaanPeminjamanForUser(
    userId: string
  ): Observable<PeminjamanDiminta[]> {
    return runInInjectionContext(this.injector, () => {
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
              tanggalPermintaan: data.tanggalPermintaan?.toDate() ?? new Date(),
            };
          })
        )
      );
    });
  }

  getBukuSiapDiambil(userId: string): Observable<PeminjamanDisetujui[]> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('userId', '==', userId),
        where('status', '==', 'disetujui'),
        orderBy('tanggalDisetujui', 'asc')
      );
      return from(getDocs(q)).pipe(
        map((snapshot) =>
          snapshot.docs.map((doc) => {
            const data = doc.data() as PeminjamanDoc;
            return {
              docId: doc.id,
              userId: data.userId,
              book: data.book,
              tanggalPersetujuan: data.tanggalDisetujui?.toDate() ?? new Date(),
            };
          })
        )
      );
    });
  }

  getBukuDipinjam(userId: string): Observable<PeminjamanAktif[]> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('userId', '==', userId),
        where('status', '==', 'dipinjam')
      );
      return from(getDocs(q)).pipe(
        map((snapshot) =>
          snapshot.docs.map((doc) => {
            const data = doc.data() as PeminjamanDoc;
            const tanggalPinjam = data.tanggalPinjam?.toDate() ?? new Date();
            const tanggalKembali = new Date(
              tanggalPinjam.getTime() + 14 * 24 * 60 * 60 * 1000
            );
            const today = new Date();
            const isOverdue = today > tanggalKembali;
            return {
              docId: doc.id,
              userId: data.userId,
              book: data.book,
              tanggalPinjam: tanggalPinjam,
              tanggalKembali: tanggalKembali,
              isOverdue: isOverdue,
            };
          })
        )
      );
    });
  }

  getRiwayatPeminjaman(userId: string): Observable<RiwayatPeminjaman[]> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('userId', '==', userId),
        where('status', '==', 'dikembalikan'),
        orderBy('tanggalDikembalikan', 'desc'),
      );
      return from(getDocs(q)).pipe(
        map((snapshot) =>
          snapshot.docs.map((doc) => {
            const data = doc.data() as PeminjamanDoc;
            const tanggalPinjam = data.tanggalPinjam?.toDate() ?? new Date();
            const tanggalDikembalikan =
              data.tanggalDikembalikan?.toDate() ?? new Date();
            const deadline = new Date(
              tanggalPinjam.getTime() + 14 * 24 * 60 * 60 * 1000
            );
            const wasReturnedLate = tanggalDikembalikan > deadline;
            return {
              docId: doc.id,
              userId: data.userId,
              book: data.book,
              tanggalPinjam: tanggalPinjam,
              tanggalDikembalikan: tanggalDikembalikan,
              wasReturnedLate: wasReturnedLate,
              denda: data.denda || 0,
            } as RiwayatPeminjaman;
          })
        )
      );
    });
  }

  async requestNewLoan(user: User, book: Book): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const q = query(
        this.peminjamanCollection,
        where('userId', '==', user.uid),
        where('bookId', '==', book.id),
        where('status', 'in', ['diminta', 'dipinjam'])
      );
      const existingLoanSnapshot = await getDocs(q);
      if (!existingLoanSnapshot.empty)
        throw new Error('Anda sudah meminta atau sedang meminjam buku ini.');
      const newPeminjaman: Omit<
        PeminjamanDoc,
        'tanggalPinjam' | 'tanggalDikembalikan'
      > = {
        userId: user.uid,
        bookId: book.id,
        book,
        status: 'diminta',
        tanggalPermintaan: serverTimestamp(),
        denda: 0,
      };
      await addDoc(this.peminjamanCollection, newPeminjaman);
    });
  }

  async cancelLoanRequest(docId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, `peminjaman/${docId}`);
      await deleteDoc(docRef);
    });
  }
}
