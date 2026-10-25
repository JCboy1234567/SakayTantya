import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideFuel,
  LucideSlidersHorizontal,
  LucideBike,
  LucideClipboardCheck,
  LucideTrendingUp,
  LucideMapPin,
  LucideRoute,
  LucideGauge,
  LucidePencil,
  LucideArrowUpRight,
  LucideCircleCheck,
  LucideClock,
  LucideFlaskConical,
  LucideArrowRight,
  LucideLoader
} from '@lucide/angular';
import { FareService } from '../../core/services/fare.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideFuel,
    LucideSlidersHorizontal,
    LucideBike,
    LucideClipboardCheck,
    LucideTrendingUp,
    LucideMapPin,
    LucideRoute,
    LucideGauge,
    LucidePencil,
    LucideArrowUpRight,
    LucideCircleCheck,
    LucideClock,
    LucideFlaskConical,
    LucideArrowRight,
    LucideLoader
  ],
  templateUrl: './overview.html'
})
export class Overview implements OnInit {
  isLoading = false;
  latestFuelPrice: number = 60.00;
  latestFuelDate: string = 'Today';
  fuelPricesList: any[] = [];
  fareRules: any[] = [];
  vehicles: any[] = [];
  feedbacks: any[] = [];

  readonly scenarios = [
    { price: 55, expense: 11 },
    { price: 60, expense: 12 },
    { price: 65, expense: 13 }
  ];

  selectedFuelType = 'All';
  selectedScenario = 60;
  get availableFuelTypes(): string[] {
    const types = this.fuelPricesList.map(item => item.fuel_type).filter(Boolean);
    return Array.from(new Set(types));
  }

  get filteredFuelPrices(): any[] {
    if (this.selectedFuelType === 'All') {
      return this.fuelPricesList;
    }
    return this.fuelPricesList.filter(item => item.fuel_type === this.selectedFuelType);
  }

  constructor(
    private fareService: FareService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    // Fetch live fuel prices
    this.fareService.getFuelPrices().subscribe({
      next: (res: any) => {
        const prices = res.data || res || [];
        this.fuelPricesList = prices;
        if (prices.length > 0) {
          const filtered = this.selectedFuelType === 'All' ? prices : prices.filter((p: any) => p.fuel_type === this.selectedFuelType);
          const targetList = filtered.length > 0 ? filtered : prices;
          const latest = targetList[targetList.length - 1];
          this.latestFuelPrice = Number(latest.price_per_liter) || 60.00;
          this.selectedScenario = this.latestFuelPrice;
          this.latestFuelDate = latest.effective_date || latest.created_at || 'Today';
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading fuel prices for overview:', err)
    });

    // Fetch live fare rules
    this.fareService.getFareRules().subscribe({
      next: (res: any) => {
        const rules = res.data || res || [];
        this.fareRules = rules.map((r: any) => ({
          vehicle: r.vehicle ? r.vehicle.vehicle_name : `Vehicle #${r.vehicle_id}`,
          fuel: r.vehicle ? `${r.vehicle.fuel_type}` : 'Gasoline',
          baseFare: `₱${Number(r.base_fare).toFixed(2)}`,
          included: `First ${r.included_distance_km} km`,
          rate: `₱${Number(r.rate_per_km).toFixed(2)} / km`,
          efficiency: r.vehicle ? `${r.vehicle.fuel_efficiency_km_per_liter} km/L` : 'N/A',
          status: 'Enabled'
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading fare rules for overview:', err)
    });

    // Fetch live vehicles
    this.fareService.getVehicles().subscribe({
      next: (res: any) => {
        this.vehicles = res.data || res || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading vehicles for overview:', err)
    });

    // Fetch live testing feedback / bugs
    this.fareService.getTestingFeedback().subscribe({
      next: (res: any) => {
        this.feedbacks = res.data || res || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading feedbacks for overview:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFuelTypeChange(): void {
    const filtered = this.selectedFuelType === 'All'
      ? this.fuelPricesList
      : this.fuelPricesList.filter((p: any) => p.fuel_type === this.selectedFuelType);

    if (filtered.length > 0) {
      const latest = filtered[filtered.length - 1];
      this.latestFuelPrice = Number(latest.price_per_liter) || 60.00;
      this.selectedScenario = this.latestFuelPrice;
      this.latestFuelDate = latest.effective_date || latest.created_at || 'Today';
    }
    this.cdr.detectChanges();
  }

  get selectedFuelExpense(): number {
    return (5 / 25) * this.selectedScenario;
  }

  get activeList(): any[] {
    return this.selectedFuelType === 'All'
      ? this.fuelPricesList
      : this.fuelPricesList.filter(item => item.fuel_type === this.selectedFuelType);
  }

  get chartPoints(): string {
    const list = this.activeList;
    if (list.length === 0) return '20,100 548,100';
    const slice = list.slice(-7);
    const values = slice.map((p: any) => Number(p.price_per_liter) || 60);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = (maxVal - minVal) || 1;

    return slice
      .map((point: any, index: number) => {
        const x = slice.length === 1 ? 284 : 20 + index * (528 / (slice.length - 1));
        const val = Number(point.price_per_liter) || 60;
        const y = slice.length === 1 ? 70 : (maxVal === minVal ? 70 : 110 - ((val - minVal) / range) * 80);
        return `${isNaN(x) ? 20 : x},${isNaN(y) ? 100 : y}`;
      })
      .join(' ');
  }

  get chartArea(): string {
    const list = this.activeList.slice(-7);
    if (list.length === 0) return '20,112 548,112';
    const firstX = 20;
    const lastX = list.length === 1 ? 284 : 20 + (list.length - 1) * (528 / (list.length - 1));
    return `${firstX},120 ${this.chartPoints} ${lastX},120`;
  }

  get fuelPrices(): any[] {
    const list = this.activeList;
    if (list.length === 0) {
      return [
        { day: 'Recent', value: this.latestFuelPrice, cx: 284, cy: 70 }
      ];
    }
    const slice = list.slice(-7);
    const values = slice.map((p: any) => Number(p.price_per_liter) || 60);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = (maxVal - minVal) || 1;

    return slice.map((item: any, index: number) => {
      const val = Number(item.price_per_liter) || 60;
      const x = slice.length === 1 ? 284 : 20 + index * (528 / (slice.length - 1));
      const y = slice.length === 1 ? 70 : (maxVal === minVal ? 70 : 110 - ((val - minVal) / range) * 80);

      let formattedDate = 'Recent';
      const rawDate = item.effective_date || item.created_at;
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          } else {
            formattedDate = String(rawDate).substring(0, 10);
          }
        } catch {
          formattedDate = String(rawDate).substring(0, 10);
        }
      }

      return {
        day: formattedDate,
        value: val,
        cx: isNaN(x) ? 20 : x,
        cy: isNaN(y) ? 100 : y
      };
    });
  }
}