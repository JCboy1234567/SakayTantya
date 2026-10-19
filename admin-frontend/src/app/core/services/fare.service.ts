import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FareService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // Fare Rules
  getFareRules(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fare_rules`);
  }

  createFareRule(ruleData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/fare_rules`, ruleData, {
      headers: this.getAuthHeaders()
    });
  }

  // Vehicles
  getVehicles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vehicle`);
  }

  createVehicle(vehicleData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/vehicle`, vehicleData, {
      headers: this.getAuthHeaders()
    });
  }

  // Fuel Prices
  getFuelPrices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fuel_prices`);
  }

  createFuelPrice(fuelData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/fuel_prices`, fuelData, {
      headers: this.getAuthHeaders()
    });
  }

  updateFuelPrice(id: number, fuelData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/fuel_prices/${id}`, fuelData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteFuelPrice(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fuel_prices/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
