import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideSlidersHorizontal,
  LucidePlus,
  LucideCheckCircle2,
  LucideAlertCircle,
  LucideRefreshCw,
  LucidePencil,
  LucideTrash2,
  LucideX,
  LucideLoader
} from '@lucide/angular';
import { FareService } from '../../core/services/fare.service';

@Component({
  selector: 'app-fare-configurations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideSlidersHorizontal,
    LucidePlus,
    LucideCheckCircle2,
    LucideAlertCircle,
    LucideRefreshCw,
    LucidePencil,
    LucideTrash2,
    LucideX,
    LucideLoader
  ],
  templateUrl: './fare-configurations.html',
  styleUrl: './fare-configurations.css',
})
export class FareConfigurations implements OnInit {
  fareRules: any[] = [];
  availableVehicles: any[] = [];
  isLoading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  showAddModal = false;
  isEditMode = false;
  editingRuleId: number | null = null;

  readonly Number = Number;

  newRule = {
    vehicle_id: '',
    base_fare: 15.00,
    included_distance_km: 2.00,
    rate_per_km: 2.00,
    minimum_fare: 15.00,
    valid_from: '2026-10-21',
    valid_until: '',
    source_reference: 'Tagum City LGU'
  };

  constructor(
    private fareService: FareService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
    this.loadFareRules();
  }

  loadVehicles(): void {
    this.fareService.getVehicles().subscribe({
      next: (response: any) => {
        this.availableVehicles = response.data || response || [];
        if (this.availableVehicles.length > 0 && !this.newRule.vehicle_id) {
          this.newRule.vehicle_id = this.availableVehicles[0].id;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading vehicles for fare rules:', err);
      }
    });
  }

  loadFareRules(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.fareService.getFareRules().subscribe({
      next: (response: any) => {
        this.fareRules = response.data || response || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching fare rules:', err);
        this.errorMessage = 'Failed to load fare rules from database.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal(): void {
    this.loadVehicles();
    this.isEditMode = false;
    this.editingRuleId = null;
    this.newRule = {
      vehicle_id: this.availableVehicles.length > 0 ? this.availableVehicles[0].id : '',
      base_fare: 15.00,
      included_distance_km: 2.00,
      rate_per_km: 2.00,
      minimum_fare: 15.00,
      valid_from: '2026-10-21',
      valid_until: '',
      source_reference: 'Tagum City LGU'
    };
    this.showAddModal = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  openEditModal(rule: any): void {
    this.loadVehicles();
    this.isEditMode = true;
    this.editingRuleId = rule.id;
    this.newRule = {
      vehicle_id: rule.vehicle_id,
      base_fare: rule.base_fare,
      included_distance_km: rule.included_distance_km,
      rate_per_km: rule.rate_per_km,
      minimum_fare: rule.minimum_fare,
      valid_from: rule.valid_from ? rule.valid_from.substring(0, 10) : '2026-10-21',
      valid_until: rule.valid_until ? rule.valid_until.substring(0, 10) : '',
      source_reference: rule.source_reference
    };
    this.showAddModal = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.cdr.detectChanges();
  }

  onSubmitRule(): void {
    if (!this.newRule.vehicle_id) {
      this.errorMessage = 'Please select a valid vehicle type.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const request$ = this.isEditMode && this.editingRuleId
      ? this.fareService.updateFareRule(this.editingRuleId, this.newRule)
      : this.fareService.createFareRule(this.newRule);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAddModal();
        this.loadFareRules();
        this.successMessage = this.isEditMode
          ? 'Fare rule configuration updated successfully!'
          : 'New fare rule configuration saved to database successfully!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error saving fare rule:', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save fare rule. Ensure you are logged in as Admin.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteRule(id: number): void {
    if (confirm('Are you sure you want to delete this fare rule?')) {
      this.fareService.deleteFareRule(id).subscribe({
        next: () => {
          this.fareRules = this.fareRules.filter(r => r.id !== id);
          this.successMessage = 'Fare rule removed successfully from database.';
          this.cdr.detectChanges();

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 4000);
        },
        error: (err) => {
          console.error('Error deleting fare rule:', err);
          this.errorMessage = err.error?.message || 'Failed to delete fare rule record.';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
