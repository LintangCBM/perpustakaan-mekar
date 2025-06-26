import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  standalone: true,
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 20;
  @Input() currentPage: number = 1;
  @Input() pagesToShow: number = 5;

  @Output() pageChanged = new EventEmitter<number>();

  totalPages: number = 0;
  pageNumbers: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['totalItems'] ||
      changes['itemsPerPage'] ||
      changes['currentPage']
    ) {
      this.calculateTotalPages();
      this.generatePageNumbers();
    }
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }

  private generatePageNumbers(): void {
    this.pageNumbers = [];
    if (this.totalPages <= 0) return;
    if (this.totalPages <= this.pagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        this.pageNumbers.push(i);
      }
    } else {
      let startPage: number, endPage: number;
      const halfPagesToShow = Math.floor(this.pagesToShow / 2);
      if (this.currentPage <= halfPagesToShow + 1) {
        startPage = 1;
        endPage = this.pagesToShow;
      } else if (this.currentPage + halfPagesToShow >= this.totalPages) {
        startPage = this.totalPages - this.pagesToShow + 1;
        endPage = this.totalPages;
      } else {
        startPage = this.currentPage - halfPagesToShow;
        endPage = this.currentPage + halfPagesToShow;
      }

      if (startPage > 1) {
        this.pageNumbers.push(1);
        if (startPage > 2) {
          this.pageNumbers.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        this.pageNumbers.push(i);
      }

      if (endPage < this.totalPages) {
        if (endPage < this.totalPages - 1) {
          this.pageNumbers.push('...');
        }
        this.pageNumbers.push(this.totalPages);
      }
    }
  }

  selectPage(page: number | string): void {
    if (
      typeof page === 'number' &&
      page !== this.currentPage &&
      page >= 1 &&
      page <= this.totalPages
    ) {
      this.pageChanged.emit(page);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.pageChanged.emit(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChanged.emit(this.currentPage + 1);
    }
  }
}
