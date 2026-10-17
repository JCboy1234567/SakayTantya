import { Component } from '@angular/core';
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
  readonly Mail = LucideMail;
  readonly LockKeyhole = LucideLockKeyhole;
  readonly Eye = LucideEye;
  readonly EyeOff = LucideEyeOff;
  readonly ArrowRight = LucideArrowRight;
  readonly ShieldCheck = LucideShieldCheck;
  readonly MapPin = LucideMapPin;

  showPassword = false;
  rememberMe = true;
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  showSuccessModal = false; // <--- Para sa Success Modal

  constructor(private router: Router, private authService: AuthServices) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.isLoading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        this.isLoading = false;
        this.showSuccessModal = true; // Ipakita ang Success Modal

        // Mag-redirect sa dashboard pagkatapos ng 2 segundo
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Login error:', err);
        this.errorMessage = err.error?.message || 'Invalid email or password or connection failed.';
      }
    });
  }
}
