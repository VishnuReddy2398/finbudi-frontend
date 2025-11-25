import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private apiUrl = `${environment.apiUrl}analytics`;

    constructor(private http: HttpClient) { }

    getDailySpend(month: number, year: number): Observable<any[]> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get<any[]>(`${this.apiUrl}/daily-spend`, { params });
    }

    getCategorySplit(month: number, year: number): Observable<any[]> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get<any[]>(`${this.apiUrl}/category-split`, { params });
    }

    getPrediction(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/prediction`);
    }
}
