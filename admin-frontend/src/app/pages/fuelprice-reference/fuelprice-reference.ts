import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideFuel,
  LucidePlus,
  LucidePencil,
  LucideTrash,
  LucideX,
  LucideLoader,
  LucideCheckCircle2,
  LucideAlertTriangle
} from '@lucide/angular';
import { FareService } from '../../core/services/fare.service';

@Component({
  selector: 'app-fuelprice-reference',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideFuel,
    LucidePlus,
    LucidePencil,
    LucideTrash,
    LucideX,
    LucideLoader,
    LucideCheckCircle2,
    LucideAlertTriangle
  ],
  templateUrl: './fuelprice-reference.html',
  styleUrl: './fuelprice-reference.css',
})
export class FuelpriceReference implements OnInit {
  fuelPrices: any[] = [];
  isLoading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Add Modal State
  showAddModal = false;
  showSuccessModal = false;
  successModalTitle = 'Fuel Price Created Successfully!';
  successModalText = 'The new fuel price reference has been saved and synchronized with the database.';

  // Edit Modal State
  showEditModal = false;
  isEditing = false;
  editFuelId: number | null = null;
  editFuel = {
    fuel_type: 'Gasoline (Regular)',
    price_per_liter: 62.50,
    effective_date: '',
    source_reference: ''
  };

  // Modern Delete Confirmation Modal State
  showDeleteModal = false;
  fuelToDeleteId: number | null = null;
  fuelToDeleteName = '';
  isDeleting = false;

  newFuel = {
    fuel_type: 'Gasoline (Regular)',
    price_per_liter: 62.50,
    effective_date: '2026-10-19',
    source_reference: 'DOE Region XI Monitor'
  };

  readonly Number = Number;

  get uniqueFuelPrices(): any[] {
    const map = new Map();
    for (const item of this.fuelPrices) {
      const type = item.fuel_type;
      if (!map.has(type)) {
        map.set(type, item);
      } else {
        const existing = map.get(type);
        const dateExisting = new Date(existing.effective_date || existing.created_at).getTime();
        const dateItem = new Date(item.effective_date || item.created_at).getTime();
        if (dateItem > dateExisting || (dateItem === dateExisting && item.id > existing.id)) {
          map.set(type, item);
        }
      }
    }
    return Array.from(map.values());
  }

  constructor(
    private fareService: FareService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFuelPrices();
  }

  loadFuelPrices(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.getFuelPrices().subscribe({
      next: (data) => {
        this.fuelPrices = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching fuel prices:', err);
        this.errorMessage = 'Failed to load fuel prices from database.';
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

  onSubmitFuel(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.createFuelPrice(this.newFuel).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAddModal();
        this.loadFuelPrices();
        this.successModalTitle = 'Fuel Price Created Successfully!';
        this.successModalText = 'The new fuel price reference has been saved and synchronized with the database.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error saving fuel price:', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save fuel price. Ensure you are logged in as Admin.';
        this.cdr.detectChanges();
      }
    });
  }

  // Buksan ang Edit Modal
  openEditModal(fuel: any): void {
    this.editFuelId = fuel.id;
    // Default to today's date so historical records accurately reflect when the change was made
    const today = new Date().toISOString().split('T')[0];
    this.editFuel = {
      fuel_type: fuel.fuel_type,
      price_per_liter: Number(fuel.price_per_liter),
      effective_date: today,
      source_reference: fuel.source_reference || ''
    };
    this.showEditModal = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editFuelId = null;
    this.isEditing = false;
    this.cdr.detectChanges();
  }

  // I-submit ang Edit/Update sa database
  onUpdateFuel(): void {
    if (!this.editFuelId) return;

    this.isEditing = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.updateFuelPrice(this.editFuelId, this.editFuel).subscribe({
      next: () => {
        this.isEditing = false;
        this.closeEditModal();
        this.loadFuelPrices();
        this.successModalTitle = 'Fuel Price Updated Successfully!';
        this.successModalText = 'The fuel price reference has been successfully modified in the database.';
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating fuel price:', err);
        this.isEditing = false;
        this.errorMessage = err.error?.message || 'Failed to update fuel price record.';
        this.cdr.detectChanges();
      }
    });
  }

  // Buksan ang modern delete modal
  openDeleteModal(fuel: any): void {
    this.fuelToDeleteId = fuel.id;
    this.fuelToDeleteName = `${fuel.fuel_type} (₱${fuel.price_per_liter})`;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  // Isara ang delete modal
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.fuelToDeleteId = null;
    this.fuelToDeleteName = '';
    this.isDeleting = false;
    this.cdr.detectChanges();
  }

  // I-execute ang pag-delete sa database
  confirmDelete(): void {
    if (!this.fuelToDeleteId) return;

    this.isDeleting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.deleteFuelPrice(this.fuelToDeleteId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.fuelPrices = this.fuelPrices.filter(f => f.id !== this.fuelToDeleteId);
        this.successMessage = 'Fuel price record deleted from database successfully.';
        this.closeDeleteModal();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        console.error('Error deleting fuel price:', err);
        this.isDeleting = false;
        this.errorMessage = err.error?.message || 'Failed to delete fuel price record.';
        this.closeDeleteModal();
        this.cdr.detectChanges();
      }
    });
  }
}
