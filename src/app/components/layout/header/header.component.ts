import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { AsyncPipe } from '@angular/common';
import { UserRole } from '../../../models/user-role.enum';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logoUrl = 'assets/images/logo.png';
  user$: Observable<User | null> = this.authService.currentUser;
  readonly UserRole = UserRole;

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
}
