import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = `${environment.apiUrl}chat`;

    constructor(private http: HttpClient) { }

    sendMessage(message: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/send`, { message });
    }

    getHistory(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/history`);
    }

    clearHistory(): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/history`);
    }
}
