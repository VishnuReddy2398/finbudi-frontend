import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id?: number;
  name: string;
}

export interface Transaction {
  id?: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category?: Category;
  date: string;
  description: string;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private apiUrl = environment.apiUrl.replace(/\/$/, ''); // Remove trailing slash if present for consistency

  constructor(private http: HttpClient) { }

  getTransactions(params?: any): Observable<Transaction[]> {
    let url = `${this.apiUrl}/transactions`;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.type) queryParams.append('type', params.type);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    return this.http.get<Transaction[]>(url);
  }

  updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/${id}`);
  }

  addTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transaction);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  addCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  getWeeklyReport(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/reports/weekly`);
  }

  getMonthlyReport(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/reports/monthly`);
  }
}
