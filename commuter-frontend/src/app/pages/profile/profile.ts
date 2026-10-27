import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideUser, LucideMail, LucideShield, LucideKey, LucideSave, LucideUserCheck, LucideSun, LucideMoon } from '@lucide/angular';
import { AuthServices } from '../../core/services/auth.services';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideUser,
    LucideMail,
    LucideShield,
    LucideKey,
    LucideSave,
    LucideUserCheck,
    LucideSun,
    LucideMoon
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  userId: number = 1;
  name = '';
  email = '';
  role = 'commuter';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  errorMessage = '';
  passwordError = '';

  // Theme state
  isDarkMode = false;

  // Success Modal State
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  constructor(
    private authService: AuthServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userId = user.id || 1;
        this.name = user.name || '';
        this.email = user.email || '';
        this.role = user.role || 'commuter';
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    } else {
      this.name = 'Commuter User';
      this.email = 'commuter@example.com';
      this.role = 'user';
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.cdr.detectChanges();
  }

  updateProfile() {
    this.errorMessage = '';

    if (!this.name || !this.email) {
      this.errorMessage = 'Name and Email are required.';
      this.cdr.detectChanges();
      return;
    }

    this.authService.updateProfile(this.userId, { name: this.name, email: this.email }).subscribe({
      next: (res: any) => {
        if (res && res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          this.name = res.user.name;
          this.email = res.user.email;
          this.role = res.user.role || this.role;
        }
        this.modalTitle = 'Profile Updated!';
        this.modalMessage = 'Your personal information has been successfully saved to the database.';
        this.showModal = true;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Update profile error:', err);
        const errObj: any = err.error;
        if (errObj && errObj.errors) {
          const firstKey = Object.keys(errObj.errors)[0];
          this.errorMessage = errObj.errors[firstKey][0];
        } else {
          this.errorMessage = errObj?.message || 'Failed to update profile. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  updatePassword() {
    this.passwordError = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Please fill in all password fields.';
      this.cdr.detectChanges();
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match.';
      this.cdr.detectChanges();
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long.';
      this.cdr.detectChanges();
      return;
    }

    this.authService.updateProfile(this.userId, {
      current_password: this.currentPassword,
      password: this.newPassword
    }).subscribe({
      next: () => {
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';

        this.modalTitle = 'Password Updated!';
        this.modalMessage = 'Your account password has been successfully changed in the database.';
        this.showModal = true;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Update password error:', err);
        const errObj: any = err.error;
        if (errObj && errObj.errors) {
          const firstKey = Object.keys(errObj.errors)[0];
          this.passwordError = errObj.errors[firstKey][0];
        } else {
          this.passwordError = errObj?.message || 'Failed to update password. Check your current password.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.cdr.detectChanges();
  }
}
