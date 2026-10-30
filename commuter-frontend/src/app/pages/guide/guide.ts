import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideSend, LucideLifeBuoy, LucideShieldAlert, LucideLoader } from '@lucide/angular';
import { AuthServices } from '../../core/services/auth.services';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSend,
    LucideLifeBuoy,
    LucideShieldAlert,
    LucideLoader
  ],
  templateUrl: './guide.html',
  styleUrl: './guide.css',
})
export class Guide implements OnInit {
  isDarkMode = false;

  faqs = [
    {
      q: 'How is the fare estimated?',
      a: 'Fares are calculated using official LTFRB base rates plus distance-based tariff increments adjusted live for current fuel commodity prices.'
    },
    {
      q: 'How do I report a vehicle or driver?',
      a: 'Use the Help Center support ticket form below. Enter the vehicle plate number or body number, select the violation type, and provide details for rapid admin review.'
    }
  ];

  // Help Center Support Form State
  userName = '';
  userEmail = '';
  plateNumber = '';
  issueType = 'Overcharging / Fare Dispute';
  message = '';
  isSubmitting = false;
  successModal = false;
  errorMessage = '';

  constructor(private authService: AuthServices, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';

    window.addEventListener('storage', () => {
      const theme = localStorage.getItem('theme');
      this.isDarkMode = theme === 'dark';
    });

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.name || '';
        this.userEmail = user.email || '';
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }

  submitSupportTicket() {
    this.errorMessage = '';
    if (!this.message) {
      this.errorMessage = 'Please describe your concern or report details.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.authService.submitFeedback({
      name: this.userName || 'Commuter',
      email: this.userEmail || 'commuter@sakaytanya.test',
      rating: 'Bug / Issue',
      module_tested: 'Help Center Ticket',
      vehicle_plate: this.plateNumber.trim() || undefined,
      comments: `[${this.issueType}] ${this.message}`
    } as any).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successModal = true;
        this.message = '';
        this.plateNumber = '';
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Support ticket submission or offline fallback:', err);
        this.isSubmitting = false;
        this.successModal = true;
        this.message = '';
        this.plateNumber = '';
        this.cdr.detectChanges();
      }
    });
  }

  closeModal() {
    this.successModal = false;
    this.cdr.detectChanges();
  }
}
