import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl + 'goals';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export interface Goal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    priority: string;
    monthlyContribution: number;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class GoalService {

    constructor(private http: HttpClient) { }

    getGoals(): Observable<any> {
        return this.http.get(API_URL, httpOptions);
    }

    createGoal(goal: any): Observable<any> {
        return this.http.post(API_URL, goal, httpOptions);
    }

    addFunds(id: number, amount: number): Observable<any> {
        return this.http.post(`${API_URL}/${id}/add-funds`, { amount }, httpOptions);
    }

    calculateAllocation(totalAvailable: number): Observable<any> {
        return this.http.post(`${API_URL}/calculate-allocation`, { totalAvailable }, httpOptions);
    }

    applyAllocation(allocation: any): Observable<any> {
        return this.http.post(`${API_URL}/apply-allocation`, allocation, httpOptions);
    }

    reorderGoals(ids: number[]): Observable<any> {
        return this.http.post(`${API_URL}/reorder`, ids, httpOptions);
    }
}
