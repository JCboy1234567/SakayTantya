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
  LucideLoader,
  LucideLayoutDashboard,
  LucideTrash,
  LucideX
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
    LucideLoader,
    LucideLayoutDashboard,
    LucideTrash,
    LucideX
  ],
  templateUrl: './overview.html'
})
export class Overview implements OnInit {
  isLoading = false;
  latestFuelPrice: number = 60.00;
  latestFuelDate: string = 'Today';
  fuelPricesList: any[] = [];
  fareRules: any[] = [];
  rawFareRules: any[] = [];
  showEditRuleModal = false;
  showDeleteRuleModal = false;
  ruleToDelete: any = null;
  isSavingRule = false;
  isDeletingRule = false;
  editRule = {
    id: null,
    vehicle_id: '',
    base_fare: 15,
    included_distance_km: 2,
    rate_per_km: 2,
    minimum_fare: 15,
    source_reference: 'Tagum City LGU'
  };
  vehicles: any[] = [];
  feedbacks: any[] = [];

  readonly scenarios = [
    { price: 55, expense: 11 },
    { price: 60, expense: 12 },
    { price: 65, expense: 13 }
  ];

  selectedFuelType = '';
  selectedScenario = 60;
  selectedTimePeriod = 7; // 7, 30, 90, or 0 for all

