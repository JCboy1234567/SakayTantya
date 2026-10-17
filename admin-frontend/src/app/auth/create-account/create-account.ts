import { Component } from '@angular/core';
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
  LucideShieldCheck
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
    LucideShieldCheck
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
  passwordMismatchError = ''; // <--- Para sa error sa ilalim ng confirm password
  isLoading = false;
  showSuccessModal = false;

  constructor(private router: Router, private authService: AuthServices) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    console.log('onSubmit clicked!');
    this.errorMessage = '';
    this.passwordMismatchError = '';

    // Validate required fields
    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.errorMessage = 'Please complete all required fields.';
      console.log('Validation failed: missing fields');
      return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(this.email.trim())) {
      this.errorMessage = 'Please enter a valid email address.';
      console.log('Validation failed: invalid email');
      return;
    }

    // Validate password length
    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      console.log('Validation failed: short password');
      return;
    }

    // Validate password confirmation (ilagay sa baba ng input)
    if (this.password !== this.confirmPassword) {
      this.passwordMismatchError = 'Passwords do not match.';
      console.log('Validation failed: passwords do not match');
      return;
    }

    console.log('All validations passed, calling authService.register...');
    this.isLoading = true;

    this.authService.register({
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      role: 'admin'
    }).subscribe({
      next: (res: any) => {
        console.log('API SUCCESS RESPONSE:', res);
        this.isLoading = false;
        this.showSuccessModal = true;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        console.error('API ERROR:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.message || 'Failed to create account. Please try again.';
      }
    });
  }
}
