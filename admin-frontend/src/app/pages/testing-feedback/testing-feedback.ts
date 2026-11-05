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
  successMessage = '';
  errorMessage = '';

  // Filter & Stats
  selectedModuleFilter = 'All';
  selectedRatingFilter = 'All';

  // Computed filtered feedbacks based on module filter
  get filteredFeedbacks(): any[] {
    if (this.selectedModuleFilter === 'All') {
      return this.feedbacks;
    }
    return this.feedbacks.filter(f => f.module_tested === this.selectedModuleFilter);
  }

  // Success Modal State
  showSuccessModal = false;
  successModalTitle = 'Success!';
  successModalText = 'Operation completed successfully.';

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

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  get totalPages(): number {
    return Math.ceil(this.filteredFeedbacks.length / this.itemsPerPage);
  }

  get paginatedFeedbacks(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredFeedbacks.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  openDeleteModal(item: any): void {
    this.feedbackToDeleteId = item.id;
    this.feedbackToDeleteName = `Report from ${item.tester_name} (${item.module_tested})`;
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
        this.successMessage = 'Feedback / Report record deleted successfully.';
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
        this.errorMessage = err.error?.message || 'Failed to delete record. Ensure admin privileges.';
        this.closeDeleteModal();
        this.cdr.detectChanges();
      }
    });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.cdr.detectChanges();
  }

  getRatingBadgeClass(rating: string): string {
    switch (rating) {
      case 'Excellent':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'Good':
        return 'bg-green-500/10 text-green-800 dark:text-green-400 border-green-500/20';
      case 'Needs Improvement':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case 'Bug / Issue':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'In Progress':
        return 'bg-green-900/10 text-green-900 dark:text-green-300 border-green-900/20';
      case 'Pending Review':
      default:
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    }
  }

  // Math helper for template
  Math = Math;
}
