import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookCardComponent } from '../book-card/book-card.component';
import { Book } from '../../../models/book.model';
import { PaginationComponent } from '../pagination/pagination.component';
import { BookService } from '../../../services/book.service';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, BookCardComponent, PaginationComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  standalone: true,
})
export class BookListComponent implements OnChanges {
  @Input() books: Book[] = [];

  masterBookList: Book[] = [];
  booksAfterFilter: Book[] = [];
  pagedBooks: Book[] = [];
  displayCategories: string[] = [];
  selectedCategories: Set<string> = new Set();
  readonly SEMUA_CATEGORY = 'Semua';

  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalItems: number = 0;

  constructor(private bookService: BookService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['books']) {
      this.masterBookList = this.books;
      this.currentPage = 1;
      this.selectedCategories.clear();
      this.extractUniqueCategories();
      this.applyAllFiltersAndPaginate();
    }
  }

  extractUniqueCategories(): void {
    const allCats = new Set<string>();
    this.masterBookList.forEach((book) => {
      (book.categories || []).forEach((cat) => allCats.add(cat));
    });
    this.displayCategories = [this.SEMUA_CATEGORY, ...Array.from(allCats).sort()];
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
    if (this.selectedCategories.size === 0) {
      this.booksAfterFilter = [...this.masterBookList];
    } else {
      this.booksAfterFilter = this.masterBookList.filter((book) =>
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
}
