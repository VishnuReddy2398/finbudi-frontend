import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FinanceService } from './finance';

export interface PlanItem {
    id?: number;
    categoryId?: number;
    categoryName: string;
    categoryIcon?: string;
    plannedAmount: number;
    type: 'INCOME' | 'EXPENSE';
    fixed: boolean;
    categoryGroup?: string;
}

export interface MonthlyPlan {
    id?: number;
    month: number;
    year: number;
    totalIncome: number;
    totalExpense?: number;
    totalSavings?: number;
    items: PlanItem[];
}

@Injectable({
    providedIn: 'root'
})
export class PlanningService {
    private apiUrl = `${environment.apiUrl}budgets`;

    constructor(
        private http: HttpClient,
        private financeService: FinanceService
    ) { }

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

    // Helper to get predefined categories from API
    getPredefinedCategories(): Observable<any> {
        return this.financeService.getCategories().pipe(
            map(categories => {
                const grouped: any = {
                    DEBTS: [],
                    ESSENTIALS: [],
                    DISCRETIONARY: []
                };

                categories.forEach(cat => {
                    if (cat.categoryGroup && grouped[cat.categoryGroup]) {
                        grouped[cat.categoryGroup].push(cat);
                    } else {
                        // Default to Discretionary if no group
                        grouped.DISCRETIONARY.push(cat);
                    }
                });
                return grouped;
            })
        );
    }
}
