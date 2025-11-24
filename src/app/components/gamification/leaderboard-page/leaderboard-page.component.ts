import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamificationService, LeaderboardEntry } from '../../../services/gamification.service';

@Component({
    selector: 'app-leaderboard-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './leaderboard-page.component.html',
    styleUrls: ['./leaderboard-page.component.css']
})
export class LeaderboardPageComponent implements OnInit {
    leaderboard: LeaderboardEntry[] = [];
    loading = true;

    constructor(private gamificationService: GamificationService) { }

    ngOnInit(): void {
        this.loadLeaderboard();
    }

    loadLeaderboard(): void {
        this.gamificationService.getLeaderboard().subscribe({
            next: (data) => {
                this.leaderboard = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading leaderboard', err);
                this.loading = false;
            }
        });
    }

    getRankEmoji(index: number): string {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return `#${index + 1}`;
        }
    }
}
