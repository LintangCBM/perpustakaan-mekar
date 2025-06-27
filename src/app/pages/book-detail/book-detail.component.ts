import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/book.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Book } from '../../components/shared/book-card/book-card.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-book-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss',
  standalone: true,
})
export class BookDetailComponent implements OnInit {
  book$!: Observable<Book | undefined>;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.book$ = this.bookService.getBookById(bookId);
    } else {
      this.router.navigate(['/daftar-buku']);
    }
  }

  goBack(): void {
    window.history.back();
  }

  handleFavoriteToggled(event: MouseEvent, book: Book): void {
    event.stopPropagation();
    this.bookService.toggleFavorite(book.id);
  }
}
