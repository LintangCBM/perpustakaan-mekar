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
  selector: 'app-login-staf',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-staf.component.html',
  styleUrl: '../auth-styles.scss',
})
export class LoginStafComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = false;
  errorMessage: string | null = null;
  private returnUrl: string | null = null;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.returnUrl = params.get('returnUrl');
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;
    const { email, password } = this.loginForm.value;

    try {
      await this.authService.loginStaff(email, password);

      if (this.returnUrl) {
        this.router.navigateByUrl(this.returnUrl);
      } else {
        this.router.navigate(['/admin']);
      }
    } catch (err: any) {
      this.handleLoginError(err);
    } finally {
      this.isLoading = false;
    }
  }

  private handleLoginError(err: any): void {
    switch (err.code) {
      case 'auth/invalid-credential':
        this.errorMessage = 'Email atau password yang Anda masukkan salah.';
        break;
      case 'auth/account-archived':
        this.errorMessage = err.message;
        break;
      default:
        this.errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
        console.error('An unexpected login error occurred:', err);
        break;
    }
  }
}
