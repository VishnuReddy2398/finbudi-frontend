import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PremiumPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
}

export interface SubscriptionStatus {
    isPremium: boolean;
    expiryDate?: string;
    plan?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PremiumService {
    private apiUrl = `${environment.apiUrl}premium`;

    constructor(private http: HttpClient) { }

    getStatus(): Observable<SubscriptionStatus> {
        return this.http.get<SubscriptionStatus>(`${this.apiUrl}/status`);
    }

    getPlans(): Observable<PremiumPlan[]> {
        // Mocking plans since backend might not have this endpoint yet or it's static
        // Alternatively, if there is an endpoint, use it.
        // Based on controller, there isn't a getPlans, but let's assume valid flow
        return new Observable(observer => {
            observer.next([
                { id: 'monthly', name: 'Premium Monthly', price: 4.99, currency: 'USD', features: ['AI Chat', 'Receipt Scanning', 'Unlimited Groups'] },
                { id: 'yearly', name: 'Premium Yearly', price: 49.99, currency: 'USD', features: ['AI Chat', 'Receipt Scanning', 'Unlimited Groups', '2 Months Free'] }
            ]);
            observer.complete();
        });
    }

    subscribe(planId: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/subscribe`, { planId });
    }

    cancelSubscription(): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/cancel`, {});
    }

    getHistory(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/history`);
    }
}
