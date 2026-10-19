import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideRoute,
  LucideMapPin,
  LucideBike,
  LucideCalculator,
  LucideArrowRight,
  LucideClock
} from '@lucide/angular';

@Component({
  selector: 'app-routes-estimates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideRoute,
    LucideMapPin,
    LucideBike,
    LucideCalculator,
    LucideArrowRight,
    LucideClock,
  ],
  templateUrl: './routes-estimates.html',
  styleUrl: './routes-estimates.css',
})
export class RoutesEstimates {
  // Simulator form state
  pickup = 'Tagum City Hall';
  destination = 'Tagum City Public Market';
  distanceKm = 5.0;
  selectedVehicle = 'Motorized Tricycle';
  baseFare = 15.00;
  ratePerKm = 2.00;
  includedKm = 2.0;

  // Recent estimates history (Sample data)
  recentEstimates = [
    { id: 1, user: 'Admin User', pickup: 'Tagum City Hall', destination: 'Public Market', distance: '5.0 km', vehicle: 'Tricycle', fare: '₱21.00', date: '2026-10-18' },
    { id: 2, user: 'Admin User', pickup: ' Robinsons Place Tagum', destination: 'Visayan Village', distance: '3.8 km', vehicle: 'Tricycle', fare: '₱18.60', date: '2026-10-18' },
    { id: 3, user: 'System Test', pickup: 'New Transport Terminal', destination: 'Briz District', distance: '7.2 km', vehicle: 'Multicab', fare: '₱31.40', date: '2026-10-17' },
  ];

  get calculatedFare(): number {
    if (this.distanceKm <= this.includedKm) {
      return this.baseFare;
    }
    const extraKm = this.distanceKm - this.includedKm;
    return this.baseFare + (extraKm * this.ratePerKm);
  }

  onSimulate(): void {
    // Trigger simulation or calculation action
    console.log('Simulating route:', {
      pickup: this.pickup,
      destination: this.destination,
      distance: this.distanceKm,
      fare: this.calculatedFare
    });
  }
}
