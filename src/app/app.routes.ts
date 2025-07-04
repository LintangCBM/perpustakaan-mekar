import { Routes } from '@angular/router';
import { BerandaComponent } from './pages/beranda/beranda.component';

export const routes: Routes = [
  { path: '', redirectTo: 'beranda', pathMatch: 'full' },
  {
    path: 'beranda',
    loadComponent: () =>
      import('./pages/beranda/beranda.component').then(
        (m) => m.BerandaComponent
      ),
  },
  {
    path: 'daftar-buku',
    loadComponent: () =>
      import('./pages/daftar-buku/daftar-buku.component').then(
        (m) => m.DaftarBukuComponent
      ),
  },
  {
    path: 'favorit',
    loadComponent: () =>
      import('./pages/favorit/favorit.component').then(
        (m) => m.FavoritComponent
      ),
  },
  {
    path: 'buku/:id',
    loadComponent: () =>
      import('./pages/book-detail/book-detail.component').then(
        (m) => m.BookDetailComponent
      ),
  },
  {
    path: 'informasi',
    loadComponent: () =>
      import('./pages/informasi/informasi.component').then(
        (m) => m.InformasiComponent
      ),
  },
];
