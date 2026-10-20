import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideMessageSquare,
  LucidePlus,
  LucideTrash,
  LucidePencil,
  LucideX,
  LucideLoader,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideStar,
  LucideUser,
  LucideMail,
  LucideCheck,
  LucideClock,
  LucideShieldAlert
} from '@lucide/angular';
import { FareService } from '../../core/services/fare.service';

@Component({
  selector: 'app-testing-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideMessageSquare,
    LucidePlus,
    LucideTrash,
    LucidePencil,
    LucideX,
    LucideLoader,
    LucideCheckCircle2,
    LucideAlertTriangle,
    LucideStar,
    LucideUser,
    LucideMail,
    LucideCheck,
    LucideClock,
    LucideShieldAlert
  ],
  templateUrl: './testing-feedback.html',
  styleUrl: './testing-feedback.css'
})
export class TestingFeedback implements OnInit {
  feedbacks: any[] = [];
  isLoading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Filter & Stats
  selectedModuleFilter = 'All';
  selectedRatingFilter = 'All';

  // Add Feedback Modal State
  showAddModal = false;
  showSuccessModal = false;
  successModalTitle = 'Feedback Submitted Successfully!';
  successModalText = 'Thank you for your valuable feedback. Our quality assurance team has logged your submission.';

  newFeedback = {
    tester_name: '',
    email: '',
    module_tested: 'Fare Estimator',
    rating: 'Good',
    feedback_comments: '',
    status: 'Pending Review'
  };

  // Edit Modal State
  showEditModal = false;
  isEditing = false;
  editFeedbackId: number | null = null;
  editFeedback = {
    tester_name: '',
    email: '',
    module_tested: '',
    rating: 'Good',
    feedback_comments: '',
    status: 'Pending Review'
  };

  // Delete Modal State
  showDeleteModal = false;
  feedbackToDeleteId: number | null = null;
  feedbackToDeleteName = '';
  isDeleting = false;

  constructor(
    private fareService: FareService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.getTestingFeedback().subscribe({
      next: (response: any) => {
        this.feedbacks = response.data || response || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading feedback:', err);
        this.errorMessage = 'Failed to load testing feedback from database.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredFeedbacks(): any[] {
    return this.feedbacks.filter(item => {
      const matchModule = this.selectedModuleFilter === 'All' || item.module_tested === this.selectedModuleFilter;
      const matchRating = this.selectedRatingFilter === 'All' || item.rating === this.selectedRatingFilter;
      return matchModule && matchRating;
    });
  }

  openAddModal(): void {
    this.newFeedback = {
      tester_name: '',
      email: '',
      module_tested: 'Fare Estimator',
      rating: 'Good',
      feedback_comments: '',
      status: 'Pending Review'
    };
    this.showAddModal = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.cdr.detectChanges();
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.cdr.detectChanges();
  }

  onSubmitFeedback(): void {
    if (!this.newFeedback.tester_name || !this.newFeedback.email || !this.newFeedback.feedback_comments) {
      this.errorMessage = 'Please fill in all required fields.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.createTestingFeedback(this.newFeedback).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAddModal();
        this.loadFeedbacks();
        this.successModalTitle = 'Feedback Submitted Successfully!';
        this.successModalText = 'Thank you! Your feedback has been recorded successfully in the system.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error submitting feedback:', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to submit feedback.';
        this.cdr.detectChanges();
      }
    });
  }

  openEditModal(item: any): void {
    this.editFeedbackId = item.id;
    this.editFeedback = {
      tester_name: item.tester_name,
      email: item.email,
      module_tested: item.module_tested,
      rating: item.rating,
      feedback_comments: item.feedback_comments,
      status: item.status || 'Pending Review'
    };
    this.showEditModal = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editFeedbackId = null;
    this.cdr.detectChanges();
  }

  onUpdateFeedback(): void {
    if (!this.editFeedbackId) return;

    this.isEditing = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.updateTestingFeedback(this.editFeedbackId, this.editFeedback).subscribe({
      next: () => {
        this.isEditing = false;
        this.closeEditModal();
        this.loadFeedbacks();
        this.successModalTitle = 'Feedback Updated Successfully!';
        this.successModalText = 'The feedback record status and notes have been updated.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating feedback:', err);
        this.isEditing = false;
        this.errorMessage = err.error?.message || 'Failed to update feedback. Ensure admin privileges.';
        this.cdr.detectChanges();
      }
    });
  }

  openDeleteModal(item: any): void {
    this.feedbackToDeleteId = item.id;
    this.feedbackToDeleteName = `Feedback from ${item.tester_name} (${item.module_tested})`;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.feedbackToDeleteId = null;
    this.feedbackToDeleteName = '';
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    if (!this.feedbackToDeleteId) return;

    this.isDeleting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.deleteTestingFeedback(this.feedbackToDeleteId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.feedbacks = this.feedbacks.filter(f => f.id !== this.feedbackToDeleteId);
        this.successMessage = 'Feedback record deleted successfully.';
        this.closeDeleteModal();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        console.error('Error deleting feedback:', err);
        this.isDeleting = false;
        this.errorMessage = err.error?.message || 'Failed to delete feedback record. Ensure admin privileges.';
        this.closeDeleteModal();
        this.cdr.detectChanges();
      }
    });
  }

  getRatingBadgeClass(rating: string): string {
    switch (rating) {
      case 'Excellent':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Good':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Needs Improvement':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Bug / Issue':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In Progress':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Pending Review':
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  }
}
