import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import {
  PeminjamanService,
  PeminjamanAdminView,
  PermintaanAdminView,
} from '../../services/peminjaman.service';

type AdminTab = 'permintaan' | 'aktif';

@Component({
  selector: 'app-admin-peminjaman-management',
  imports: [AsyncPipe, RouterLink, DatePipe],
  templateUrl: './admin-peminjaman-management.component.html',
  styleUrl: './admin-peminjaman-management.component.scss',
  standalone: true,
})
export class AdminPeminjamanManagementComponent implements OnInit {
  private peminjamanService = inject(PeminjamanService);

  permintaan$!: Observable<PermintaanAdminView[]>;
  peminjamanAktif$!: Observable<PeminjamanAdminView[]>;
  activeTab: AdminTab = 'permintaan';

  private refreshSignal$ = new BehaviorSubject<void>(undefined);

  ngOnInit(): void {
    this.permintaan$ = this.refreshSignal$.pipe(
      switchMap(() => this.peminjamanService.getSemuaPermintaan())
    );
    this.peminjamanAktif$ = this.refreshSignal$.pipe(
      switchMap(() => this.peminjamanService.getSemuaPeminjamanAktif())
    );
  }

  setActiveTab(tab: AdminTab): void {
    this.activeTab = tab;
  }

  async onApprove(docId: string): Promise<void> {
    await this.peminjamanService.approvePeminjaman(docId);
    this.refreshSignal$.next();
  }

  async onReject(docId: string): Promise<void> {
    if (confirm('Apakah Anda yakin ingin menolak permintaan ini?')) {
      await this.peminjamanService.rejectPeminjaman(docId);
      this.refreshSignal$.next();
    }
  }

  async onReturn(docId: string): Promise<void> {
    await this.peminjamanService.tandaiSebagaiKembali(docId);
    this.refreshSignal$.next();
  }
}
