import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BookCardComponent,
  Book,
} from '../../components/shared/book-card/book-card.component';
import { BookService } from '../../services/book.service';
import { Subscription, map, combineLatest } from 'rxjs';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-daftar-buku',
  standalone: true,
  imports: [CommonModule, BookCardComponent, PaginationComponent],
  templateUrl: './daftar-buku.component.html',
  styleUrl: './daftar-buku.component.scss',
})
export class DaftarBukuComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  allBooksMasterList: Book[] = [];
  booksAfterFilter: Book[] = [];
  pagedBooks: Book[] = [];
  displayCategories: string[] = [];
  selectedCategories: Set<string> = new Set();
  searchQuery: string = '';
  readonly SEMUA_CATEGORY = 'Semua';

  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalItems: number = 0;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const books$ = this.bookService
      .getAllBooks()
      .pipe(
        map((books) =>
          [...books].sort((a, b) => a.title.localeCompare(b.title))
        )
      );

    const queryParams$ = this.route.queryParamMap;

    this.subscriptions.add(
      combineLatest([books$, queryParams$]).subscribe(([books, params]) => {
        this.allBooksMasterList = books;
        this.searchQuery = params.get('q') || '';
        this.currentPage = 1;
        this.applyAllFiltersAndPaginate();
      })
    );

    this.subscriptions.add(
      this.bookService.getUniqueCategories().subscribe((cats) => {
        this.displayCategories = [this.SEMUA_CATEGORY, ...cats];
      })
    );
  }

  handleFavoriteToggled(bookId: string | number): void {
    this.bookService.toggleFavorite(bookId);
  }

  toggleCategory(category: string): void {
    this.currentPage = 1;
    if (category === this.SEMUA_CATEGORY) {
      this.selectedCategories.clear();
    } else {
      if (this.selectedCategories.has(category)) {
        this.selectedCategories.delete(category);
      } else {
        this.selectedCategories.add(category);
      }
    }
    this.applyAllFiltersAndPaginate();
  }

  isCategoryActive(category: string): boolean {
    if (category === this.SEMUA_CATEGORY) {
      return this.selectedCategories.size === 0;
    }
    return this.selectedCategories.has(category);
  }

  applyAllFiltersAndPaginate(): void {
    let filteredBySearch: Book[] = [];
    if (this.searchQuery) {
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      filteredBySearch = this.allBooksMasterList.filter(
        (book) =>
          book.title.toLowerCase().includes(lowerCaseQuery) ||
          book.author.toLowerCase().includes(lowerCaseQuery)
      );
    } else {
      filteredBySearch = [...this.allBooksMasterList];
    }

    if (this.selectedCategories.size === 0) {
      this.booksAfterFilter = [...filteredBySearch];
    } else {
      this.booksAfterFilter = filteredBySearch.filter((book) =>
        (book.categories || []).some((cat) => this.selectedCategories.has(cat))
      );
    }

    this.totalItems = this.booksAfterFilter.length;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedBooks = this.booksAfterFilter.slice(startIndex, endIndex);
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.applyAllFiltersAndPaginate();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
