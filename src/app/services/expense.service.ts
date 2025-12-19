import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GroupExpense {
    id?: number;
    description: string;
    amount: number;
    paidBy: number; // User ID
    currency?: string;
    date?: string;
    splitType?: 'EQUAL' | 'PERCENTAGE' | 'EXACT';
    splits?: any[];
}

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    // Base API URL is .../api/v1/groups/{groupId}/expenses
    // So this service needs to handle the dynamic path construction
    private apiBase = `${environment.apiUrl}groups`;

    constructor(private http: HttpClient) { }

    getExpenses(groupId: number, page: number = 0, size: number = 20): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<any>(`${this.apiBase}/${groupId}/expenses`, { params });
    }

    addExpense(groupId: number, expense: GroupExpense): Observable<GroupExpense> {
        return this.http.post<GroupExpense>(`${this.apiBase}/${groupId}/expenses`, expense);
    }

    updateExpense(groupId: number, expenseId: number, expense: GroupExpense): Observable<GroupExpense> {
        return this.http.put<GroupExpense>(`${this.apiBase}/${groupId}/expenses/${expenseId}`, expense);
    }

    deleteExpense(groupId: number, expenseId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/${groupId}/expenses/${expenseId}`);
    }

    getSettlements(groupId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBase}/${groupId}/settlements`);
    }

    settleDebt(groupId: number, settlementId: number): Observable<any> {
        return this.http.post(`${this.apiBase}/${groupId}/settlements/${settlementId}/pay`, {});
    }
}
