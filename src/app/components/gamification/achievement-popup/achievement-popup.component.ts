import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Achievement } from '../../../services/gamification.service';

@Component({
    selector: 'app-achievement-popup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './achievement-popup.component.html',
    styleUrls: ['./achievement-popup.component.css']
})
export class AchievementPopupComponent {
    @Input() achievement: Achievement | null = null;
    @Output() close = new EventEmitter<void>();

    onClose(): void {
        this.close.emit();
    }
}
