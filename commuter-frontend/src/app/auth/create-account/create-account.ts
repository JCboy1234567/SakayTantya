import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  LucideUserPlus,
  LucideMail,
  LucideLock,
  LucideUser,
  LucideLoader,
  LucideCheckCircle2,
  LucideAlertCircle,
  LucideArrowRight
} from '@lucide/angular';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideUserPlus,
    LucideMail,
    LucideLock,
    LucideUser,
    LucideLoader,
    LucideCheckCircle2,
    LucideAlertCircle,
    LucideArrowRight
  ],
  templateUrl: './create-account.html',
  styleUrl: './create-account.css'
})
export class CreateAccount {
  name = '';
  email = '';
  password = '';
  password_confirmation = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onCreateAccount(): void {
    if (!this.name || !this.email || !this.password || !this.password_confirmation) {
      this.errorMessage = 'Please fill in all required fields.';
      this.cdr.detectChanges();
      return;
    }

    if (this.password !== this.password_confirmation) {
      this.errorMessage = 'Passwords do not match.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.http.post(`${this.apiUrl}/register`, {
      name: this.name,
      email: this.email,
      password: this.password,
      password_confirmation: this.password_confirmation,
      role: 'commuter'
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting to login...';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to create account. Email may already be taken.';
        this.cdr.detectChanges();
      }
    });
  }
}
