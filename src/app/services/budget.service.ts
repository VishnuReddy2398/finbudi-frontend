import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    private apiUrl = `${environment.apiUrl}budgets`;

    constructor(private http: HttpClient) { }

    getBudgets(month: number, year: number): Observable<any[]> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get<any[]>(this.apiUrl, { params });
    }

    setBudget(categoryId: number, amount: number, month: number, year: number): Observable<any> {
        const params = new HttpParams()
            .set('categoryId', categoryId.toString())
            .set('amount', amount.toString())
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.post<any>(this.apiUrl, {}, { params });
    }

    getOverallStatus(month: number, year: number): Observable<any> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get<any>(`${this.apiUrl}/status`, { params });
    }

    getPlan(month: number, year: number): Observable<any> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get<any>(`${this.apiUrl}/plan`, { params });
    }

    savePlan(month: number, year: number, items: any[]): Observable<any> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.post<any>(`${this.apiUrl}/plan`, items, { params });
    }
}
