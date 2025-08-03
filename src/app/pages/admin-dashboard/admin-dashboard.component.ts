import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/book.service';
import { AdminPeminjamanService } from '../../services/admin-peminjaman.service';

interface AdminStats {
  totalUsers: number;
  totalBooks: number;
  pendingRequests: number;
  activeLoans: number;
  overdueLoans: number;
  loanHistory: number;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  standalone: true,
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private bookService = inject(BookService);
  private adminPeminjamanService = inject(AdminPeminjamanService);
  stats$!: Observable<AdminStats>;

  ngOnInit(): void {
    this.stats$ = forkJoin({
      totalUsers: this.authService.getTotalUserCount(),
      totalBooks: this.bookService.getTotalBookCount(),
      pendingRequests: this.adminPeminjamanService.getPendingRequestCount(),
      activeLoans: this.adminPeminjamanService.getActiveLoanCount(),
      overdueLoans: this.adminPeminjamanService.getOverdueLoanCount(),
      loanHistory: this.adminPeminjamanService.getHistoryCount(),
    });
  }
}
