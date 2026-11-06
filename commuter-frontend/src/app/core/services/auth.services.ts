import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(data: { name: string; email: string; password: string; password_confirmation: string; role?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, { ...data, role: 'user' });
  }

  updateProfile(id: number, data: { name?: string; email?: string; current_password?: string; password?: string }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/users/${id}`, data, { headers });
  }

  submitFeedback(data: { name: string; email: string; rating: string; module_tested?: string; vehicle_plate?: string; comments: string }): Observable<any> {
    const payload = {
      tester_name: data.name,
      email: data.email,
      module_tested: data.module_tested || 'Help Center Ticket',
      vehicle_plate: data.vehicle_plate || null,
      rating: data.rating || 'Bug / Issue',
      feedback_comments: data.comments
    };
    return this.http.post(`${this.apiUrl}/testing_feedback`, payload);
  }

  // Dynamic Fuel Prices API
  getFuelPrices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fuel_prices`);
  }

  // Dynamic Vehicles API
  getVehicles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vehicle`);
  }

  // Dynamic Fare Rules API
  getFareRules(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fare_rules`);
  }

  // Dynamic Tagum Locations API
  getLocations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/locations`);
  }

  // Calculate Fare Estimate API
  calculateFare(data: { vehicle_id: number; distance_km: number; passengers?: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/fare_estimates`, data);
  }

  // Delete Account API
  deleteAccount(userId: number, password: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/users/${userId}/delete`, { password }, { headers });
  }
}
