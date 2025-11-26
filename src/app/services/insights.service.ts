import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BudgetDTO {
    id: number;
    categoryId: number;
    categoryName: string;
    categoryIcon: string;
    limit: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: string;
    fixed: boolean;
}

export interface FinancialInsightsDTO {
    monthlyIncome: number;
    fixedObligations: number;
    fixedPercentage: number;

    discretionaryBudget: number;
    discretionarySpent: number;
    discretionaryRemaining: number;
    discretionaryPercentage: number;

    availableNow: number;
    daysLeftInMonth: number;
    safeToSpendPerDay: number;

    debtObligations: BudgetDTO[];
    essentialLiabilities: BudgetDTO[];
    discretionarySpending: BudgetDTO[];

    highDebtLoad: boolean;
    goodSavingsRate: boolean;
    tips: string[];
}

@Injectable({
    providedIn: 'root'
})
export class InsightsService {
    private apiUrl = `${environment.apiUrl}budgets/insights`;

    constructor(private http: HttpClient) { }

    getInsights(month: number, year: number): Observable<FinancialInsightsDTO> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get<FinancialInsightsDTO>(this.apiUrl, { params });
    }
}
