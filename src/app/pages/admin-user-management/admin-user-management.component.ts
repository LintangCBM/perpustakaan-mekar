import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Observable,
  Subject,
  Subscription,
  BehaviorSubject,
  combineLatest,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  tap,
} from 'rxjs/operators';
import { User } from '../../models/user.model';
import { UserRole } from '../../models/user-role.enum';
import { AuthService } from '../../services/auth.service';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-user-management',
  imports: [ReactiveFormsModule, PaginationComponent, RouterLink],
  templateUrl: './admin-user-management.component.html',
  styleUrl: './admin-user-management.component.scss',
  standalone: true,
})
export class AdminUserManagementComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  private allUsers: User[] = [];
  paginatedUsers: User[] = [];
  isLoading = true;

  private searchSubject = new BehaviorSubject<string>('');
  private refreshSignal$ = new Subject<void>();
  private dataSubscription!: Subscription;
  searchTerm = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  userForm: FormGroup;
  isModalOpen = false;
  editingUser: User | null = null;
  readonly UserRole = UserRole;

  constructor() {
    this.userForm = this.fb.group({
      nama: ['', Validators.required],
      nisn: [{ value: '', disabled: true }],
      role: [UserRole.Student, Validators.required],
      email: ['', [Validators.email]],
      telepon: ['', [Validators.pattern('^[0-9+-\\s()]*$')]]
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
        switchMap(() => this.authService.getAllUsers())
      )
      .subscribe((users) => {
        const term = this.searchTerm.toLowerCase();
        this.allUsers = users.filter(
          (user) =>
            user.nama.toLowerCase().includes(term) ||
            String(user.nisn).toLowerCase().includes(term)
        );

        this.totalItems = this.allUsers.length;
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
    this.paginatedUsers = this.allUsers.slice(startIndex, endIndex);
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.applyPagination();
  }

  openEditModal(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue({
      nama: user.nama,
      nisn: user.nisn,
      email: user.email,
      telepon: user.telepon,
      role: user.role,
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingUser = null;
  }

  async onArchive(user: User): Promise<void> {
    if (
      user.role === UserRole.Staff &&
      this.allUsers.filter((u) => u.role === UserRole.Staff && !u.isArchived)
        .length <= 1
    ) {
      alert(
        'Tidak dapat menonaktifkan staf terakhir. Harus ada setidaknya satu akun staf aktif.'
      );
      return;
    }
    if (
      confirm(
        `Apakah Anda yakin ingin menonaktifkan pengguna "${user.nama}"?`
      )
    ) {
      try {
        await this.authService.archiveUser(user.uid);
        this.refreshSignal$.next();
      } catch (error) {
        alert('Gagal menonaktifkan pengguna.');
        console.error(error);
      }
    }
  }

  async onUnarchive(user: User): Promise<void> {
    if (
      confirm(
        `Apakah Anda yakin ingin mengaktifkan kembali pengguna "${user.nama}"?`
      )
    ) {
      try {
        await this.authService.unarchiveUser(user.uid);
        this.refreshSignal$.next();
      } catch (error) {
        alert('Gagal mengaktifkan kembali pengguna.');
        console.error(error);
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.invalid || !this.editingUser) return;

    try {
      await this.authService.updateUserData(this.editingUser.uid, {
        nama: this.userForm.value.nama,
        role: this.userForm.value.role,
        email: this.userForm.value.email,
        telepon: this.userForm.value.telepon,
      });
      this.refreshSignal$.next();
      this.closeModal();
    } catch (error: any) {
      alert(`Gagal menyimpan: ${error.message}`);
      console.error(error);
    }
  }
}
