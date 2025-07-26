import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PeminjamanService } from '../../services/peminjaman.service';
import { Observable, filter, switchMap } from 'rxjs';
import { User } from '../../models/user.model';
import {
  PeminjamanAktif,
  RiwayatPeminjaman,
} from '../../models/peminjaman.model';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private peminjamanService = inject(PeminjamanService);

  readonly user$: Observable<User | null> = this.authService.currentUser$;
  readonly peminjamanAktif$: Observable<PeminjamanAktif[]>;
  readonly riwayatPeminjaman$: Observable<RiwayatPeminjaman[]>;

  constructor() {
    this.peminjamanAktif$ = this.user$.pipe(
      filter((user): user is User => user !== null),
      switchMap((user) => this.peminjamanService.getBukuDipinjam(user.uid))
    );

    this.riwayatPeminjaman$ = this.user$.pipe(
      filter((user): user is User => user !== null),
      switchMap((user) => this.peminjamanService.getRiwayatPeminjaman(user.uid))
    );
  }
}
