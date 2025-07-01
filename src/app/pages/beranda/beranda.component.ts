import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookCardComponent } from '../../components/shared/book-card/book-card.component';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-beranda',
  imports: [CommonModule, BookCardComponent, RouterLink],
  templateUrl: './beranda.component.html',
  styleUrl: './beranda.component.scss',
  standalone: true,
})
export class BerandaComponent implements OnInit, OnDestroy {
  welcomeImageUrl = 'assets/images/welcome.png';
  private subscriptions = new Subscription();

  rekomendasiBuku: Book[] = [];
  daftarBukuPreview: Book[] = [];

  readonly RECOMMEND_LIMIT = 8;
  readonly PREVIEW_LIMIT = 10;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.bookService
        .getNewestBooks(this.RECOMMEND_LIMIT)
        .subscribe((books) => {
          this.rekomendasiBuku = books;
        })
    );

    this.subscriptions.add(
      this.bookService
        .getDaftarBukuPreview(this.PREVIEW_LIMIT)
        .subscribe((books) => {
          this.daftarBukuPreview = books;
        })
    );
  }

  handleFavoriteToggled(bookId: string | number): void {
    this.bookService.toggleFavorite(bookId);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
