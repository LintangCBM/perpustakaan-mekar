import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  iconSrc: string;
  iconAlt: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: true,
})
export class SidebarComponent {
  navItems: NavItem[] = [
    {
      label: 'Beranda',
      iconSrc: 'assets/icons/material-symbols_home-rounded.svg',
      iconAlt: 'Beranda',
      route: '/beranda',
    },
    {
      label: 'Daftar Buku',
      iconSrc: 'assets/icons/mdi_book-search.svg',
      iconAlt: 'Daftar Buku',
      route: '/daftar-buku',
    },
    {
      label: 'Favorit',
      iconSrc: 'assets/icons/mdi_book-heart.svg',
      iconAlt: 'Favorit',
      route: '/favorit',
    },
    {
      label: 'Peminjaman',
      iconSrc: 'assets/icons/mdi_book-plus.svg',
      iconAlt: 'Peminjaman',
      route: '/peminjaman',
    },
    {
      label: 'Pengembalian',
      iconSrc: 'assets/icons/mdi_book-sync.svg',
      iconAlt: 'Pengembalian',
      route: '/pengembalian',
    },
    {
      label: 'Informasi',
      iconSrc: 'assets/icons/mdi_book-alert.svg',
      iconAlt: 'Informasi',
      route: '/informasi',
    },
  ];
}
