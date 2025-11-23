import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl + 'budget';

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    constructor(private http: HttpClient) { }

    getPlan(month: number, year: number): Observable<any> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get(API_URL, { params });
    }

    savePlan(month: number, year: number, items: any[]): Observable<any> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.post(API_URL, items, { params });
    }

    getVarianceReport(month: number, year: number): Observable<any> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get(`${API_URL}/variance`, { params });
    }

    getCategoriesFromPlan(month: number, year: number): Observable<string[]> {
        return this.getPlan(month, year).pipe(
            map((plan: any) => {
                if (plan && plan.items) {
                    return plan.items.map((item: any) => item.categoryName);
                }
                return [];
            })
        );
    }
}
