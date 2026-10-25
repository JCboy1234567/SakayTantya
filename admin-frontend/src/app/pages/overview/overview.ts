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

  selectScenario(price: number): void {
    this.selectedScenario = price;
  }

  get selectedFuelExpense(): number {
    return (5 / 25) * this.selectedScenario;
  }

  get chartPoints(): string {
    if (this.fuelPricesList.length === 0) return '20,100 548,100';
    return this.fuelPricesList
      .slice(-7)
      .map((point: any, index: number) => {
        const x = 20 + index * 88;
        const val = Number(point.price_per_liter) || 60;
        const y = Math.max(20, Math.min(120, 100 - (val - 54) * 5));
        return `${x},${y}`;
      })
      .join(' ');
  }

  get chartArea(): string {
    return `20,112 ${this.chartPoints} 548,112`;
  }

  get fuelPrices(): any[] {
    const list = this.selectedFuelType === 'All'
      ? this.fuelPricesList
      : this.fuelPricesList.filter(item => item.fuel_type === this.selectedFuelType);

    if (list.length === 0) {
      return [
        { day: 'Day 1', value: this.latestFuelPrice },
        { day: 'Day 2', value: this.latestFuelPrice }
      ];
    }
    return list.slice(-7).map((item: any) => ({
      day: item.effective_date ? item.effective_date : (item.created_at ? item.created_at.substring(0, 10) : 'Recent'),
      value: Number(item.price_per_liter) || 60
    }));
  }
}