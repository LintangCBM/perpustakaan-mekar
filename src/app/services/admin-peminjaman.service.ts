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
  RiwayatAdminView,
  RiwayatPeminjaman,
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
  getCountFromServer,
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
        status: 'disetujui',
        tanggalDisetujui: serverTimestamp(),
      });
    });
  }

  async confirmPickup(docId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, `peminjaman/${docId}`);
      const tanggalPinjam = new Date();
      const tanggalKembali = new Date();
      tanggalKembali.setDate(tanggalPinjam.getDate() + 14);

      await updateDoc(docRef, {
        status: 'dipinjam',
        tanggalPinjam: serverTimestamp(),
        tanggalKembali: tanggalKembali,
      });
    });
  }

  async rejectLoanRequest(docId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, `peminjaman/${docId}`);
      await deleteDoc(docRef);
    });
  }

  async extendLoan(peminjaman: PeminjamanAdminView): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const MAX_EXTENSIONS = 1;
      if ((peminjaman.jumlahPerpanjangan || 0) >= MAX_EXTENSIONS) {
        throw new Error(`Buku ini sudah pernah diperpanjang.`);
      }
      if (peminjaman.isOverdue) {
        throw new Error(`Tidak dapat memperpanjang buku yang sudah terlambat.`);
      }
      const docRef = doc(this.firestore, `peminjaman/${peminjaman.docId}`);
      const newTanggalKembali = new Date(peminjaman.tanggalKembali);
      newTanggalKembali.setDate(newTanggalKembali.getDate() + 14);
      await updateDoc(docRef, {
        tanggalKembali: newTanggalKembali,
        jumlahPerpanjangan: (peminjaman.jumlahPerpanjangan || 0) + 1,
      });
    });
  }

  async markAsReturnedOnTime(docId: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, `peminjaman/${docId}`);
      await updateDoc(docRef, {
        status: 'dikembalikan',
        tanggalDikembalikan: serverTimestamp(),
        denda: 0,
      });
    });
  }

  async markAsReturned(
    peminjaman: PeminjamanAdminView,
    customDenda?: number
  ): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const docRef = doc(this.firestore, `peminjaman/${peminjaman.docId}`);
      const today = new Date();
      let dendaAmount = 0;
      if (customDenda !== undefined) {
        dendaAmount = customDenda;
      } else if (today > peminjaman.tanggalKembali) {
        dendaAmount = 2000;
      }
      await updateDoc(docRef, {
        status: 'dikembalikan',
        tanggalDikembalikan: serverTimestamp(),
        denda: dendaAmount,
      });
    });
  }

  private async enrichWithUserDetails<T extends { userId: string }>(
    peminjaman: T[]
  ): Promise<
    (T & { userName: string; userEmail?: string; userTelepon?: string })[]
  > {
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
    return peminjaman.map((p) => {
      const cachedUser = this.userCache.get(p.userId);
      return {
        ...p,
        userName: cachedUser?.nama || 'Nama Tidak Ditemukan',
        userEmail: cachedUser?.email,
        userTelepon: cachedUser?.telepon,
      };
    });
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
          snapshot.docs.map((d) => {
            const data = d.data() as PeminjamanDoc;
            return {
              docId: d.id,
              userId: data.userId,
              book: data.book,
              tanggalPermintaan: data.tanggalPermintaan?.toDate() ?? new Date(),
            };
          })
        )
      );
      return data$.pipe(
        switchMap((permintaan) => this.enrichWithUserDetails(permintaan))
      );
    });
  }

  getAllReadyForPickup(): Observable<PeminjamanAdminView[]> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('status', '==', 'disetujui'),
        orderBy('tanggalDisetujui', 'asc')
      );
      const data$: Observable<PeminjamanAktif[]> = from(getDocs(q)).pipe(
        map((snapshot) =>
          snapshot.docs.map((d) => {
            const data = d.data() as PeminjamanDoc;
            const tanggalDisetujui =
              data.tanggalDisetujui?.toDate() ?? new Date();
            return {
              docId: d.id,
              userId: data.userId,
              book: data.book,
              tanggalPinjam: tanggalDisetujui,
              tanggalKembali: new Date(
                tanggalDisetujui.getTime() + 7 * 24 * 60 * 60 * 1000
              ),
              jumlahPerpanjangan: data.jumlahPerpanjangan || 0,
            };
          })
        )
      );
      return data$.pipe(
        switchMap((peminjaman) => this.enrichWithUserDetails(peminjaman))
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
            const tanggalPinjam = data.tanggalPinjam?.toDate() ?? new Date();
            const tanggalKembali =
              data.tanggalKembali?.toDate() ??
              new Date(tanggalPinjam.getTime() + 14 * 24 * 60 * 60 * 1000);
            const isOverdue = new Date() > tanggalKembali;
            return {
              docId: d.id,
              userId: data.userId,
              book: data.book,
              tanggalPinjam: tanggalPinjam,
              tanggalKembali: tanggalKembali,
              isOverdue: isOverdue,
              jumlahPerpanjangan: data.jumlahPerpanjangan || 0,
            };
          })
        )
      );
      return data$.pipe(
        switchMap((peminjaman) => this.enrichWithUserDetails(peminjaman))
      );
    });
  }

  getAllOverdueLoans(): Observable<PeminjamanAdminView[]> {
    return runInInjectionContext(this.injector, () => {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const q = query(
        this.peminjamanCollection,
        where('status', '==', 'dipinjam'),
        where('tanggalPinjam', '<', fourteenDaysAgo)
      );
      const data$: Observable<PeminjamanAktif[]> = from(getDocs(q)).pipe(
        map((snapshot) =>
          snapshot.docs.map((d) => {
            const data = d.data() as PeminjamanDoc;
            const tanggalPinjam = data.tanggalPinjam?.toDate() ?? new Date();
            const tanggalKembali =
              data.tanggalKembali?.toDate() ??
              new Date(tanggalPinjam.getTime() + 14 * 24 * 60 * 60 * 1000);
            return {
              docId: d.id,
              userId: data.userId,
              book: data.book,
              tanggalPinjam: tanggalPinjam,
              tanggalKembali: tanggalKembali,
              isOverdue: true,
            };
          })
        )
      );
      return data$.pipe(
        switchMap((peminjaman) => this.enrichWithUserDetails(peminjaman))
      );
    });
  }

  getSemuaRiwayat(): Observable<RiwayatAdminView[]> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('status', '==', 'dikembalikan'),
        orderBy('tanggalDikembalikan', 'desc')
      );
      const data$: Observable<RiwayatPeminjaman[]> = from(getDocs(q)).pipe(
        map((snapshot) =>
          snapshot.docs.map((d) => {
            const data = d.data() as PeminjamanDoc;
            const tanggalPinjam = data.tanggalPinjam?.toDate() ?? new Date();
            const tanggalDikembalikan =
              data.tanggalDikembalikan?.toDate() ?? new Date();
            const deadline = new Date(
              tanggalPinjam.getTime() + 14 * 24 * 60 * 60 * 1000
            );
            const wasReturnedLate = tanggalDikembalikan > deadline;
            return {
              docId: d.id,
              userId: data.userId,
              book: data.book,
              tanggalPinjam: tanggalPinjam,
              tanggalDikembalikan: tanggalDikembalikan,
              wasReturnedLate: wasReturnedLate,
              denda: data.denda || 0,
            };
          })
        )
      );
      return data$.pipe(
        switchMap((riwayat) => this.enrichWithUserDetails(riwayat))
      );
    });
  }

  getPendingRequestCount(): Observable<number> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('status', '==', 'diminta')
      );
      return from(getCountFromServer(q)).pipe(
        map((snapshot) => snapshot.data().count)
      );
    });
  }

  getActiveLoanCount(): Observable<number> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('status', '==', 'dipinjam')
      );
      return from(getCountFromServer(q)).pipe(
        map((snapshot) => snapshot.data().count)
      );
    });
  }

  getOverdueLoanCount(): Observable<number> {
    return runInInjectionContext(this.injector, () => {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const q = query(
        this.peminjamanCollection,
        where('status', '==', 'dipinjam'),
        where('tanggalPinjam', '<', fourteenDaysAgo)
      );
      return from(getCountFromServer(q)).pipe(
        map((snapshot) => snapshot.data().count)
      );
    });
  }

  getHistoryCount(): Observable<number> {
    return runInInjectionContext(this.injector, () => {
      const q = query(
        this.peminjamanCollection,
        where('status', '==', 'dikembalikan')
      );
      return from(getCountFromServer(q)).pipe(
        map((snapshot) => snapshot.data().count)
      );
    });
  }
}
