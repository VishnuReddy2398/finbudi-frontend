import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Debt {
    id?: number;
    debtorName: string;
    creditorName: string; // "Me" or other
    amount: number;
    currency: string;
    dueDate?: string;
    description?: string;
    status: 'PENDING' | 'PAID' | 'PARTIALLY_PAID';
}

@Injectable({
    providedIn: 'root'
})
export class DebtService {
    private apiUrl = `${environment.apiUrl}debts`;

    constructor(private http: HttpClient) { }

    getDebts(): Observable<Debt[]> {
        return this.http.get<Debt[]>(this.apiUrl);
    }

    addDebt(debt: Debt): Observable<Debt> {
        return this.http.post<Debt>(this.apiUrl, debt);
    }

    updateDebt(id: number, debt: Debt): Observable<Debt> {
        return this.http.put<Debt>(`${this.apiUrl}/${id}`, debt);
    }

    deleteDebt(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    recordPayment(debtId: number, amount: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${debtId}/pay`, { amount });
    }
}
