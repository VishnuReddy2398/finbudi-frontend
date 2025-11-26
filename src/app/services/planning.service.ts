import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PlanItem {
    categoryName: string;
    plannedAmount: number;
    type: 'INCOME' | 'EXPENSE';
    fixed: boolean;
    categoryGroup?: 'DEBT' | 'ESSENTIAL' | 'DISCRETIONARY';
}

export interface MonthlyPlan {
    id?: number;
    month: number;
    year: number;
    totalIncome: number;
    items: PlanItem[];
    carryForward?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PlanningService {
    private apiUrl = `${environment.apiUrl}budgets`;

    constructor(private http: HttpClient) { }

    savePlan(plan: MonthlyPlan): Observable<any> {
        const params = new HttpParams()
            .set('month', plan.month.toString())
            .set('year', plan.year.toString());
        return this.http.post(`${this.apiUrl}/plan`, plan.items, { params });
    }

    getPlan(month: number, year: number): Observable<MonthlyPlan> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get<MonthlyPlan>(`${this.apiUrl}/plan`, { params });
    }

    // Helper to get predefined categories (mocked for now, can be API later)
    getPredefinedCategories() {
        return {
            DEBT: [
                { name: 'Personal Loan EMI', icon: '💳' },
                { name: 'Car Loan EMI', icon: '🚗' },
                { name: 'Phone EMI', icon: '📱' },
                { name: 'Home Loan EMI', icon: '🏠' },
                { name: 'Education Loan EMI', icon: '📚' }
            ],
            ESSENTIAL: [
                { name: 'Rent', icon: '🏠' },
                { name: 'SIP/Savings', icon: '📈' },
                { name: 'Health Insurance', icon: '🏥' },
                { name: 'Electricity Bill', icon: '⚡' },
                { name: 'Internet/Mobile', icon: '📱' }
            ],
            DISCRETIONARY: [
                { name: 'Food', icon: '🍽️' },
                { name: 'Petrol', icon: '⛽' },
                { name: 'Shopping', icon: '🛍️' },
                { name: 'Entertainment', icon: '🎬' },
                { name: 'Vacation', icon: '✈️' }
            ]
        };
    }
}
