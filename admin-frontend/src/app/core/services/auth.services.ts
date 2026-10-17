import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

    register(userData: { name: string; email: string; password: string; role?: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/users`, userData);
    }
}
