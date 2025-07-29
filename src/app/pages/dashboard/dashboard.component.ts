import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { StudentPeminjamanService } from '../../services/student-peminjaman.service';
import { Observable, filter, switchMap, BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.model';
import {
  PeminjamanDiminta,
  PeminjamanAktif,
  RiwayatPeminjaman,
} from '../../models/peminjaman.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private studentPeminjamanService = inject(StudentPeminjamanService);

  readonly user$: Observable<User | null> = this.authService.currentUser$;
  peminjamanDiminta$!: Observable<PeminjamanDiminta[]>;
  peminjamanAktif$!: Observable<PeminjamanAktif[]>;
  riwayatPeminjaman$!: Observable<RiwayatPeminjaman[]>;

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

    this.peminjamanAktif$ = this.refreshSignal$.pipe(
      switchMap(() =>
        userLoggedIn$.pipe(
          switchMap((user) =>
            this.studentPeminjamanService.getBukuDipinjam(user.uid)
          )
        )
      )
    );

    this.riwayatPeminjaman$ = this.refreshSignal$.pipe(
      switchMap(() =>
        userLoggedIn$.pipe(
          switchMap((user) =>
            this.studentPeminjamanService.getRiwayatPeminjaman(user.uid)
          )
        )
      )
    );
  }

  async onCancelRequest(docId: string): Promise<void> {
    if (confirm('Apakah Anda yakin ingin membatalkan permintaan ini?')) {
      await this.studentPeminjamanService.cancelLoanRequest(docId);
      this.refreshSignal$.next();
    }
  }
}
