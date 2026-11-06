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
          const uniqueMap = new Map<string, any>();

          for (const item of rawPrices) {
            const type = item.fuel_type || item.type || 'Fuel';
            if (!uniqueMap.has(type)) {
              uniqueMap.set(type, item);
            } else {
              const existing = uniqueMap.get(type);
              const dateExisting = new Date(existing.effective_date || existing.updated_at || existing.created_at).getTime();
              const dateItem = new Date(item.effective_date || item.updated_at || item.created_at).getTime();
              if (dateItem > dateExisting || (dateItem === dateExisting && item.id > existing.id)) {
                uniqueMap.set(type, item);
              }
            }
          }

          this.fuelPrices = Array.from(uniqueMap.values()).map((item: any) => ({
            type: item.fuel_type || item.type || 'Fuel',
            price: Number(item.price_per_liter || item.price || 0),
            change: item.price_change || item.change || '0.00',
            updated: item.effective_date
              ? new Date(item.effective_date).toLocaleDateString()
              : (item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Today')
          }));
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
