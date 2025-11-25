import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

const AUTH_API = environment.apiUrl + 'auth/';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private http: HttpClient) { }

    login(username: string, password: string, code?: string, recaptchaToken?: string): Observable<any> {
        return this.http.post(AUTH_API + 'signin', {
            username,
            password,
            code,
            recaptchaToken
        }, httpOptions);
    }

    generateMfa(): Observable<any> {
        return this.http.post(AUTH_API + 'mfa/generate', {}, httpOptions);
    }

    enableMfa(code: string, secret: string): Observable<any> {
        return this.http.post(AUTH_API + 'mfa/enable', {
            code,
            secret
        }, httpOptions);
    }

    disableMfa(): Observable<any> {
        return this.http.post(AUTH_API + 'mfa/disable', {}, httpOptions);
    }

    register(username: string, email: string, password: string): Observable<any> {
        return this.http.post(AUTH_API + 'signup', {
            username,
            email,
            password
        }, httpOptions);
    }

    refreshToken(refreshToken: string): Observable<any> {
        return this.http.post(AUTH_API + 'refresh', {
            refreshToken
        }, httpOptions);
    }

    logout(refreshToken: string): Observable<any> {
        return this.http.post(AUTH_API + 'logout', {
            refreshToken
        }, httpOptions);
    }

    getSessions(): Observable<any> {
        return this.http.get(AUTH_API + 'sessions', httpOptions);
    }

    revokeSession(sessionId: number): Observable<any> {
        return this.http.delete(AUTH_API + 'sessions/' + sessionId, httpOptions);
    }

    // Email Verification
    verifyEmail(token: string): Observable<any> {
        return this.http.get(AUTH_API + `verify-email?token=${token}`);
    }

    getVerificationStatus(): Observable<any> {
        return this.http.get(AUTH_API + 'verification-status', httpOptions);
    }

    resendVerificationEmail(email: string): Observable<any> {
        return this.http.post(AUTH_API + `resend-verification?email=${email}`, {});
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(AUTH_API + `forgot-password?email=${email}`, {});
    }

    resetPassword(token: string, newPassword: string): Observable<any> {
        return this.http.post(AUTH_API + 'reset-password', {
            token,
            newPassword
        }, httpOptions);
    }

    deleteAccount(password: string): Observable<any> {
        return this.http.delete(AUTH_API + `delete-account?password=${password}`, httpOptions);
    }
}
