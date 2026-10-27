import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServices } from '../../core/services/auth.services';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideUserCheck,
  LucideMail,
  LucideLock,
  LucideUser,
  LucideArrowRight,
  LucideLoader,
  LucideCheckCircle2
} from '@lucide/angular';

@Component({
  selector: 'app-login-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideUserCheck,
    LucideMail,
    LucideLock,
    LucideUser,
    LucideArrowRight,
    LucideLoader,
    LucideCheckCircle2
  ],
  templateUrl: './login-user.html',
  styleUrl: './login-user.css',
})
export class LoginUser {
  isRegistering = false;

  // Login form fields
  email = '';
  password = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Register form fields
  regName = '';
  regEmail = '';
  regPassword = '';
  regPasswordConfirmation = '';
  isRegLoading = false;
  regSuccessMessage = '';
  regErrorMessage = '';

  // Modern Modal State
  showSuccessModal = false;
  loggedInUserName = 'Commuter';

  constructor(
    private authService: AuthServices,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  toggleMode(register: boolean): void {
    this.isRegistering = register;
    this.successMessage = '';
    this.errorMessage = '';
    this.regSuccessMessage = '';
    this.regErrorMessage = '';
    this.cdr.detectChanges();
  }

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      this.successMessage = '';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.loggedInUserName = response.user.name || 'Commuter';
          }

          // Trigger Modern Success Modal
          this.showSuccessModal = true;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/main-dashboard']);
          }, 1500);
        } else {
          this.errorMessage = 'Invalid login response from server.';
          this.cdr.detectChanges();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Login error:', err);
        this.isLoading = false;
        const errObj: any = err.error;
        this.errorMessage = errObj?.message || 'Invalid email or password. Please check your credentials.';
        this.cdr.detectChanges();
      }
    });
  }

  onRegister(): void {
    if (!this.regName || !this.regEmail || !this.regPassword || !this.regPasswordConfirmation) {
      this.regErrorMessage = 'Please fill in all registration fields.';
      this.regSuccessMessage = '';
      this.cdr.detectChanges();
      return;
    }

    if (this.regPassword !== this.regPasswordConfirmation) {
      this.regErrorMessage = 'Passwords do not match.';
      this.regSuccessMessage = '';
      this.cdr.detectChanges();
      return;
    }

    this.isRegLoading = true;
    this.regErrorMessage = '';
    this.regSuccessMessage = '';
    this.cdr.detectChanges();

    this.authService.register({
      name: this.regName,
      email: this.regEmail,
      password: this.regPassword,
      password_confirmation: this.regPasswordConfirmation,
      role: 'user'
    }).subscribe({
      next: () => {
        this.isRegLoading = false;
        this.regSuccessMessage = 'Account created successfully! Redirecting to login...';
        this.cdr.detectChanges();

        // Clear register fields
        this.regName = '';
        this.regEmail = '';
        this.regPassword = '';
        this.regPasswordConfirmation = '';

        setTimeout(() => {
          this.isRegistering = false;
          this.successMessage = 'Account created successfully! Please sign in.';
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Registration error:', err);
        this.isRegLoading = false;
        const errObj: any = err.error;

        // Extract exact Laravel validation error messages if available
        if (errObj && errObj.errors) {
          const firstKey = Object.keys(errObj.errors)[0];
          this.regErrorMessage = errObj.errors[firstKey][0];
        } else {
          this.regErrorMessage = errObj?.message || 'Registration failed. Please check your details.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
