import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fuel.html',
  styleUrl: './fuel.css',
})
export class Fuel {
  fuelPrices = [
    { type: 'Diesel', price: 58.50, change: '+₱0.50', updated: 'Today' },
    { type: 'Gasoline (91)', price: 62.40, change: '-₱0.20', updated: 'Today' },
    { type: 'Gasoline (95)', price: 67.80, change: '+₱0.30', updated: 'Today' },
    { type: 'Kerosene', price: 72.10, change: '0.00', updated: 'Yesterday' }
  ];
}
