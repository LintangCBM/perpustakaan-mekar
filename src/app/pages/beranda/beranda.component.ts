import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BookCardComponent } from '../../components/shared/book-card/book-card.component';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-beranda',
  imports: [AsyncPipe, BookCardComponent, RouterLink],
  templateUrl: './beranda.component.html',
  styleUrl: './beranda.component.scss',
  standalone: true,
})
export class BerandaComponent {
  welcomeImageUrl = 'assets/images/welcome.png';

  readonly rekomendasiBuku$: Observable<Book[]>;
  readonly daftarBukuPreview$: Observable<Book[]>;
  readonly RECOMMEND_LIMIT = 8;
  readonly PREVIEW_LIMIT = 10;

  constructor(private bookService: BookService) {
    this.rekomendasiBuku$ = this.bookService.getNewestBooks(
      this.RECOMMEND_LIMIT
    );
    this.daftarBukuPreview$ = this.bookService.getDaftarBukuPreview(
      this.PREVIEW_LIMIT
    );
  }

  handleFavoriteToggled(bookId: string | number): void {
    this.bookService.toggleFavorite(bookId);
  }
}
