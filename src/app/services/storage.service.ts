import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';
const REFRESH_TOKEN_KEY = 'refresh-token';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    constructor() { }

    clean(): void {
        window.localStorage.clear();
    }

    public saveUser(user: any): void {
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    public getUser(): any {
        const user = window.localStorage.getItem(USER_KEY);
        if (user) {
            return JSON.parse(user);
        }

        return null;
    }

    public isLoggedIn(): boolean {
        const user = window.localStorage.getItem(USER_KEY);
        if (user) {
            return true;
        }

        return false;
    }

    public saveRefreshToken(token: string): void {
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }

    public getRefreshToken(): string | null {
        return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    public removeRefreshToken(): void {
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
}
