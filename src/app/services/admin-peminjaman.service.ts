import {
  Injectable,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  PeminjamanDiminta,
  PeminjamanAktif,
  PeminjamanDoc,
  PeminjamanAdminView,
  PermintaanAdminView,
} from '../models/peminjaman.model';
import { Book } from '../models/book.model';
import { AuthService } from './auth.service';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  deleteDoc,
} from '@angular/fire/firestore';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminPeminjamanService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private peminjamanCollection = collection(this.firestore, 'peminjaman');
  private injector: Injector = inject(Injector);
  private userCache = new Map<string, User>();

  async approveLoanRequest(docId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, `peminjaman/${docId}`);
      await updateDoc(docRef, {
        status: 'dipinjam',
        tanggalPinjam: serverTimestamp(),
      });
    });
  }

  async rejectLoanRequest(docId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, `peminjaman/${docId}`);
      await deleteDoc(docRef);
    });
  }

  async markAsReturned(docId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, `peminjaman/${docId}`);
      await updateDoc(docRef, {
        status: 'dikembalikan',
        tanggalDikembalikan: serverTimestamp(),
      });
    });
  }

  private async enrichWithUserDetails<T extends { userId: string }>(
    peminjaman: T[]
  ): Promise<(T & { userName: string })[]> {
    const userIdsToFetch = [...new Set(peminjaman.map((p) => p.userId))];
    const usersToFetchFromDb = userIdsToFetch.filter(
      (id) => !this.userCache.has(id)
    );
    if (usersToFetchFromDb.length > 0) {
      const userPromises = usersToFetchFromDb.map((id) =>
        this.authService.getUserById(id)
      );
      const fetchedUsers = await Promise.all(userPromises);
      fetchedUsers.forEach((user) => {
        if (user) {
          this.userCache.set(user.uid, user);
        }
      });
    }
    return peminjaman.map((p) => ({
      ...p,
      userName: this.userCache.get(p.userId)?.nama || 'Nama Tidak Ditemukan',
    }));
  }

  getAllRequests(): Observable<PermintaanAdminView[]> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('status', '==', 'diminta'),
        orderBy('tanggalPermintaan', 'asc')
      );
      const data$: Observable<PeminjamanDiminta[]> = from(getDocs(q)).pipe(
        map((snapshot) =>
          snapshot.docs.map(
            (d) =>
              ({
                ...(d.data() as PeminjamanDoc),
                docId: d.id,
                tanggalPermintaan: d.data()['tanggalPermintaan'].toDate(),
              } as PeminjamanDiminta)
          )
        )
      );
      return data$.pipe(
        switchMap((permintaan) => this.enrichWithUserDetails(permintaan))
      );
    });
  }

  getAllActiveLoans(): Observable<PeminjamanAdminView[]> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('status', '==', 'dipinjam'),
        orderBy('tanggalPinjam', 'desc')
      );
      const data$: Observable<PeminjamanAktif[]> = from(getDocs(q)).pipe(
        map((snapshot) =>
          snapshot.docs.map((d) => {
            const data = d.data() as PeminjamanDoc;
            return {
              docId: d.id,
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
      return data$.pipe(
        switchMap((peminjaman) => this.enrichWithUserDetails(peminjaman))
      );
    });
  }
}
