import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BookCardComponent,
  Book,
} from '../../components/shared/book-card/book-card.component';
import { BookService } from '../../services/book.service';
import { Subscription, tap, map } from 'rxjs';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';

@Component({
  selector: 'app-favorit',
  standalone: true,
  imports: [CommonModule, BookCardComponent, PaginationComponent],
  templateUrl: './favorit.component.html',
  styleUrl: './favorit.component.scss',
})
export class FavoritComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  allFavoriteBooksMaster: Book[] = [];
  booksAfterCategoryFilter: Book[] = [];
  pagedFavoriteBooks: Book[] = [];

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
        .getFavoriteBooks()
        .pipe(
          map((books) =>
            [...books].sort((a, b) => a.title.localeCompare(b.title))
          ),
          tap((favBooks) => {
            this.allFavoriteBooksMaster = favBooks;
            if (
              this.currentPage >
                Math.ceil(favBooks.length / this.itemsPerPage) &&
              favBooks.length > 0
            ) {
              this.currentPage = Math.ceil(favBooks.length / this.itemsPerPage);
            } else if (favBooks.length === 0) {
              this.currentPage = 1;
            }
            this.extractUniqueCategoriesFromFavorites();
            this.applyCategoryFiltersAndPaginate();
          })
        )
        .subscribe()
    );
  }

  extractUniqueCategoriesFromFavorites(): void {
    if (
      !this.allFavoriteBooksMaster ||
      this.allFavoriteBooksMaster.length === 0
    ) {
      this.displayCategories = [this.SEMUA_CATEGORY];
      return;
    }
    const favoriteCats = new Set<string>();
    this.allFavoriteBooksMaster.forEach((book) => {
      (book.categories || []).forEach((cat) => favoriteCats.add(cat));
    });
    this.displayCategories = [
      this.SEMUA_CATEGORY,
      ...Array.from(favoriteCats).sort(),
    ];

    const currentDisplayCatSet = new Set(this.displayCategories);
    this.selectedCategories.forEach((selectedCat) => {
      if (
        selectedCat !== this.SEMUA_CATEGORY &&
        !currentDisplayCatSet.has(selectedCat)
      ) {
        this.selectedCategories.delete(selectedCat);
      }
    });
  }

  handleFavoriteToggled(bookId: string | number): void {
    this.bookService.toggleFavorite(bookId);
    // The subscription in ngOnInit will handle updates.
  }

  toggleCategory(category: string): void {
    this.currentPage = 1; // Reset to first page
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
    // 1. Apply category filters to favorite books
    if (this.selectedCategories.size === 0) {
      this.booksAfterCategoryFilter = [...this.allFavoriteBooksMaster];
    } else {
      this.booksAfterCategoryFilter = this.allFavoriteBooksMaster.filter(
        (book) =>
          (book.categories || []).some((cat) =>
            this.selectedCategories.has(cat)
          )
      );
    }

    this.totalItems = this.booksAfterCategoryFilter.length;

    const totalPagesAfterFilter = Math.ceil(
      this.totalItems / this.itemsPerPage
    );
    if (this.currentPage > totalPagesAfterFilter && totalPagesAfterFilter > 0) {
      this.currentPage = totalPagesAfterFilter;
    } else if (totalPagesAfterFilter === 0) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedFavoriteBooks = this.booksAfterCategoryFilter.slice(
      startIndex,
      endIndex
    );
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.applyCategoryFiltersAndPaginate();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
