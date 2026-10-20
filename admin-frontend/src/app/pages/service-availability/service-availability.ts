import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideActivity,
  LucidePlus,
  LucidePencil,
  LucideTrash,
  LucideX,
  LucideLoader,
  LucideCheck,
  LucideAlertCircle
} from '@lucide/angular';
import { FareService } from '../../core/services/fare.service';

@Component({
  selector: 'app-service-availability',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideActivity,
    LucidePlus,
    LucidePencil,
    LucideTrash,
    LucideX,
    LucideLoader,
    LucideCheck,
    LucideAlertCircle
  ],
  templateUrl: './service-availability.html',
  styleUrl: './service-availability.css',
})
export class ServiceAvailability implements OnInit {
  services: any[] = [];
  isLoading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Add Modal State
  showAddModal = false;
  showSuccessModal = false;
  successModalTitle = 'Service Availability Created Successfully!';
  successModalText = 'The new service route status has been saved to the database.';

  // Edit Modal State
  showEditModal = false;
  isEditing = false;
  editServiceId: number | null = null;
  editService = {
    service_name: '',
    route_zone: '',
    status: 'Operational',
    peak_hours: '',
    remarks: ''
  };

  // Delete Modal State
  showDeleteModal = false;
  serviceToDeleteId: number | null = null;
  serviceToDeleteName = '';
  isDeleting = false;

  newService = {
    service_name: 'Tagum City Tricycle Route Estimator',
    route_zone: 'Zone 1 - Central Business District',
    status: 'Operational',
    peak_hours: '07:00 AM - 09:00 AM',
    remarks: 'Normal operations reported across all terminals.'
  };

  constructor(
    private fareService: FareService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.getServiceAvailability().subscribe({
      next: (response: any) => {
        this.services = response.data || response;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching service availability:', err);
        this.errorMessage = 'Failed to load service availability records from database.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.successMessage = '';
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

  onSubmitService(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.createServiceAvailability(this.newService).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAddModal();
        this.loadServices();
        this.successModalTitle = 'Service Availability Created Successfully!';
        this.successModalText = 'The new service route status has been saved to the database.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error saving service:', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save service record. Ensure you are logged in as Admin.';
        this.cdr.detectChanges();
      }
    });
  }

  openEditModal(service: any): void {
    this.editServiceId = service.id;
    this.editService = {
      service_name: service.service_name,
      route_zone: service.route_zone,
      status: service.status,
      peak_hours: service.peak_hours || '',
      remarks: service.remarks || ''
    };
    this.showEditModal = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editServiceId = null;
    this.isEditing = false;
    this.cdr.detectChanges();
  }

  onUpdateService(): void {
    if (!this.editServiceId) return;

    this.isEditing = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.updateServiceAvailability(this.editServiceId, this.editService).subscribe({
      next: () => {
        this.isEditing = false;
        this.closeEditModal();
        this.loadServices();
        this.successModalTitle = 'Service Availability Updated Successfully!';
        this.successModalText = 'The service status record has been successfully updated.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating service:', err);
        this.isEditing = false;
        this.errorMessage = err.error?.message || 'Failed to update service record.';
        this.cdr.detectChanges();
      }
    });
  }

  openDeleteModal(service: any): void {
    this.serviceToDeleteId = service.id;
    this.serviceToDeleteName = `${service.service_name} (${service.route_zone})`;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.serviceToDeleteId = null;
    this.serviceToDeleteName = '';
    this.isDeleting = false;
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    if (!this.serviceToDeleteId) return;

    this.isDeleting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.deleteServiceAvailability(this.serviceToDeleteId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.services = this.services.filter(s => s.id !== this.serviceToDeleteId);
        this.successMessage = 'Service availability record deleted successfully.';
        this.closeDeleteModal();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        console.error('Error deleting service:', err);
        this.isDeleting = false;
        this.errorMessage = err.error?.message || 'Failed to delete service record.';
        this.closeDeleteModal();
        this.cdr.detectChanges();
      }
    });
  }
}
