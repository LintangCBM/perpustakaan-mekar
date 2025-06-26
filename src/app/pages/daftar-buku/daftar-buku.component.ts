import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BookCardComponent,
  Book,
} from '../../components/shared/book-card/book-card.component';
import { BookService } from '../../services/book.service';
import { Subscription, map } from 'rxjs';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';

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
  booksAfterCategoryFilter: Book[] = [];
  pagedBooks: Book[] = [];
  displayCategories: string[] = [];
  selectedCategories: Set<string> = new Set();
  readonly SEMUA_CATEGORY = 'Semua';

  currentPage: number = 1;
  itemsPerPage: number = 1;
  totalItems: number = 0;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.bookService
        .getAllBooks()
        .pipe(
          map((books) =>
            [...books].sort((a, b) => a.title.localeCompare(b.title))
          )
        )
        .subscribe((sortedBooks) => {
          this.allBooksMasterList = sortedBooks;
          this.applyCategoryFiltersAndPaginate();
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
    this.applyCategoryFiltersAndPaginate();
  }

  isCategoryActive(category: string): boolean {
    if (category === this.SEMUA_CATEGORY) {
      return this.selectedCategories.size === 0;
    }
    return this.selectedCategories.has(category);
  }

  applyCategoryFiltersAndPaginate(): void {
    if (this.selectedCategories.size === 0) {
      this.booksAfterCategoryFilter = [...this.allBooksMasterList];
    } else {
      this.booksAfterCategoryFilter = this.allBooksMasterList.filter((book) =>
        (book.categories || []).some((cat) => this.selectedCategories.has(cat))
      );
    }

    this.totalItems = this.booksAfterCategoryFilter.length;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedBooks = this.booksAfterCategoryFilter.slice(startIndex, endIndex);
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.applyCategoryFiltersAndPaginate();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
