import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { BookService } from '../../services/book.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Book } from '../../models/book.model';
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
    private location: Location,
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.book$ = this.bookService.getBookById(bookId);
    } else {
      this.location.back();
    }
  }

  goBack(): void {
    this.location.back();
  }

  handleFavoriteToggled(event: MouseEvent, book: Book): void {
    event.stopPropagation();
    this.bookService.toggleFavorite(book.id);
  }
}
