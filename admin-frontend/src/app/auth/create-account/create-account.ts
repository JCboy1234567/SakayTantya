import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthServices } from '../../core/services/auth.services';

import {
  LucideMapPin,
  LucideUserRound,
  LucideMail,
  LucideLockKeyhole,
  LucideEye,
  LucideEyeOff,
  LucideArrowRight,
  LucideShieldCheck,
  LucideAlertCircle,
  LucideX
} from '@lucide/angular';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideMapPin,
    LucideUserRound,
    LucideMail,
    LucideLockKeyhole,
    LucideEye,
    LucideEyeOff,
    LucideArrowRight,
    LucideShieldCheck,
    LucideAlertCircle,
    LucideX
  ],
  templateUrl: './create-account.html',
  styleUrl: './create-account.css'
})
export class CreateAccount {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  errorMessage = '';
  passwordMismatchError = '';
  isLoading = false;
  showSuccessModal = false;

  // Error Modal State
  showErrorModal = false;
  errorModalTitle = 'Registration Error';
  errorModalMessage = '';

  constructor(
    private router: Router,
    private authService: AuthServices,
    private cdr: ChangeDetectorRef
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.passwordMismatchError = '';

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please complete all required fields.';
      this.cdr.detectChanges();
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email.trim())) {
      this.errorMessage = 'Please enter a valid email address.';
      this.cdr.detectChanges();
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      this.cdr.detectChanges();
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.passwordMismatchError = 'Passwords do not match.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.register({
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      role: 'admin'
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccessModal = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('API ERROR:', err);

        let msg = 'Failed to create account. Please try again.';
        if (err.error?.message) {
          msg = err.error.message;
        } else if (err.error?.errors) {
          const firstKey = Object.keys(err.error.errors)[0];
          if (firstKey && err.error.errors[firstKey][0]) {
            msg = err.error.errors[firstKey][0];
          }
        }

        this.errorModalTitle = 'Account Exists';
        this.errorModalMessage = msg;
        this.showErrorModal = true;
        this.cdr.detectChanges();
      }
    });
  }
}
