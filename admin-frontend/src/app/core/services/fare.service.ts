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

  updateFareRule(id: number, ruleData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/fare_rules/${id}`, ruleData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteFareRule(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fare_rules/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Vehicles
  getVehicles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vehicle`);
  }

  createVehicle(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/vehicle`, formData, { headers });
  }

  updateVehicle(id: number, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
    // Append _method=PUT to allow Laravel to process multipart/form-data via POST
    formData.append('_method', 'PUT');
    return this.http.post(`${this.apiUrl}/vehicle/${id}`, formData, { headers });
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/vehicle/${id}`, {
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

  // ServiceAvailability
  getServiceAvailability(): Observable<any> {
    return this.http.get(`${this.apiUrl}/service_availability`);
  }

  createServiceAvailability(serviceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/service_availability`, serviceData, {
      headers: this.getAuthHeaders()
    });
  }

  updateServiceAvailability(id: number, serviceData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/service_availability/${id}`, serviceData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteServiceAvailability(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/service_availability/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Testing & Feedback
  getTestingFeedback(): Observable<any> {
    return this.http.get(`${this.apiUrl}/testing_feedback`);
  }

  createTestingFeedback(feedbackData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/testing_feedback`, feedbackData);
  }

  updateTestingFeedback(id: number, feedbackData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/testing_feedback/${id}`, feedbackData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteTestingFeedback(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/testing_feedback/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // User Profile
  updateUserProfile(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, userData, {
      headers: this.getAuthHeaders()
    });
  }

  // Notification Preferences
  updateNotificationPreferences(id: number, preferences: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/notification-preferences`, preferences, {
      headers: this.getAuthHeaders()
    });
  }

  getNotificationPreferences(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}/notification-preferences`, {
      headers: this.getAuthHeaders()
    });
  }
}
