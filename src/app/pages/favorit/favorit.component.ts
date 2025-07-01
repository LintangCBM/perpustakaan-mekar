import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/book.service';
import { BookListComponent } from '../../components/shared/book-list/book-list.component';
import { Book } from '../../models/book.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-favorit',
  standalone: true,
  imports: [CommonModule, BookListComponent],
  templateUrl: './favorit.component.html',
  styleUrl: './favorit.component.scss',
})
export class FavoritComponent {
  readonly favoriteBooks$: Observable<Book[]>;

  constructor(private bookService: BookService) {
    this.favoriteBooks$ = this.bookService.getFavoriteBooks();
  }
}
