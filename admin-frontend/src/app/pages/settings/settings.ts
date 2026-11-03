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
  LucidePalette,
  LucidePencil
} from '@lucide/angular';
import { FareService } from '../../core/services/fare.service';

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
    LucidePalette,
    LucidePencil
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  // Profile
  userId: number | null = null;
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

  // Edit Profile Modal
  showEditProfileModal = false;
  isSavingProfile = false;
  profileError = '';
  editName = '';
  editEmail = '';

  constructor(
    private router: Router,
    private fareService: FareService,
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
        this.userId = user.id || null;
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
    if (!this.userId) {
      this.successModalTitle = 'Error';
      this.successModalText = 'User ID not found. Please log in again.';
      this.showSuccessModal = true;
      this.cdr.detectChanges();
      return;
    }

    this.isSaving = true;
    this.cdr.detectChanges();

    const payload = {
      email_notifications: this.emailNotifications,
      system_alerts: this.systemAlerts,
      feedback_alerts: this.feedbackAlerts
    };

    // Call backend API to save preferences
    this.fareService.updateNotificationPreferences(this.userId, payload).subscribe({
      next: () => {
        // Also save to localStorage for instant UI updates
        const prefs = {
          emailNotifications: this.emailNotifications,
          systemAlerts: this.systemAlerts,
          feedbackAlerts: this.feedbackAlerts
        };
        localStorage.setItem('notification_prefs', JSON.stringify(prefs));

        this.isSaving = false;
        this.successModalTitle = 'Preferences Saved!';
        this.successModalText = 'Your notification preferences have been updated successfully.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating notification preferences:', err);
        this.isSaving = false;
        this.successModalTitle = 'Error';
        this.successModalText = err.error?.message || 'Failed to save notification preferences.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      }
    });
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

    if (!this.userId) {
      this.passwordError = 'User ID not found. Please log in again.';
      this.cdr.detectChanges();
      return;
    }

    this.isChangingPassword = true;
    this.cdr.detectChanges();

    const payload = {
      current_password: this.currentPassword,
      password: this.newPassword
    };

    this.fareService.updateUserProfile(this.userId, payload).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.closePasswordModal();
        this.successModalTitle = 'Password Changed!';
        this.successModalText = 'Your account password has been successfully updated in the database.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating password:', err);
        this.isChangingPassword = false;
        this.passwordError = err.error?.message || 'Failed to update password. Check your current password.';
        this.cdr.detectChanges();
      }
    });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.cdr.detectChanges();
  }

  // Edit Profile Methods
  openEditProfileModal(): void {
    this.editName = this.userName;
    this.editEmail = this.userEmail;
    this.profileError = '';
    this.showEditProfileModal = true;
    this.cdr.detectChanges();
  }

  closeEditProfileModal(): void {
    this.showEditProfileModal = false;
    this.cdr.detectChanges();
  }

  onUpdateProfile(): void {
    this.profileError = '';

    if (!this.editName.trim() || !this.editEmail.trim()) {
      this.profileError = 'Name and email are required.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.userId) {
      this.profileError = 'User ID not found. Please log in again.';
      this.cdr.detectChanges();
      return;
    }

    this.isSavingProfile = true;
    this.cdr.detectChanges();

    const payload = {
      name: this.editName.trim(),
      email: this.editEmail.trim()
    };

    this.fareService.updateUserProfile(this.userId, payload).subscribe({
      next: (response: any) => {
        this.isSavingProfile = false;
        const updatedUser = response.user || { id: this.userId, name: this.editName, email: this.editEmail, role: this.userRole };

        this.userName = updatedUser.name;
        this.userEmail = updatedUser.email;
        this.userInitial = this.userName.charAt(0).toUpperCase();

        // Update localStorage user
        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.closeEditProfileModal();
        this.successModalTitle = 'Profile Updated Successfully!';
        this.successModalText = 'Your account name and email have been saved to the database.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.isSavingProfile = false;
        this.profileError = err.error?.message || 'Failed to update profile. Email might already be taken.';
        this.cdr.detectChanges();
      }
    });
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
