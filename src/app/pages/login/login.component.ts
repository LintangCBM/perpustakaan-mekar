import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user-role.enum';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: '../auth-styles.scss',
  standalone: true,
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  private returnUrl: string | null = null;

  loginForm: FormGroup = this.fb.group({
    nisn: ['', Validators.required],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('registered') === 'true') {
        this.successMessage = 'Pendaftaran berhasil! Silakan masuk.';
      }
      this.returnUrl = params.get('returnUrl');
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const { nisn, password } = this.loginForm.value;

    try {
      const user = await this.authService.login(nisn, password);
      if (this.returnUrl) {
        this.router.navigateByUrl(this.returnUrl);
      } else {
        if (user.role === UserRole.Staff) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/akun']);
        }
      }
    } catch (err: any) {
      switch (err.code) {
        case 'auth/invalid-credential':
          this.errorMessage =
            'NISN atau password yang Anda masukkan salah. Silakan coba lagi.';
          break;
        case 'auth/account-archived':
          this.errorMessage = err.message;
          break;
        default:
          this.errorMessage =
            'Terjadi kesalahan. Silakan coba beberapa saat lagi.';
          console.error('An unexpected login error occurred:', err);
          break;
      }
    } finally {
      this.isLoading = false;
    }
  }
}
