import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  LucideLayoutDashboard,
  LucideBus,
  LucideFuel,
  LucideMessageSquare,
  LucideLogOut,
  LucideLoader,
  LucideCheckCircle2,
  LucideAlertCircle,
  LucideMapPin,
  LucideNavigation,
  LucidePlus,
  LucideSend,
  LucideUser
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideLayoutDashboard,
    LucideBus,
    LucideFuel,
    LucideMessageSquare,
    LucideLogOut,
    LucideLoader,
    LucideCheckCircle2,
    LucideAlertCircle,
    LucideMapPin,
    LucideNavigation,
    LucidePlus,
    LucideSend,
    LucideUser
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  userName = 'User';
  userEmail = '';
  userInitial = 'U';
  isLoading = false;

  // Fare calculator state
  vehicles: any[] = [];
  fareRules: any[] = [];
  fuelPrices: any[] = [];
  selectedVehicleId: any = '';
  distanceKm: number = 3.5;
  calculatedFare: number = 0.00;
  activeRuleDetails: any = null;

  // Feedback & Bug Reporting State
  feedbacks: any[] = [];
  newFeedback = {
    tester_name: '',
    email: '',
    module_tested: 'Fare Estimator',
    rating: 'Bug / Issue',
    feedback_comments: '',
    status: 'Pending Review'
  };
  isSubmittingFeedback = false;
  successMessage = '';
  errorMessage = '';

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        this.userName = u.name || 'User';
        this.userEmail = u.email || '';
        this.userInitial = this.userName.charAt(0).toUpperCase();
        this.newFeedback.tester_name = this.userName;
        this.newFeedback.email = this.userEmail;
      } catch {
        this.userName = 'User';
      }
    }
    this.loadData();
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    // Load Vehicles
    this.http.get(`${this.apiUrl}/vehicle`).subscribe({
      next: (res: any) => {
        this.vehicles = res.data || res || [];
        if (this.vehicles.length > 0 && !this.selectedVehicleId) {
          this.selectedVehicleId = this.vehicles[0].id;
        }
        this.calculateFare();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading vehicles:', err)
    });

    // Load Fare Rules
    this.http.get(`${this.apiUrl}/fare_rules`).subscribe({
      next: (res: any) => {
        this.fareRules = res.data || res || [];
        this.calculateFare();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading fare rules:', err)
    });

    // Load Fuel Prices
    this.http.get(`${this.apiUrl}/fuel_prices`).subscribe({
      next: (res: any) => {
        this.fuelPrices = res.data || res || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading fuel prices:', err)
    });

    // Load User Feedbacks
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.http.get(`${this.apiUrl}/testing_feedback`, { headers: this.getAuthHeaders() }).subscribe({
      next: (res: any) => {
        this.feedbacks = res.data || res || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading feedback:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateFare(): void {
    if (!this.selectedVehicleId || this.fareRules.length === 0) {
      this.calculatedFare = 0.00;
      this.activeRuleDetails = null;
      return;
    }

    const rule = this.fareRules.find((r: any) => String(r.vehicle_id) === String(this.selectedVehicleId));
    if (rule) {
      this.activeRuleDetails = rule;
      const base = Number(rule.base_fare) || 15;
      const includedKm = Number(rule.included_distance_km) || 2;
      const ratePerKm = Number(rule.rate_per_km) || 2;
      const minFare = Number(rule.minimum_fare) || base;

      if (this.distanceKm <= includedKm) {
        this.calculatedFare = Math.max(minFare, base);
      } else {
        const extraKm = this.distanceKm - includedKm;
        this.calculatedFare = Math.max(minFare, base + (extraKm * ratePerKm));
      }
    } else {
      this.activeRuleDetails = null;
      this.calculatedFare = 15.00 + (Math.max(0, this.distanceKm - 2) * 2);
    }
    this.cdr.detectChanges();
  }

  submitFeedback(): void {
    if (!this.newFeedback.feedback_comments) {
      this.errorMessage = 'Please enter your bug report or feedback comments.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmittingFeedback = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.http.post(`${this.apiUrl}/testing_feedback`, this.newFeedback, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        this.isSubmittingFeedback = false;
        this.successMessage = 'Bug report / feedback submitted successfully!';
        this.newFeedback.feedback_comments = '';
        this.loadFeedbacks();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        console.error('Error submitting feedback:', err);
        this.isSubmittingFeedback = false;
        this.errorMessage = err.error?.message || 'Failed to submit bug report.';
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
