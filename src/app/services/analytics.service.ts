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

    getSixMonthTrend(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/trend`);
    }

    getDailySpendingTrend(): Observable<any> {
        const now = new Date();
        const params = new HttpParams()
            .set('month', (now.getMonth() + 1).toString())
            .set('year', now.getFullYear().toString());

        return new Observable(observer => {
            this.http.get<any[]>(`${this.apiUrl}/daily-spend`, { params }).subscribe({
                next: (data) => {
                    observer.next({
                        labels: data.map(d => d.date),
                        data: data.map(d => d.amount)
                    });
                    observer.complete();
                },
                error: (err) => observer.error(err)
            });
        });
    }
}
