import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { AsyncPipe } from '@angular/common';
import { UserRole } from '../../../models/user-role.enum';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule, AsyncPipe, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  logoUrl = 'assets/images/logo.png';
  user$: Observable<User | null> = this.authService.currentUser$;
  readonly UserRole = UserRole;

  isProfileModalOpen = false;
  profileForm: FormGroup;
  currentUser: User | null = null;

  @Output() menuToggled = new EventEmitter<void>();

  constructor() {
    this.profileForm = this.fb.group({
      nama: ['', Validators.required],
      nisn: [{ value: '', disabled: true }],
      email: ['', Validators.email],
      telepon: ['', [Validators.pattern('^[0-9+-\\s()]*$')]],
    });
    this.user$.subscribe((user) => (this.currentUser = user));
  }

  onSearchSubmit(event: Event, searchInput: HTMLInputElement): void {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      this.router.navigate(['/daftar-buku'], {
        queryParams: { q: searchTerm },
      });
    }
  }

  onLogout(): void {
    this.authService.logout();
  }

  openProfileModal(): void {
    if (!this.currentUser) return;

    this.profileForm.patchValue({
      nama: this.currentUser.nama,
      nisn: this.currentUser.nisn,
      email: this.currentUser.email,
      telepon: this.currentUser.telepon,
    });
    this.isProfileModalOpen = true;
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false;
  }

  async onProfileSubmit(): Promise<void> {
    if (this.profileForm.invalid || !this.currentUser) return;

    try {
      await this.authService.updateUserData(this.currentUser.uid, {
        nama: this.profileForm.value.nama,
        email: this.profileForm.value.email,
        telepon: this.profileForm.value.telepon,
      });
      alert('Profil berhasil diperbarui!');
      this.closeProfileModal();
      window.location.reload();
    } catch (error) {
      alert('Gagal memperbarui profil.');
      console.error(error);
    }
  }

  async onDeleteMyAccount(): Promise<void> {
    if (!this.currentUser) return;
    if (
      confirm(
        'Apakah Anda yakin ingin menghapus akun Anda? Anda tidak akan bisa masuk lagi setelah ini.'
      )
    ) {
      try {
        await this.authService.archiveUser(this.currentUser.uid);
        alert('Akun Anda telah dinonaktifkan.');
        this.closeProfileModal();
        this.authService.logout();
      } catch (error) {
        alert('Gagal menghapus akun.');
        console.error(error);
      }
    }
  }
}
