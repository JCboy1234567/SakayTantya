import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  LucideBus,
  LucideMail,
  LucideLock,
  LucideLoader,
  LucideArrowRight
} from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideBus,
    LucideMail,
    LucideLock,
    LucideLoader,
    LucideArrowRight
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    // Authenticate against Laravel API
    this.http.post(`${this.apiUrl}/login`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          this.successMessage = 'Login successful!';
          this.cdr.detectChanges();
        } else {
          this.errorMessage = 'Invalid login response from server.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password. Please check your credentials.';
        this.cdr.detectChanges();
      }
    });
  }
}
