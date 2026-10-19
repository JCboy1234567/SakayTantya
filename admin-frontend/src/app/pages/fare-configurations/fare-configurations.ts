import { Component } from '@angular/core';
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
  LucideX
} from '@lucide/angular';

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
    LucideX
  ],
  templateUrl: './fare-configurations.html',
  styleUrl: './fare-configurations.css',
})
export class FareConfigurations {
  // Static sample data para sa Tagum City transport
  fareRules = [
    {
      id: 1,
      vehicle: 'Motorized Tricycle',
      fuel: 'Gasoline (Regular)',
      baseFare: '₱15.00',
      includedDistance: 'First 2.0 km',
      ratePerKm: '₱2.00 / km',
      minimumFare: '₱15.00',
      validFrom: '2026-01-01',
      validUntil: 'Indefinite',
      status: 'Enabled',
      source: 'Tagum City Ordinance #2025-04'
    },
    {
      id: 2,
      vehicle: 'Multicab / Jeepney',
      fuel: 'Diesel',
      baseFare: '₱12.00',
      includedDistance: 'First 3.0 km',
      ratePerKm: '₱1.50 / km',
      minimumFare: '₱12.00',
      validFrom: '2026-01-01',
      validUntil: 'Indefinite',
      status: 'Enabled',
      source: 'LTFRB Regional Memo'
    },
    {
      id: 3,
      vehicle: 'Modern PUV',
      fuel: 'Electric / Diesel',
      baseFare: '₱20.00',
      includedDistance: 'First 4.0 km',
      ratePerKm: '₱2.50 / km',
      minimumFare: '₱20.00',
      validFrom: '2026-06-01',
      validUntil: '2026-12-31',
      status: 'Draft',
      source: 'Proposed Tariff 2026'
    }
  ];

  successMessage = '';
  showAddModal = false;

  // New rule form model
  newRule = {
    vehicle: 'Motorized Tricycle',
    baseFare: 15.00,
    includedDistance: 2.00,
    ratePerKm: 2.00,
    minimumFare: 15.00,
    validFrom: '2026-10-19',
    validUntil: '',
    source: 'Tagum City Admin'
  };

  openAddModal(): void {
    this.showAddModal = true;
    this.successMessage = '';
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onSubmitRule(): void {
    // Static simulation of adding a rule
    this.fareRules.unshift({
      id: this.fareRules.length + 1,
      vehicle: this.newRule.vehicle,
      fuel: 'Gasoline',
      baseFare: `₱${Number(this.newRule.baseFare).toFixed(2)}`,
      includedDistance: `First ${this.newRule.includedDistance} km`,
      ratePerKm: `₱${Number(this.newRule.ratePerKm).toFixed(2)} / km`,
      minimumFare: `₱${Number(this.newRule.minimumFare).toFixed(2)}`,
      validFrom: this.newRule.validFrom,
      validUntil: this.newRule.validUntil || 'Indefinite',
      status: 'Enabled',
      source: this.newRule.source
    });

    this.successMessage = 'New fare configuration added successfully!';
    this.closeAddModal();

    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  deleteRule(id: number): void {
    if (confirm('Are you sure you want to delete this fare rule?')) {
      this.fareRules = this.fareRules.filter(r => r.id !== id);
      this.successMessage = 'Fare rule deleted successfully.';
      setTimeout(() => this.successMessage = '', 4000);
    }
  }
}
