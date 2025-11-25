import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamificationService, UserStats } from '../../../services/gamification.service';

@Component({
    selector: 'app-stats-widget',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stats-widget.component.html',
    styleUrls: ['./stats-widget.component.css']
})
export class StatsWidgetComponent implements OnInit {
    stats: UserStats | null = null;
    loading = true;

    @Output() openChallenges = new EventEmitter<void>();
    @Input() telegramLinked: boolean = false;
    @Input() telegramUsername: string | null = null;
    @Output() openTelegramDialog = new EventEmitter<void>();
    @Output() unlinkTelegram = new EventEmitter<void>();

    constructor(private gamificationService: GamificationService) { }

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.gamificationService.getStats().subscribe({
            next: (data) => {
                this.stats = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading stats', err);
                this.loading = false;
            }
        });
    }

    get streakEmoji(): string {
        if (!this.stats) return '';
        if (this.stats.currentStreak >= 30) return '🔥🔥🔥';
        if (this.stats.currentStreak >= 7) return '🔥🔥';
        if (this.stats.currentStreak >= 1) return '🔥';
        return '💤';
    }
}
