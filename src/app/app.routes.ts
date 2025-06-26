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
];
