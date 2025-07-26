import { Component, inject } from '@angular/core';
import { AsyncPipe, Location } from '@angular/common';
import { BookService } from '../../services/book.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Book } from '../../models/book.model';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PeminjamanService } from '../../services/peminjaman.service';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-book-detail',
  imports: [AsyncPipe, RouterLink, NgClass],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss',
  standalone: true,
})
export class BookDetailComponent {
  book$!: Observable<Book | undefined>;
  private authService = inject(AuthService);
  private peminjamanService = inject(PeminjamanService);
  private router = inject(Router);
  borrowingFeedback: { message: string; type: 'success' | 'error' } | null =
    null;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.book$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const bookId = params.get('id');
        if (bookId) {
          return this.bookService.getBookById(bookId);
        }
        this.location.back();
        return new Observable<undefined>();
      })
    );
  }

  goBack(): void {
    this.location.back();
  }

  async handleFavoriteToggled(event: MouseEvent, book: Book): Promise<void> {
    event.stopPropagation();
    await this.bookService.requestToggleFavorite(book.id);
  }

  async onPinjamBuku(book: Book): Promise<void> {
    const currentUser = await this.authService.getCurrentUser();
    this.borrowingFeedback = null;

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      await this.peminjamanService.pinjamBuku(currentUser, book);
      this.borrowingFeedback = {
        message: `Buku "${book.title}" berhasil dipinjam! Anda akan dialihkan...`,
        type: 'success',
      };
      setTimeout(() => this.router.navigate(['/akun']), 2000);
    } catch (err: any) {
      this.borrowingFeedback = {
        message: `Gagal meminjam buku: ${err.message}`,
        type: 'error',
      };
      return;
    }
  }
}
