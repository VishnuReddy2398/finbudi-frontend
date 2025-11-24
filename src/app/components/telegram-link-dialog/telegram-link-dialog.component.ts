import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelegramService, LinkCodeResponse } from '../../services/telegram.service';
import { interval, Subscription, finalize } from 'rxjs';

@Component({
    selector: 'app-telegram-link-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './telegram-link-dialog.component.html',
    styleUrls: ['./telegram-link-dialog.component.css']
})
export class TelegramLinkDialogComponent implements OnInit, OnDestroy {
    linkCode: string = '';
    isLoading: boolean = false;
    error: string = '';
    timeRemaining: number = 300; // 5 minutes in seconds
    private timerSubscription?: Subscription;
    private codeGeneratedTime?: Date;
    private pollingSubscription?: Subscription;
    isSuccess: boolean = false;

    @Output() closeEvent = new EventEmitter<void>();

    constructor(private telegramService: TelegramService) { }

    ngOnInit() {
        this.generateCode();
    }

    ngOnDestroy() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
        }
    }

    generateCode() {
        // Prevent multiple simultaneous generation requests
        if (this.isLoading) {
            console.log('Link code generation already in progress');
            return;
        }
        this.isLoading = true;
        this.error = '';

        this.telegramService.generateLinkCode().pipe(
            finalize(() => {
                this.isLoading = false;
            })
        ).subscribe({
            next: (response: LinkCodeResponse) => {
                // Backend returns `linkCode` field
                this.linkCode = (response as any).linkCode || response.code;
                this.codeGeneratedTime = new Date();
                this.startTimer();
                this.startPolling();
            },
            error: (err) => {
                if (err.status === 429) {
                    this.error = 'Too many requests. Please wait a moment before trying again.';
                } else {
                    this.error = 'Failed to generate link code. Please try again.';
                }
                console.error('Error generating link code:', err);
            }
        });
    }

    startTimer() {
        this.timeRemaining = 300;

        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }

        this.timerSubscription = interval(1000).subscribe(() => {
            this.timeRemaining--;

            if (this.timeRemaining <= 0) {
                this.timerSubscription?.unsubscribe();
                this.error = 'Code expired. Please generate a new code.';
                this.linkCode = '';
            }
        });
    }

    startPolling() {
        // Poll every 3 seconds to check if linked
        this.pollingSubscription = interval(3000).subscribe(() => {
            this.telegramService.getTelegramStatus().subscribe({
                next: (status) => {
                    if (status.linked) {
                        this.handleSuccess();
                    }
                },
                error: (err) => console.error('Error polling status:', err)
            });
        });
    }

    handleSuccess() {
        this.isSuccess = true;

        // Stop all timers/polling
        if (this.timerSubscription) this.timerSubscription.unsubscribe();
        if (this.pollingSubscription) this.pollingSubscription.unsubscribe();

        // Close after 1.5 seconds
        setTimeout(() => {
            this.close();
        }, 1500);
    }

    getFormattedTime(): string {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    copyCode() {
        navigator.clipboard.writeText(this.linkCode).then(() => {
            // Show a brief "Copied!" message
            const btn = document.querySelector('.copy-btn');
            if (btn) {
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = 'Copy Code';
                }, 2000);
            }
        });
    }

    close() {
        // Emit close event to parent component
        this.closeEvent.emit();
    }
}
