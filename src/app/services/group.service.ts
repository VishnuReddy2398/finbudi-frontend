import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Group {
    id: number;
    name: string;
    description?: string;
    members?: any[];
    createdBy?: string;
    createdAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class GroupService {
    private apiUrl = `${environment.apiUrl}groups`;

    constructor(private http: HttpClient) { }

    createGroup(name: string, description?: string): Observable<Group> {
        return this.http.post<Group>(this.apiUrl, { name, description });
    }

    getGroups(): Observable<Group[]> {
        return this.http.get<Group[]>(this.apiUrl);
    }

    getGroup(id: number): Observable<Group> {
        return this.http.get<Group>(`${this.apiUrl}/${id}`);
    }

    addMember(groupId: number, username: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${groupId}/members`, { username });
    }

    removeMember(groupId: number, userId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${groupId}/members/${userId}`);
    }

    leaveGroup(groupId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${groupId}/leave`, {});
    }
}
