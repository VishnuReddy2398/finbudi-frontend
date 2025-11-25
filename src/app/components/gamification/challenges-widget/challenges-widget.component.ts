import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';


interface Challenge {
    id: number;
    name: string;
    description: string;
    type: string;
    targetValue: number;
    rewardPoints: number;
    startDate: string;
    endDate: string;
    active: boolean;
}

interface UserChallenge {
    id: number;
    challenge: Challenge;
    currentProgress: number;
    status: string;
    completedAt?: string;
    createdAt: string;
}

interface ChallengesResponse {
    activeChallenges: Challenge[];
    userChallenges: UserChallenge[];
}

@Component({
    selector: 'app-challenges-widget',
    standalone: true,
    imports: [CommonModule, HttpClientModule],
    templateUrl: './challenges-widget.component.html',
    styleUrls: ['./challenges-widget.component.css']
})
export class ChallengesWidgetComponent implements OnInit {
    activeChallenges: Challenge[] = [];
    userChallenges: UserChallenge[] = [];
    loading = true;
    error: string | null = null;
    showModal = false;

    private apiUrl = `${environment.apiUrl}gamification/challenges`;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadChallenges();
    }

    getCompletedCount(): number {
        return this.userChallenges.filter(uc => uc.status === 'COMPLETED').length;
    }

    loadChallenges(): void {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.get<ChallengesResponse>(this.apiUrl, { headers }).subscribe({
            next: (response) => {
                this.activeChallenges = response.activeChallenges;
                this.userChallenges = response.userChallenges;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading challenges:', error);
                this.error = 'Failed to load challenges';
                this.loading = false;
            }
        });
    }

    enrollInChallenge(challengeId: number): void {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.post(`${this.apiUrl}/${challengeId}/enroll`, {}, { headers }).subscribe({
            next: () => {
                this.loadChallenges(); // Reload to show updated status
            },
            error: (error) => {
                console.error('Error enrolling in challenge:', error);
                alert('Failed to enroll in challenge. You may already be enrolled.');
            }
        });
    }

    isEnrolled(challengeId: number): boolean {
        return this.userChallenges.some(uc => uc.challenge.id === challengeId);
    }

    getUserChallenge(challengeId: number): UserChallenge | undefined {
        return this.userChallenges.find(uc => uc.challenge.id === challengeId);
    }

    getProgressPercentage(userChallenge: UserChallenge): number {
        return Math.min(100, (userChallenge.currentProgress / userChallenge.challenge.targetValue) * 100);
    }

    getProgressBarClass(percentage: number): string {
        if (percentage >= 100) return 'complete';
        if (percentage >= 75) return 'high';
        if (percentage >= 50) return 'medium';
        return 'low';
    }

    getDaysRemaining(endDate: string): number {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    getChallengeIcon(type: string): string {
        switch (type) {
            case 'TRANSACTION_COUNT': return '📝';
            case 'BUDGET_ADHERENCE': return '💰';
            case 'SAVINGS_GOAL': return '🎯';
            case 'STREAK_MAINTENANCE': return '🔥';
            case 'CATEGORY_LIMIT': return '🛒';
            default: return '🏆';
        }
    }
}
