import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamificationService, UserAchievement, Achievement } from '../../../services/gamification.service';

@Component({
    selector: 'app-achievements-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './achievements-page.component.html',
    styleUrls: ['./achievements-page.component.css']
})
export class AchievementsPageComponent implements OnInit {
    userAchievements: UserAchievement[] = [];
    // In a real app, we'd fetch all possible achievements too to show locked ones
    // For now, we'll just show unlocked ones or mock some locked ones if needed
    loading = true;

    constructor(private gamificationService: GamificationService) { }

    ngOnInit(): void {
        this.loadAchievements();
    }

    loadAchievements(): void {
        this.gamificationService.getAchievements().subscribe({
            next: (data) => {
                this.userAchievements = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading achievements', err);
                this.loading = false;
            }
        });
    }
}
