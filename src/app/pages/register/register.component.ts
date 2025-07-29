import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { passwordsMatchValidator } from '../../shared/validators/password.validator';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: '../auth-styles.scss',
  standalone: true,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage: string | null = null;

  registerForm: FormGroup = this.fb.group(
    {
      nama: ['', Validators.required],
      nisn: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      konfirmasiPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator }
  );

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const { nama, nisn, password } = this.registerForm.value;

    try {
      await this.authService.register(nama, nisn, password);
      this.router.navigate(['/akun']);
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          this.errorMessage =
            'NISN ini sudah terdaftar. Silakan gunakan NISN lain atau masuk.';
          break;
        case 'auth/weak-password':
          this.errorMessage =
            'Password terlalu lemah. Harap gunakan minimal 6 karakter.';
          break;
        default:
          this.errorMessage =
            'Pendaftaran gagal. Silakan coba beberapa saat lagi.';
          console.error('An unexpected registration error occurred:', err);
          break;
      }
    } finally {
      this.isLoading = false;
    }
  }
}
