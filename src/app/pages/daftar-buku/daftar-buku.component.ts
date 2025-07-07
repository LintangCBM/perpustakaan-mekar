import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BookService } from '../../services/book.service';
import { BookListComponent } from '../../components/shared/book-list/book-list.component';
import { Book } from '../../models/book.model';
import { Observable, map, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-daftar-buku',
  standalone: true,
  imports: [AsyncPipe, BookListComponent],
  templateUrl: './daftar-buku.component.html',
  styleUrl: './daftar-buku.component.scss',
})
export class DaftarBukuComponent {
  readonly books$: Observable<Book[]>;
  readonly searchQuery$: Observable<string>;

  constructor(private bookService: BookService, private route: ActivatedRoute) {
    this.searchQuery$ = this.route.queryParamMap.pipe(
      map((params) => params.get('q') || '')
    );

    this.books$ = this.searchQuery$.pipe(
      switchMap((query) => this.bookService.searchBooks(query))
    );
  }
}
