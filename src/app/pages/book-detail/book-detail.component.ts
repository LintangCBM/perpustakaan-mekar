import { Component, OnInit } from '@angular/core';
import { AsyncPipe, Location } from '@angular/common';
import { BookService } from '../../services/book.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Book } from '../../models/book.model';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-book-detail',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss',
  standalone: true,
})
export class BookDetailComponent {
  book$!: Observable<Book | undefined>;

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

  handleFavoriteToggled(event: MouseEvent, book: Book): void {
    event.stopPropagation();
    this.bookService.toggleFavorite(book.id);
  }
}
