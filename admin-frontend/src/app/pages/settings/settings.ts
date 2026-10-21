import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideSettings,
  LucideUser,
  LucideMail,
  LucideShield,
  LucideSun,
  LucideMoon,
  LucideSave,
  LucideLoader,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideX,
  LucideLogOut,
  LucideLock,
  LucideEye,
  LucideEyeOff,
  LucideBell,
  LucidePalette
} from '@lucide/angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSettings,
    LucideUser,
    LucideMail,
    LucideShield,
    LucideSun,
    LucideMoon,
    LucideSave,
    LucideLoader,
    LucideCheckCircle2,
    LucideAlertTriangle,
    LucideX,
    LucideLogOut,
    LucideLock,
    LucideEye,
    LucideEyeOff,
    LucideBell,
    LucidePalette
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  // Profile
  userName = '';
  userEmail = '';
  userRole = '';
  userInitial = 'A';

  // Theme
  currentTheme = 'dark';

  // Notifications
  emailNotifications = true;
  systemAlerts = true;
  feedbackAlerts = false;

  // Password Change
  showPasswordModal = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isChangingPassword = false;
  passwordError = '';

  // Success / Error
  showSuccessModal = false;
  successModalTitle = '';
  successModalText = '';
  isSaving = false;

  // Logout Confirmation
  showLogoutModal = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadThemePreference();
    this.loadNotificationPreferences();
  }

  loadUserProfile(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.userName = user.name || 'Admin';
        this.userEmail = user.email || 'admin@sakaytantya.com';
        this.userRole = user.role || 'admin';
        this.userInitial = this.userName.charAt(0).toUpperCase();
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }

  loadThemePreference(): void {
    const saved = localStorage.getItem('theme');
    this.currentTheme = saved || 'dark';
  }

  loadNotificationPreferences(): void {
    const saved = localStorage.getItem('notification_prefs');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        this.emailNotifications = prefs.emailNotifications ?? true;
        this.systemAlerts = prefs.systemAlerts ?? true;
        this.feedbackAlerts = prefs.feedbackAlerts ?? false;
      } catch (e) { /* use defaults */ }
    }
  }

  setTheme(theme: string): void {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.cdr.detectChanges();
  }

  saveNotificationPreferences(): void {
    this.isSaving = true;
    this.cdr.detectChanges();

    const prefs = {
      emailNotifications: this.emailNotifications,
      systemAlerts: this.systemAlerts,
      feedbackAlerts: this.feedbackAlerts
    };
    localStorage.setItem('notification_prefs', JSON.stringify(prefs));

    setTimeout(() => {
      this.isSaving = false;
      this.successModalTitle = 'Preferences Saved!';
      this.successModalText = 'Your notification preferences have been updated successfully.';
      this.showSuccessModal = true;
      this.cdr.detectChanges();
    }, 600);
  }

  // Password Modal
  openPasswordModal(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.showPasswordModal = true;
    this.cdr.detectChanges();
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.cdr.detectChanges();
  }

  onChangePassword(): void {
    this.passwordError = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'All fields are required.';
      this.cdr.detectChanges();
      return;
    }
    if (this.newPassword.length < 8) {
      this.passwordError = 'New password must be at least 8 characters.';
      this.cdr.detectChanges();
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New password and confirmation do not match.';
      this.cdr.detectChanges();
      return;
    }

    this.isChangingPassword = true;
    this.cdr.detectChanges();

    // Simulated - connect to backend later
    setTimeout(() => {
      this.isChangingPassword = false;
      this.closePasswordModal();
      this.successModalTitle = 'Password Changed!';
      this.successModalText = 'Your account password has been updated successfully. Use your new password on your next login.';
      this.showSuccessModal = true;
      this.cdr.detectChanges();
    }, 1200);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.cdr.detectChanges();
  }

  // Logout
  openLogoutModal(): void {
    this.showLogoutModal = true;
    this.cdr.detectChanges();
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
    this.cdr.detectChanges();
  }

  confirmLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
