import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideTruck,
  LucidePlus,
  LucidePencil,
  LucideTrash,
  LucideX,
  LucideLoader,
  LucideCheck,
  LucideAlertCircle,
  LucideImage
} from '@lucide/angular';
import { FareService } from '../../core/services/fare.service';

@Component({
  selector: 'app-vehicles-efficiency',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideTruck,
    LucidePlus,
    LucidePencil,
    LucideTrash,
    LucideX,
    LucideLoader,
    LucideCheck,
    LucideAlertCircle,
    LucideImage
  ],
  templateUrl: './vehicles-efficiency.html',
  styleUrl: './vehicles-efficiency.css',
})
export class VehiclesEfficiency implements OnInit {
  vehicles: any[] = [];
  fuelPrices: any[] = [];
  isLoading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Add Modal State
  showAddModal = false;
  showSuccessModal = false;
  successModalTitle = 'Vehicle Profile Created Successfully!';
  successModalText = 'The new vehicle profile and photo have been saved to the database.';

  // Edit Modal State
  showEditModal = false;
  isEditing = false;
  editVehicleId: number | null = null;
  editVehicle = {
    vehicle_name: '',
    fuel_type: '',
    fuel_efficiency_km_per_liter: 10,
    description: '',
    is_active: true
  };
  editSelectedFile: File | null = null;
  editImagePreview: string | null = null;

  // Delete Modal State
  showDeleteModal = false;
  vehicleToDeleteId: number | null = null;
  vehicleToDeleteName = '';
  isDeleting = false;

  newVehicle = {
    vehicle_name: '',
    fuel_type: '',
    fuel_efficiency_km_per_liter: 12.5,
    description: '',
    is_active: true
  };
  newSelectedFile: File | null = null;
  newImagePreview: string | null = null;

  readonly Number = Number;

  constructor(
    private fareService: FareService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
    this.loadFuelPrices();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.getVehicles().subscribe({
      next: (response: any) => {
        this.vehicles = response.data || response;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching vehicles:', err);
        this.errorMessage = 'Failed to load vehicle profiles from database.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadFuelPrices(): void {
    this.fareService.getFuelPrices().subscribe({
      next: (response: any) => {
        const prices = response.data || response;
        if (Array.isArray(prices)) {
          this.fuelPrices = prices;
          if (this.fuelPrices.length > 0 && !this.newVehicle.fuel_type) {
            this.newVehicle.fuel_type = this.fuelPrices[0].fuel_type || this.fuelPrices[0].name;
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('Could not fetch fuel prices for dropdown:', err);
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.newSelectedFile = null;
    this.newImagePreview = null;
    this.newVehicle = {
      vehicle_name: '',
      fuel_type: this.fuelPrices.length > 0 ? (this.fuelPrices[0].fuel_type || this.fuelPrices[0].name) : 'Gasoline (Regular)',
      fuel_efficiency_km_per_liter: 12.5,
      description: '',
      is_active: true
    };
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

  onFileSelected(event: any, mode: 'new' | 'edit'): void {
    const file = event.target.files[0];
    if (file) {
      if (mode === 'new') {
        this.newSelectedFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newImagePreview = e.target.result;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      } else {
        this.editSelectedFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.editImagePreview = e.target.result;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmitVehicle(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('vehicle_name', this.newVehicle.vehicle_name);
    formData.append('fuel_type', this.newVehicle.fuel_type);
    formData.append('fuel_efficiency_km_per_liter', this.newVehicle.fuel_efficiency_km_per_liter.toString());
    formData.append('description', this.newVehicle.description || '');
    formData.append('is_active', this.newVehicle.is_active ? '1' : '0');
    if (this.newSelectedFile) {
      formData.append('image', this.newSelectedFile);
    }

    this.fareService.createVehicle(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAddModal();
        this.loadVehicles();
        this.successModalTitle = 'Vehicle Profile Created Successfully!';
        this.successModalText = 'The new vehicle profile and photo have been saved to the database.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error saving vehicle:', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save vehicle profile. Ensure you are logged in as Admin.';
        this.cdr.detectChanges();
      }
    });
  }

  openEditModal(vehicle: any): void {
    this.editVehicleId = vehicle.id;
    this.editVehicle = {
      vehicle_name: vehicle.vehicle_name,
      fuel_type: vehicle.fuel_type,
      fuel_efficiency_km_per_liter: Number(vehicle.fuel_efficiency_km_per_liter),
      description: vehicle.description || '',
      is_active: vehicle.is_active == 1 || vehicle.is_active === true
    };
    this.editSelectedFile = null;
    this.editImagePreview = vehicle.image || null;
    this.showEditModal = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editVehicleId = null;
    this.isEditing = false;
    this.cdr.detectChanges();
  }

  onUpdateVehicle(): void {
    if (!this.editVehicleId) return;

    this.isEditing = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    let payload: any;

    if (this.editSelectedFile) {
      const formData = new FormData();
      formData.append('vehicle_name', this.editVehicle.vehicle_name);
      formData.append('fuel_type', this.editVehicle.fuel_type);
      formData.append('fuel_efficiency_km_per_liter', this.editVehicle.fuel_efficiency_km_per_liter.toString());
      formData.append('description', this.editVehicle.description || '');
      formData.append('is_active', this.editVehicle.is_active ? '1' : '0');
      formData.append('image', this.editSelectedFile);
      payload = formData;
    } else {
      payload = {
        vehicle_name: this.editVehicle.vehicle_name,
        fuel_type: this.editVehicle.fuel_type,
        fuel_efficiency_km_per_liter: Number(this.editVehicle.fuel_efficiency_km_per_liter),
        description: this.editVehicle.description || '',
        is_active: this.editVehicle.is_active ? 1 : 0
      };
    }

    this.fareService.updateVehicle(this.editVehicleId, payload).subscribe({
      next: () => {
        this.isEditing = false;
        this.closeEditModal();
        this.loadVehicles();
        this.successModalTitle = 'Vehicle Profile Updated Successfully!';
        this.successModalText = 'The vehicle profile has been successfully updated.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating vehicle:', err);
        this.isEditing = false;
        this.errorMessage = err.error?.message || 'Failed to update vehicle record.';
        this.cdr.detectChanges();
      }
    });
  }

  openDeleteModal(vehicle: any): void {
    this.vehicleToDeleteId = vehicle.id;
    this.vehicleToDeleteName = vehicle.vehicle_name;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.vehicleToDeleteId = null;
    this.vehicleToDeleteName = '';
    this.isDeleting = false;
    this.cdr.detectChanges();
  }

  confirmDelete(): void {
    if (!this.vehicleToDeleteId) return;

    this.isDeleting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.deleteVehicle(this.vehicleToDeleteId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.vehicles = this.vehicles.filter(v => v.id !== this.vehicleToDeleteId);
        this.successMessage = 'Vehicle record deleted successfully.';
        this.closeDeleteModal();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        console.error('Error deleting vehicle:', err);
        this.isDeleting = false;
        this.errorMessage = err.error?.message || 'Failed to delete vehicle record.';
        this.closeDeleteModal();
        this.cdr.detectChanges();
      }
    });
  }
}
