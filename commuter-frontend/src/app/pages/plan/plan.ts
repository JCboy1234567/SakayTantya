import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  LucideMapPin,
  LucideCircleDot,
  LucideChevronRight,
  LucideMap,
  LucideArrowRight,
  LucideFuel,
  LucideArrowUpRight,
  LucideClock,
  LucideInfo
} from '@lucide/angular';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [
    CommonModule,
    LucideMapPin,
    LucideCircleDot,
    LucideChevronRight,
    LucideMap,
    LucideArrowRight,
    LucideFuel,
    LucideArrowUpRight,
    LucideClock,
    LucideInfo
  ],
  templateUrl: './plan.html'
})
export class Plan {
  pickupLocation = 'Tagum City Hall';
  destinationLocation = 'Tagum City Public Market';

  fuelPriceLabel = '₱60/L';
  isDarkMode = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';

    window.addEventListener('storage', () => {
      const theme = localStorage.getItem('theme');
      this.isDarkMode = theme === 'dark';
    });
  }

  selectLocation(type: 'pickup' | 'destination'): void {
    console.log(`Select ${type} location`);
  }

  openMap(): void {
    this.router.navigate(['/main-dashboard/map']);
  }

  estimateFare(): void {
    console.log('Estimate fare', {
      pickup: this.pickupLocation,
      destination: this.destinationLocation
    });
  }

  openFuelCosts(): void {
    this.router.navigate(['/main-dashboard/fuels']);
  }

  useExampleTrip(): void {
    this.pickupLocation = 'Tagum City Hall';
    this.destinationLocation = 'Tagum City Public Market';
  }
}
