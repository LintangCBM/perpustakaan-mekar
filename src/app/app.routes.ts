import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth-guard';
import { adminGuard } from './shared/guards/admin-guard';
import { studentGuard } from './shared/guards/student-guard';

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
  {
    path: 'informasi/:slug',
    loadComponent: () =>
      import('./pages/info-detail/info-detail.component').then(
        (m) => m.InfoDetailComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'akun',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard, studentGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/books',
    loadComponent: () =>
      import(
        './pages/admin-book-management/admin-book-management.component'
      ).then((m) => m.AdminBookManagementComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/peminjaman',
    loadComponent: () =>
      import(
        './pages/admin-peminjaman-management/admin-peminjaman-management.component'
      ).then((m) => m.AdminPeminjamanManagementComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import(
        './pages/admin-user-management/admin-user-management.component'
      ).then((m) => m.AdminUserManagementComponent),
    canActivate: [authGuard, adminGuard],
  },
];
