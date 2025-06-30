import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
})
export class HeaderComponent {
  logoUrl = 'assets/images/logo.png';

  constructor(private router: Router) {}

  onSearchSubmit(event: Event, searchInput: HTMLInputElement): void {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      this.router.navigate(['/daftar-buku'], {
        queryParams: { q: searchTerm },
      });
    }
  }
}
