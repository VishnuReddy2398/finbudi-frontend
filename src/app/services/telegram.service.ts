import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TelegramStatus {
    linked: boolean;
    username: string | null;
}

export interface LinkCodeResponse {
    code?: string;
    linkCode?: string;
    message: string;
    instructions: string;
}

export interface ChatMessage {
    id: number;
    message: string;
    response: string;
    source: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class TelegramService {
    private apiUrl = `${environment.apiUrl}telegram`;

    constructor(private http: HttpClient) { }

    generateLinkCode(): Observable<LinkCodeResponse> {
        return this.http.post<LinkCodeResponse>(`${this.apiUrl}/generate-link-code`, {});
    }

    getTelegramStatus(): Observable<TelegramStatus> {
        return this.http.get<TelegramStatus>(`${this.apiUrl}/status`);
    }

    unlinkTelegram(): Observable<any> {
        return this.http.post(`${this.apiUrl}/unlink`, {});
    }

    getChatHistory(): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`${this.apiUrl}/chat-history`);
    }
}
