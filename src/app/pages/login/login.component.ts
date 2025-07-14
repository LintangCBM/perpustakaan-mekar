import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  loginForm: FormGroup = this.fb.group({
    nisn: ['', Validators.required],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('registered') === 'true') {
        this.successMessage = 'Pendaftaran berhasil! Silakan masuk.';
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const { nisn, password } = this.loginForm.value;

    this.authService.login(nisn, password).subscribe({
      next: () => {
        this.router.navigate(['/akun']);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      },
    });
  }
}
