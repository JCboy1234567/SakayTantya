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

  submitFeedback(data: { name: string; email: string; rating: number; comments: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/testing_feedback`, data);
  }
}
