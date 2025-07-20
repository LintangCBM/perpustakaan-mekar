import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/user-role.enum';
import { map, Observable } from 'rxjs';
import { User } from '../../../models/user.model';

interface NavItem {
  label: string;
  iconSrc: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: true,
})
export class SidebarComponent {
  private authService = inject(AuthService);
  readonly navItems$: Observable<NavItem[]>;

  constructor() {
    this.navItems$ = this.authService.currentUser$.pipe(
      map((user) => this._buildNavItemsForUser(user))
    );
  }

  private _buildNavItemsForUser(user: User | null): NavItem[] {
    if (!user) {
      return this._getGuestNavItems();
    }

    switch (user.role) {
      case UserRole.Staff:
        return this._getStaffNavItems();
      case UserRole.Student:
        return this._getStudentNavItems();
      default:
        return this._getGuestNavItems();
    }
  }

  private _getGuestNavItems(): NavItem[] {
    return [
      {
        label: 'Beranda',
        iconSrc: 'assets/icons/material-symbols_home-rounded.svg',
        route: '/beranda',
      },
      {
        label: 'Daftar Buku',
        iconSrc: 'assets/icons/mdi_book-search.svg',
        route: '/daftar-buku',
      },
      {
        label: 'Informasi',
        iconSrc: 'assets/icons/mdi_book-alert.svg',
        route: '/informasi',
      },
    ];
  }

  private _getStudentNavItems(): NavItem[] {
    return [
      ...this._getGuestNavItems(),
      {
        label: 'Favorit',
        iconSrc: 'assets/icons/mdi_book-heart.svg',
        route: '/favorit',
      },
      {
        label: 'Status Peminjaman',
        iconSrc: 'assets/icons/mdi_book-sync.svg',
        route: '/akun',
      },
    ];
  }

  private _getStaffNavItems(): NavItem[] {
    return [
      ...this._getStudentNavItems(),
      {
        label: 'Panel Admin',
        iconSrc: 'assets/icons/mdi_book-account.svg',
        route: '/admin',
      },
    ];
  }
}
