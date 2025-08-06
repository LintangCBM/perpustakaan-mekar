import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AsyncPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  Observable,
  BehaviorSubject,
  switchMap,
  map,
  Subscription,
} from 'rxjs';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { AdminPeminjamanService } from '../../services/admin-peminjaman.service';
import {
  PeminjamanAdminView,
  PermintaanAdminView,
  RiwayatAdminView,
} from '../../models/peminjaman.model';

type AdminTab =
  | 'permintaan'
  | 'siap-diambil'
  | 'aktif'
  | 'terlambat'
  | 'riwayat';

@Component({
  selector: 'app-admin-peminjaman-management',
  imports: [AsyncPipe, RouterLink, DatePipe, CurrencyPipe, PaginationComponent],
  templateUrl: './admin-peminjaman-management.component.html',
  styleUrl: './admin-peminjaman-management.component.scss',
  standalone: true,
})
export class AdminPeminjamanManagementComponent implements OnInit, OnDestroy {
  private adminPeminjamanService = inject(AdminPeminjamanService);

  permintaan$!: Observable<PermintaanAdminView[]>;
  peminjamanSiapDiambil$!: Observable<PeminjamanAdminView[]>;
  peminjamanAktif$!: Observable<PeminjamanAdminView[]>;
  peminjamanTerlambat$!: Observable<PeminjamanAdminView[]>;
  riwayat$!: Observable<RiwayatAdminView[]>;

  activeTab: AdminTab = 'permintaan';

  allRiwayat: RiwayatAdminView[] = [];
  paginatedRiwayat: RiwayatAdminView[] = [];
  riwayatCurrentPage = 1;
  riwayatItemsPerPage = 10;
  riwayatTotalItems = 0;
  isHistoryLoading = true;
  private historySubscription!: Subscription;

  private refreshSignal$ = new BehaviorSubject<void>(undefined);

  onPrint(): void {
    window.print();
  }

  ngOnInit(): void {
    this.permintaan$ = this.refreshSignal$.pipe(
      switchMap(() => this.adminPeminjamanService.getAllRequests())
    );
    this.peminjamanSiapDiambil$ = this.refreshSignal$.pipe(
      switchMap(() => this.adminPeminjamanService.getAllReadyForPickup())
    );
    this.peminjamanAktif$ = this.refreshSignal$.pipe(
      switchMap(() => this.adminPeminjamanService.getAllActiveLoans()),
      map((loans) => loans.filter((loan) => !loan.isOverdue))
    );
    this.peminjamanTerlambat$ = this.refreshSignal$.pipe(
      switchMap(() => this.adminPeminjamanService.getAllOverdueLoans())
    );
    const riwayat$ = this.refreshSignal$.pipe(
      switchMap(() => this.adminPeminjamanService.getSemuaRiwayat())
    );
    this.historySubscription = riwayat$.subscribe((riwayat) => {
      this.allRiwayat = riwayat;
      this.riwayatTotalItems = this.allRiwayat.length;
      this.riwayatCurrentPage = 1;
      this.applyRiwayatPagination();
      this.isHistoryLoading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.historySubscription) {
      this.historySubscription.unsubscribe();
    }
  }

  applyRiwayatPagination(): void {
    const startIndex = (this.riwayatCurrentPage - 1) * this.riwayatItemsPerPage;
    const endIndex = startIndex + this.riwayatItemsPerPage;
    this.paginatedRiwayat = this.allRiwayat.slice(startIndex, endIndex);
  }

  onRiwayatPageChanged(page: number): void {
    this.riwayatCurrentPage = page;
    this.applyRiwayatPagination();
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

  async onConfirmPickup(docId: string): Promise<void> {
    await this.adminPeminjamanService.confirmPickup(docId);
    this.refreshSignal$.next();
  }

  async onCancelApproval(docId: string): Promise<void> {
    if (
      confirm(
        'Batalkan persetujuan untuk buku ini? Siswa harus mengajukan permintaan lagi.'
      )
    ) {
      await this.adminPeminjamanService.rejectLoanRequest(docId);
      this.refreshSignal$.next();
    }
  }

  async onExtend(peminjaman: PeminjamanAdminView): Promise<void> {
    try {
      await this.adminPeminjamanService.extendLoan(peminjaman);
      this.refreshSignal$.next();
      alert(
        `Batas waktu untuk buku "${peminjaman.book.title}" berhasil diperpanjang.`
      );
    } catch (error: any) {
      alert(`Gagal memperpanjang: ${error.message}`);
      console.error(error);
    }
  }

  async onReturnOnTime(peminjaman: PeminjamanAdminView): Promise<void> {
    if (
      confirm(
        `Tandai buku "${peminjaman.book.title}" sebagai telah dikembalikan?`
      )
    ) {
      await this.adminPeminjamanService.markAsReturnedOnTime(peminjaman.docId);
      this.refreshSignal$.next();
    }
  }

  async onReturn(peminjaman: PeminjamanAdminView): Promise<void> {
    const dendaStr = prompt(
      `Buku ini terlambat. Masukkan jumlah denda (biarkan kosong untuk denda standar Rp2000):`,
      '2000'
    );
    if (dendaStr === null) return;
    const customDenda = parseInt(dendaStr, 10);
    if (isNaN(customDenda)) {
      alert('Harap masukkan angka yang valid untuk denda.');
      return;
    }
    await this.adminPeminjamanService.markAsReturned(peminjaman, customDenda);
    this.refreshSignal$.next();
  }

  generateNotificationLink(peminjaman: PeminjamanAdminView): string {
    const userEmail = peminjaman.userEmail || '';
    const subject = `Pemberitahuan Keterlambatan Pengembalian Buku`;
    const body = `Yth. ${peminjaman.userName},

Kami informasikan bahwa buku yang Anda pinjam dengan judul "${
      peminjaman.book.title
    }" telah melewati batas waktu pengembalian pada tanggal ${peminjaman.tanggalKembali.toLocaleDateString(
      'id-ID'
    )}.

Mohon untuk segera mengembalikan buku tersebut. Terdapat denda keterlambatan yang berlaku.

Terima kasih.
Perpustakaan Mekar`;

    const gmailUrl = new URL('https://mail.google.com/mail/');
    gmailUrl.searchParams.append('view', 'cm');
    gmailUrl.searchParams.append('fs', '1');
    gmailUrl.searchParams.append('to', userEmail);
    gmailUrl.searchParams.append('su', subject);
    gmailUrl.searchParams.append('body', body);

    return gmailUrl.href;
  }
}
