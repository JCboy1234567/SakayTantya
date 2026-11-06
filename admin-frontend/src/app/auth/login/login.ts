import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideMail,
  LucideLockKeyhole,
  LucideEye,
  LucideEyeOff,
  LucideArrowRight,
  LucideShieldCheck,
  LucideMapPin,
} from '@lucide/angular';
import { AuthServices } from '../../core/services/auth.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideMail,
    LucideLockKeyhole,
    LucideEye,
    LucideEyeOff,
    LucideArrowRight,
    LucideShieldCheck,
    LucideMapPin
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showPassword = false;
  rememberMe = true;
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  showSuccessModal = false;

  constructor(
    private router: Router,
    private authService: AuthServices,
    private cdr: ChangeDetectorRef
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        this.isLoading = false;
        this.showSuccessModal = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/overview']);
        }, 1800);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Login error:', err);
        this.errorMessage = err.error?.message || 'Invalid email or password or connection failed.';
        this.cdr.detectChanges();
      }
    });
  }
}
