import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReceiptService {
    private apiUrl = `${environment.apiUrl}receipts`;

    constructor(private http: HttpClient) { }

    scanReceipt(image: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', image);
        return this.http.post<any>(`${this.apiUrl}/scan`, formData);
    }

    // For manually adding validated receipt data if needed
    processReceiptData(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/process`, data);
    }
}
