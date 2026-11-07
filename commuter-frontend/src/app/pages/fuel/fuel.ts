import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthServices } from '../../core/services/auth.services';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-fuel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fuel.html',
  styleUrl: './fuel.css',
})
export class Fuel implements OnInit {
  isDarkMode = false;
  isLoading = true;
  errorMessage = '';

  fuelPrices: any[] = [
    { type: 'Diesel', price: 58.50, change: '+₱0.50', updated: 'Today' },
    { type: 'Gasoline (91)', price: 62.40, change: '-₱0.20', updated: 'Today' },
    { type: 'Gasoline (95)', price: 67.80, change: '+₱0.30', updated: 'Today' },
    { type: 'Kerosene', price: 72.10, change: '0.00', updated: 'Yesterday' }
  ];

  constructor(
    private authService: AuthServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';

    window.addEventListener('storage', () => {
      const theme = localStorage.getItem('theme');
      this.isDarkMode = theme === 'dark';
      this.cdr.detectChanges();
    });

    this.fetchFuelPrices();
  }

  fetchFuelPrices() {
    this.isLoading = true;
    this.authService.getFuelPrices().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const rawPrices = res?.data || res;
        if (Array.isArray(rawPrices) && rawPrices.length > 0) {
          // Group all records by fuel type to calculate changes dynamically from history
          const groupedByType = new Map<string, any[]>();
          for (const item of rawPrices) {
            const type = item.fuel_type || item.type || 'Fuel';
            if (!groupedByType.has(type)) {
              groupedByType.set(type, []);
            }
            groupedByType.get(type)!.push(item);
          }

          const processedFuels: any[] = [];

          groupedByType.forEach((records, type) => {
            // Sort records by date ascending
            records.sort((a, b) => {
              const dateA = new Date(a.effective_date || a.updated_at || a.created_at).getTime();
              const dateB = new Date(b.effective_date || b.updated_at || b.created_at).getTime();
              return dateA - dateB;
            });

            const latest = records[records.length - 1];
            let changeStr = '0.00';

            if (records.length >= 2) {
              const previous = records[records.length - 2];
              const diff = Number(latest.price_per_liter || latest.price || 0) - Number(previous.price_per_liter || previous.price || 0);
              if (diff > 0) {
                changeStr = `+₱${diff.toFixed(2)}`;
              } else if (diff < 0) {
                changeStr = `-₱${Math.abs(diff).toFixed(2)}`;
              } else {
                changeStr = '0.00';
              }
            } else if (latest.price_change || latest.change) {
              changeStr = latest.price_change || latest.change;
            }

            processedFuels.push({
              type: type,
              price: Number(latest.price_per_liter || latest.price || 0),
              change: changeStr,
              updated: latest.effective_date
                ? new Date(latest.effective_date).toLocaleDateString()
                : (latest.updated_at ? new Date(latest.updated_at).toLocaleDateString() : 'Today')
            });
          });

          this.fuelPrices = processedFuels;
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.warn('Could not fetch dynamic fuel prices from backend, using default fallback:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
