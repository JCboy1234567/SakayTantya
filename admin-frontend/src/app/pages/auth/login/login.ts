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

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    console.log('Login form submitted', { email: this.email, password: this.password });
  }
}
