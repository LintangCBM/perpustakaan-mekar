import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, switchMap, from } from 'rxjs';
import { AdminPeminjamanService } from '../../services/admin-peminjaman.service';
import {
  PeminjamanAdminView,
  PermintaanAdminView,
} from '../../models/peminjaman.model';

type AdminTab = 'permintaan' | 'aktif';

@Component({
  selector: 'app-admin-peminjaman-management',
  imports: [AsyncPipe, RouterLink, DatePipe],
  templateUrl: './admin-peminjaman-management.component.html',
  styleUrl: './admin-peminjaman-management.component.scss',
  standalone: true,
})
export class AdminPeminjamanManagementComponent implements OnInit {
  private adminPeminjamanService = inject(AdminPeminjamanService);

  permintaan$!: Observable<PermintaanAdminView[]>;
  peminjamanAktif$!: Observable<PeminjamanAdminView[]>;
  activeTab: AdminTab = 'permintaan';

  private refreshSignal$ = new BehaviorSubject<void>(undefined);

  ngOnInit(): void {
    this.permintaan$ = this.refreshSignal$.pipe(
      switchMap(() => this.adminPeminjamanService.getAllRequests())
    );
    this.peminjamanAktif$ = this.refreshSignal$.pipe(
      switchMap(() => this.adminPeminjamanService.getAllActiveLoans())
    );
  }

  setActiveTab(tab: AdminTab): void {
    this.activeTab = tab;
  }

  async onApprove(docId: string): Promise<void> {
    await this.adminPeminjamanService.approveLoanRequest(docId);
    this.refreshSignal$.next();
  }

  async onReject(docId: string): Promise<void> {
    if (confirm('Apakah Anda yakin ingin menolak permintaan ini?')) {
      await this.adminPeminjamanService.rejectLoanRequest(docId);
      this.refreshSignal$.next();
    }
  }

  async onReturn(docId: string): Promise<void> {
    await this.adminPeminjamanService.markAsReturned(docId);
    this.refreshSignal$.next();
  }
}
