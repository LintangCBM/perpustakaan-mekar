import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, Subscription, combineLatest, BehaviorSubject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  tap,
} from 'rxjs/operators';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-book-management',
  imports: [ReactiveFormsModule, PaginationComponent, RouterLink],
  templateUrl: './admin-book-management.component.html',
  styleUrl: './admin-book-management.component.scss',
  standalone: true,
})
export class AdminBookManagementComponent implements OnInit, OnDestroy {
  private bookService = inject(BookService);
  private fb = inject(FormBuilder);

  private allBooks: Book[] = [];
  paginatedBooks: Book[] = [];
  isLoading = true;

  private searchSubject = new BehaviorSubject<string>('');
  private refreshSignal$ = new Subject<void>();
  private dataSubscription!: Subscription;
  searchTerm = '';

  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;

  bookForm: FormGroup;
  isModalOpen = false;
  editingBookId: string | null = null;

  constructor() {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      categories: [''],
      description: [''],
      coverImageUrl: [''],
    });
  }

  ngOnInit(): void {
    const searchTerm$ = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );

    const dataTrigger$ = combineLatest([
      searchTerm$,
      this.refreshSignal$.pipe(startWith(undefined)),
    ]);

    this.dataSubscription = dataTrigger$
      .pipe(
        tap(() => (this.isLoading = true)),
        switchMap(([term]) => {
          if (term) {
            return this.bookService.searchBooks(term);
          } else {
            return this.bookService.getAllBooks();
          }
        })
      )
      .subscribe((books) => {
        this.allBooks = books.sort((a, b) => a.title.localeCompare(b.title));
        this.totalItems = this.allBooks.length;
        this.currentPage = 1;
        this.applyPagination();
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedBooks = this.allBooks.slice(startIndex, endIndex);
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.applyPagination();
  }

  openAddModal(): void {
    this.editingBookId = null;
    this.bookForm.reset();
    this.isModalOpen = true;
  }

  openEditModal(book: Book): void {
    this.editingBookId = book.id;
    this.bookForm.patchValue({
      ...book,
      categories: book.categories.join(', '),
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  async onDelete(bookId: string): Promise<void> {
    if (
      confirm(
        'Apakah Anda yakin ingin menghapus buku ini? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      try {
        await this.bookService.archiveBook(bookId);
        this.refreshSignal$.next();
      } catch (error) {
        console.error('Failed to delete book:', error);
        alert('Gagal menghapus buku.');
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.bookForm.invalid) {
      return;
    }

    const formValue = this.bookForm.value;
    const bookData = {
      ...formValue,
      categories: formValue.categories
        .split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => c),
    };

    try {
      if (this.editingBookId) {
        await this.bookService.updateBook(this.editingBookId, bookData);
      } else {
        await this.bookService.addBook(bookData);
      }
      this.refreshSignal$.next();
      this.closeModal();
    } catch (error) {
      console.error('Failed to save book:', error);
      alert('Gagal menyimpan data buku.');
    }
  }
}
