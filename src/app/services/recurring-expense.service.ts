import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RecurringExpense {
    id?: number;
    description: string;
    amount: number;
    currency: string;
    frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    startDate: string;
    nextDueDate?: string;
    active: boolean;
    groupId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class RecurringExpenseService {
    private apiBase = `${environment.apiUrl}groups`;

    constructor(private http: HttpClient) { }

    getRecurringExpenses(groupId: number): Observable<RecurringExpense[]> {
        return this.http.get<RecurringExpense[]>(`${this.apiBase}/${groupId}/recurring`);
    }

    addRecurringExpense(groupId: number, expense: RecurringExpense): Observable<RecurringExpense> {
        return this.http.post<RecurringExpense>(`${this.apiBase}/${groupId}/recurring`, expense);
    }

    updateRecurringExpense(groupId: number, id: number, expense: RecurringExpense): Observable<RecurringExpense> {
        return this.http.put<RecurringExpense>(`${this.apiBase}/${groupId}/recurring/${id}`, expense);
    }

    deleteRecurringExpense(groupId: number, id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiBase}/${groupId}/recurring/${id}`);
    }

    toggleStatus(groupId: number, id: number): Observable<RecurringExpense> {
        return this.http.post<RecurringExpense>(`${this.apiBase}/${groupId}/recurring/${id}/toggle`, {});
    }
}
