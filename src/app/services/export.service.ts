import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ExportService {
    private apiUrl = `${environment.apiUrl}export`;

    constructor(private http: HttpClient) { }

    downloadPdf(month: number, year: number) {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());

        return this.http.get(`${this.apiUrl}/pdf`, {
            params,
            responseType: 'blob'
        });
    }

    downloadExcel(month: number, year: number) {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());

        return this.http.get(`${this.apiUrl}/excel`, {
            params,
            responseType: 'blob'
        });
    }
}
