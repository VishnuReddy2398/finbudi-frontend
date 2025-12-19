import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    private apiUrl = `${environment.apiUrl}currencies`;

    constructor(private http: HttpClient) { }

    getSupportedCurrencies(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/supported`);
    }

    getExchangeRates(base: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/rates?base=${base}`);
    }

    convert(amount: number, from: string, to: string): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/convert?amount=${amount}&from=${from}&to=${to}`);
    }
}
