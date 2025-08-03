import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Subject,
  Subscription,
  combineLatest,
  BehaviorSubject,
  Observable,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  tap,
  map,
} from 'rxjs/operators';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-book-management',
  imports: [ReactiveFormsModule, PaginationComponent, RouterLink, AsyncPipe],
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
  allCategories$!: Observable<string[]>;

  coverImagePreview: string | null = null;

  constructor() {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      categories: [''],
      description: [''],
      coverImageUrl: [''],
    });
    this.bookForm.get('coverImageUrl')?.valueChanges.subscribe((value) => {
      this.coverImagePreview = value;
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
          return this.bookService.getAllBooksForAdmin().pipe(
            map((books) => {
              if (!term) return books;
              return books.filter(
                (book) =>
                  book.title.toLowerCase().includes(term.toLowerCase()) ||
                  book.author.toLowerCase().includes(term.toLowerCase())
              );
            })
          );
        })
      )
      .subscribe((books) => {
        this.allBooks = books.sort((a, b) => a.title.localeCompare(b.title));
        this.totalItems = this.allBooks.length;
        this.currentPage = 1;
        this.applyPagination();
        this.isLoading = false;
      });
    this.allCategories$ = this.bookService.getUniqueCategories();
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
    this.coverImagePreview = null;
    this.isModalOpen = true;
  }

  openEditModal(book: Book): void {
    this.editingBookId = book.id;
    this.bookForm.patchValue({
      ...book,
      categories: book.categories.join(', '),
    });
    this.coverImagePreview = book.coverImageUrl || null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  addCategoryFromSelector(category: string): void {
    const categoriesControl = this.bookForm.get('categories');
    if (categoriesControl) {
      let currentValue = (categoriesControl.value || '').trim();
      const currentCategories = new Set(
        currentValue
          .split(',')
          .map((c: string) => c.trim())
          .filter((c: string) => c)
      );
      if (!currentCategories.has(category)) {
        currentValue = currentValue ? `${currentValue}, ${category}` : category;
        categoriesControl.setValue(currentValue);
      }
    }
  }

  async onArchive(bookId: string): Promise<void> {
    if (
      confirm(
        'Apakah Anda yakin ingin mengarsipkan buku ini? Buku ini tidak akan terlihat oleh siswa.'
      )
    ) {
      try {
        await this.bookService.archiveBook(bookId);
        this.refreshSignal$.next();
      } catch (error) {
        console.error('Failed to archive book:', error);
        alert('Gagal mengarsipkan buku.');
      }
    }
  }

  async onUnarchive(bookId: string): Promise<void> {
    if (confirm('Apakah Anda yakin ingin mengaktifkan kembali buku ini?')) {
      try {
        await this.bookService.unarchiveBook(bookId);
        this.refreshSignal$.next();
      } catch (error) {
        console.error('Failed to unarchive book:', error);
        alert('Gagal mengaktifkan kembali buku.');
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
      this.allCategories$ = this.bookService.getUniqueCategories();
      this.closeModal();
    } catch (error) {
      console.error('Failed to save book:', error);
      alert('Gagal menyimpan data buku.');
    }
  }
}
