import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserStats {
    id: number;
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
    transactionCount: number;
    goalsCompleted: number;
}

export interface Achievement {
    id: number;
    code: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    category: string;
}

export interface UserAchievement {
    id: number;
    achievement: Achievement;
    unlockedAt: string;
}

export interface LeaderboardEntry {
    username: string;
    points: number;
    streak: number;
}

@Injectable({
    providedIn: 'root'
})
export class GamificationService {
    private apiUrl = `${environment.apiUrl}gamification`;

    constructor(private http: HttpClient) { }

    getStats(): Observable<UserStats> {
        return this.http.get<UserStats>(`${this.apiUrl}/stats`);
    }

    getAchievements(): Observable<UserAchievement[]> {
        return this.http.get<UserAchievement[]>(`${this.apiUrl}/achievements`);
    }

    getLeaderboard(limit: number = 10): Observable<LeaderboardEntry[]> {
        return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/leaderboard?limit=${limit}`);
    }
}
