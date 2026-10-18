import { Component } from '@angular/core';
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
  LucideArrowRight
} from '@lucide/angular';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
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
    LucideArrowRight
  ],
  templateUrl: './overview.html'
})
export class Overview {
  readonly fuelPrices = [
    { day: '11 Oct', value: 57.5 },
    { day: '12 Oct', value: 58.5 },
    { day: '13 Oct', value: 57.5 },
    { day: '14 Oct', value: 60.5 },
    { day: '15 Oct', value: 62 },
    { day: '16 Oct', value: 60.5 },
    { day: '17 Oct', value: 59.5 }
  ];

  readonly fareRules = [
    {
      vehicle: 'Motorized tricycle',
      fuel: 'TRI · Gasoline',
      baseFare: '₱15.00',
      included: 'First 2 km',
      rate: '₱2.00 / km',
      efficiency: '25 km/L',
      status: 'Enabled'
    },
    {
      vehicle: 'Motorcycle',
      fuel: 'MOTO · Gasoline',
      baseFare: '₱15.00',
      included: 'First 2 km',
      rate: '₱2.00 / km',
      efficiency: '35 km/L',
      status: 'Enabled'
    },
    {
      vehicle: 'Multicab',
      fuel: 'MULTI · Pending setup',
      baseFare: 'Not set',
      included: '—',
      rate: '—',
      efficiency: 'Not set',
      status: 'Draft'
    }
  ];

  readonly scenarios = [
    { price: 55, expense: 11 },
    { price: 60, expense: 12 },
    { price: 65, expense: 13 }
  ];

  readonly chartPoints = this.fuelPrices
    .map((point, index) => {
      const x = 20 + index * 88;
      const y = 100 - (point.value - 54) * 5;

      return `${x},${y}`;
    })
    .join(' ');

  readonly chartArea =
    `20,112 ${this.chartPoints} 548,112`;

  selectedScenario = 60;

  selectScenario(price: number): void {
    this.selectedScenario = price;
  }

  get selectedFuelExpense(): number {
    return (5 / 25) * this.selectedScenario;
  }
}