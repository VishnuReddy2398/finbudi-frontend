import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = `${environment.apiUrl}admin`;

    constructor(private http: HttpClient) { }

    getSystemStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/stats`);
    }

    getUsers(page: number = 0, size: number = 10): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/users?page=${page}&size=${size}`);
    }

    getUserUsage(userId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/users/${userId}/usage`);
    }
}
