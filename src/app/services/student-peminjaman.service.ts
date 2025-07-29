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
  PeminjamanAktif,
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

interface PeminjamanDoc {
  userId: string;
  bookId: string;
  book: Book;
  status: 'diminta' | 'dipinjam' | 'dikembalikan';
  tanggalPermintaan: any;
  tanggalPinjam?: any;
  tanggalDikembalikan?: any;
}

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
          snapshot.docs.map(
            (doc) =>
              ({
                ...(doc.data() as PeminjamanDoc),
                docId: doc.id,
                tanggalPermintaan: doc.data()['tanggalPermintaan'].toDate(),
              } as PeminjamanDiminta)
          )
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
    });
  }

  getRiwayatPeminjaman(userId: string): Observable<RiwayatPeminjaman[]> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('userId', '==', userId),
        where('status', '==', 'dikembalikan')
      );
      return from(getDocs(q)).pipe(
        map((snapshot) =>
          snapshot.docs.map(
            (doc) =>
              ({
                ...(doc.data() as PeminjamanDoc),
                docId: doc.id,
                tanggalPinjam: doc.data()['tanggalPinjam'].toDate(),
                tanggalDikembalikan: doc.data()['tanggalDikembalikan'].toDate(),
              } as RiwayatPeminjaman)
          )
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