  readonly timePeriods = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'All history', value: 0 }
  ];
  
  get availableFuelTypes(): string[] {
    const types = this.fuelPricesList.map(item => item.fuel_type).filter(Boolean);
    const uniqueTypes = Array.from(new Set(types));
    // Set default to first fuel type if not set
    if (!this.selectedFuelType && uniqueTypes.length > 0) {
      this.selectedFuelType = uniqueTypes[0];
    }
    return uniqueTypes;
  }

  get filteredFuelPrices(): any[] {
    if (!this.selectedFuelType || this.selectedFuelType === 'All') {
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
        
        // Get available fuel types and set the first one as default
        const types = prices.map((item: any) => item.fuel_type).filter(Boolean);
        const uniqueTypes = Array.from(new Set(types));
        
        if (uniqueTypes.length > 0 && !this.selectedFuelType) {
          this.selectedFuelType = uniqueTypes[0] as string;
        }
        
        if (prices.length > 0) {
          const filtered = this.selectedFuelType ? prices.filter((p: any) => p.fuel_type === this.selectedFuelType) : prices;
          const targetList = filtered.length > 0 ? filtered : prices;
          
          // Sort by date to get the latest
          const sorted = [...targetList].sort((a: any, b: any) => {
            const dateA = new Date(a.effective_date || a.created_at).getTime();
            const dateB = new Date(b.effective_date || b.created_at).getTime();
            return dateB - dateA;
          });
          
          const latest = sorted[0];
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
        this.rawFareRules = rules;
        this.fareRules = rules.map((r: any) => ({
          id: r.id,
          vehicle_id: r.vehicle_id,
          vehicle: r.vehicle ? r.vehicle.vehicle_name : `Vehicle #${r.vehicle_id}`,
          fuel: r.vehicle ? `${r.vehicle.fuel_type}` : 'Gasoline',
          baseFare: `₱${Number(r.base_fare).toFixed(2)}`,
          base_fare: r.base_fare,
          included_distance_km: r.included_distance_km,
          included: `First ${r.included_distance_km} km`,
          rate: `₱${Number(r.rate_per_km).toFixed(2)} / km`,
          rate_per_km: r.rate_per_km,
          minimum_fare: r.minimum_fare,
          source_reference: r.source_reference || 'Tagum City LGU',
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
    const filtered = !this.selectedFuelType || this.selectedFuelType === 'All'
      ? this.fuelPricesList
      : this.fuelPricesList.filter((p: any) => p.fuel_type === this.selectedFuelType);

    if (filtered.length > 0) {
      // Sort by date and get the latest
      const sorted = [...filtered].sort((a: any, b: any) => {
        const dateA = new Date(a.effective_date || a.created_at).getTime();
        const dateB = new Date(b.effective_date || b.created_at).getTime();
        return dateB - dateA;
      });
      const latest = sorted[0];
      this.latestFuelPrice = Number(latest.price_per_liter) || 60.00;
      this.selectedScenario = this.latestFuelPrice;
      this.latestFuelDate = latest.effective_date || latest.created_at || 'Today';
    }
    this.cdr.detectChanges();
  }

  onTimePeriodChange(): void {
    this.cdr.detectChanges();
  }

  get selectedFuelExpense(): number {
    return (5 / 25) * this.selectedScenario;
  }

  get activeList(): any[] {
    if (!this.selectedFuelType || this.selectedFuelType === 'All') {
      return this.fuelPricesList;
    }
    
    let filtered = this.fuelPricesList.filter(item => item.fuel_type === this.selectedFuelType);
    
    // Apply time period filter
    if (this.selectedTimePeriod > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.selectedTimePeriod);
      
      filtered = filtered.filter(item => {
        const recordDate = new Date(item.effective_date || item.created_at);
        return recordDate >= cutoffDate;
      });
    }
    
    // Sort by date/id ascending for chart display so newer updates appear as separate points
    return [...filtered].sort((a: any, b: any) => {
      const dateA = new Date(a.effective_date || a.created_at).getTime();
      const dateB = new Date(b.effective_date || b.created_at).getTime();
      if (dateA === dateB) {
        return (a.id || 0) - (b.id || 0);
      }
      return dateA - dateB;
    });
  }

  get chartPoints(): string {
    const list = this.activeList;
    if (list.length === 0) return '20,100 548,100';
    const slice = list.slice(-7);

    const minVal = 50;
    const maxVal = 100;
    const range = maxVal - minVal;

    return slice
      .map((point: any, index: number) => {
        const x = slice.length === 1 ? 284 : 20 + index * (528 / (slice.length - 1));
        const val = Number(point.price_per_liter) || 60;
        // Clamp values between 50-100
        const clampedVal = Math.max(minVal, Math.min(maxVal, val));
        const y = 115 - ((clampedVal - minVal) / range) * 95;
        return `${isNaN(x) ? 20 : x},${isNaN(y) ? 100 : Math.max(20, Math.min(115, y))}`;
      })
      .join(' ');
  }

  get chartArea(): string {
    const list = this.activeList.slice(-7);
    if (list.length === 0) return '20,115 548,115';
    const firstX = 20;
    const lastX = list.length === 1 ? 284 : 20 + (list.length - 1) * (528 / (list.length - 1));
    return `${firstX},115 ${this.chartPoints} ${lastX},115`;
  }

  openEditRuleModal(rule: any): void {
    this.editRule = {
      id: rule.id,
      vehicle_id: rule.vehicle_id,
      base_fare: rule.base_fare,
      included_distance_km: rule.included_distance_km,
      rate_per_km: rule.rate_per_km,
      minimum_fare: rule.minimum_fare,
      source_reference: rule.source_reference
    };
    this.showEditRuleModal = true;
    this.cdr.detectChanges();
  }

  closeEditRuleModal(): void {
    this.showEditRuleModal = false;
    this.cdr.detectChanges();
  }

  saveFareRule(): void {
    if (!this.editRule.id) return;
    this.isSavingRule = true;
    this.cdr.detectChanges();

    this.fareService.updateFareRule(this.editRule.id, this.editRule).subscribe({
      next: () => {
        this.isSavingRule = false;
        this.closeEditRuleModal();
        this.loadDashboardData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating fare rule:', err);
        this.isSavingRule = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDeleteRuleModal(rule: any): void {
    this.ruleToDelete = rule;
    this.showDeleteRuleModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteRuleModal(): void {
    this.showDeleteRuleModal = false;
    this.ruleToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDeleteRule(): void {
    if (!this.ruleToDelete) return;
    this.isDeletingRule = true;
    this.cdr.detectChanges();

    this.fareService.deleteFareRule(this.ruleToDelete.id).subscribe({
      next: () => {
        this.isDeletingRule = false;
        this.closeDeleteRuleModal();
        this.loadDashboardData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting fare rule:', err);
        this.isDeletingRule = false;
        this.closeDeleteRuleModal();
        this.cdr.detectChanges();
      }
    });
  }

  get fuelPrices(): any[] {
    const list = this.activeList;
    if (list.length === 0) {
      return [
        { day: 'Recent', value: this.latestFuelPrice, cx: 284, cy: 70 }
      ];
    }
    
    // Take up to 7 most recent records
    const slice = list.slice(-7);
    const minVal = 50;
    const maxVal = 100;
    const range = maxVal - minVal;

    return slice.map((item: any, index: number) => {
      const val = Number(item.price_per_liter) || 60;
      const x = slice.length === 1 ? 284 : 20 + index * (528 / (slice.length - 1));
      
      // Scale values within chart area (115px height, 20px top to 115px bottom)
      // Clamp values between 50-100
      const clampedVal = Math.max(minVal, Math.min(maxVal, val));
      const y = 115 - ((clampedVal - minVal) / range) * 95;

      let formattedDate = 'Recent';
      const rawDate = item.effective_date || item.created_at;
      if (rawDate) {
        try {
          // If effective_date is just YYYY-MM-DD, new Date() parses it in UTC which can shift day backwards in local time.
          // Let's parse year, month, day explicitly if it matches YYYY-MM-DD format.
          const strVal = String(rawDate).trim();
          let d: Date;
          if (/^\d{4}-\d{2}-\d{2}$/.test(strVal)) {
            const [y, m, dayNum] = strVal.split('-').map(Number);
            d = new Date(y, m - 1, dayNum);
          } else {
            d = new Date(rawDate);
          }

          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          } else {
            formattedDate = strVal.substring(5, 10);
          }
        } catch {
          formattedDate = String(rawDate).substring(5, 10);
        }
      }

      return {
        day: formattedDate,
        value: val,
        cx: isNaN(x) ? 20 : x,
        cy: isNaN(y) ? 100 : Math.max(20, Math.min(115, y))
      };
    });
  }

  get chartYAxisLabels(): { value: number, y: number }[] {
    return [
      { value: 50, y: 115 },
      { value: 65, y: 91 },
      { value: 75, y: 67 },
      { value: 85, y: 43 },
      { value: 100, y: 20 }
    ];
  }
}