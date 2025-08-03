import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { StudentPeminjamanService } from '../../services/student-peminjaman.service';
import {
  Observable,
  filter,
  switchMap,
  BehaviorSubject,
  Subscription,
} from 'rxjs';
import { User } from '../../models/user.model';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import {
  PeminjamanDiminta,
  PeminjamanDisetujui,
  PeminjamanAktif,
  RiwayatPeminjaman,
} from '../../models/peminjaman.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, DatePipe, RouterLink, PaginationComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private studentPeminjamanService = inject(StudentPeminjamanService);

  readonly user$: Observable<User | null> = this.authService.currentUser$;
  peminjamanDiminta$!: Observable<PeminjamanDiminta[]>;
  peminjamanDisetujui$!: Observable<PeminjamanDisetujui[]>;
  peminjamanAktif$!: Observable<PeminjamanAktif[]>;

  allRiwayat: RiwayatPeminjaman[] = [];
  paginatedRiwayat: RiwayatPeminjaman[] = [];
  historyCurrentPage = 1;
  historyItemsPerPage = 10;
  historyTotalItems = 0;
  isHistoryLoading = true;
  private historySubscription!: Subscription;

  private refreshSignal$ = new BehaviorSubject<void>(undefined);

  ngOnInit(): void {
    const userLoggedIn$ = this.user$.pipe(
      filter((user): user is User => user !== null)
    );

    this.peminjamanDiminta$ = this.refreshSignal$.pipe(
      switchMap(() =>
        userLoggedIn$.pipe(
          switchMap((user) =>
            this.studentPeminjamanService.getPermintaanPeminjamanForUser(
              user.uid
            )
          )
        )
      )
    );

    this.peminjamanDisetujui$ = this.refreshSignal$.pipe(
      switchMap(() =>
        userLoggedIn$.pipe(
          switchMap((user) =>
            this.studentPeminjamanService.getBukuSiapDiambil(user.uid)
          )
        )
      )
    );

    this.peminjamanAktif$ = this.refreshSignal$.pipe(
      switchMap(() =>
        userLoggedIn$.pipe(
          switchMap((user) =>
            this.studentPeminjamanService.getBukuDipinjam(user.uid)
          )
        )
      )
    );

    const riwayat$ = this.refreshSignal$.pipe(
      switchMap(() =>
        userLoggedIn$.pipe(
          switchMap((user) =>
            this.studentPeminjamanService.getRiwayatPeminjaman(user.uid)
          )
        )
      )
    );
    this.historySubscription = riwayat$.subscribe((riwayat) => {
      this.allRiwayat = riwayat;
      this.historyTotalItems = this.allRiwayat.length;
      this.historyCurrentPage = 1;
      this.applyHistoryPagination();
      this.isHistoryLoading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.historySubscription) {
      this.historySubscription.unsubscribe();
    }
  }

  applyHistoryPagination(): void {
    const startIndex = (this.historyCurrentPage - 1) * this.historyItemsPerPage;
    const endIndex = startIndex + this.historyItemsPerPage;
    this.paginatedRiwayat = this.allRiwayat.slice(startIndex, endIndex);
  }

  onHistoryPageChanged(page: number): void {
    this.historyCurrentPage = page;
    this.applyHistoryPagination();
  }

  async onCancelRequest(docId: string): Promise<void> {
    if (confirm('Apakah Anda yakin ingin membatalkan permintaan ini?')) {
      await this.studentPeminjamanService.cancelLoanRequest(docId);
      this.refreshSignal$.next();
    }
  }
}
