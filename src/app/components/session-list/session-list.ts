import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface Session {
    id: number;
    deviceInfo: string;
    ipAddress: string;
    createdDate: string;
    lastActive: string;
    expiryDate: string;
    current: boolean;
}

@Component({
    selector: 'app-session-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './session-list.html'
})
export class SessionListComponent implements OnInit {
    sessions: Session[] = [];
    loading = false;
    errorMessage = '';
    successMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadSessions();
    }

    loadSessions(): void {
        this.loading = true;
        this.authService.getSessions().subscribe({
            next: (data) => {
                this.sessions = data;
                this.loading = false;
            },
            error: (err) => {
                this.errorMessage = 'Failed to load sessions';
                this.loading = false;
            }
        });
    }

    revokeSession(sessionId: number): void {
        if (confirm('Are you sure you want to revoke this session?')) {
            this.authService.revokeSession(sessionId).subscribe({
                next: () => {
                    this.successMessage = 'Session revoked successfully';
                    this.loadSessions();
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (err) => {
                    this.errorMessage = 'Failed to revoke session';
                    setTimeout(() => this.errorMessage = '', 3000);
                }
            });
        }
    }

    revokeAllOthers(): void {
        const otherSessions = this.sessions.filter(s => !s.current);
        if (otherSessions.length === 0) {
            this.errorMessage = 'No other sessions to revoke';
            setTimeout(() => this.errorMessage = '', 3000);
            return;
        }

        if (confirm(`Are you sure you want to revoke ${otherSessions.length} other session(s)?`)) {
            let revokedCount = 0;
            let errorCount = 0;

            otherSessions.forEach((session, index) => {
                this.authService.revokeSession(session.id).subscribe({
                    next: () => {
                        revokedCount++;
                        if (revokedCount + errorCount === otherSessions.length) {
                            this.successMessage = `Successfully revoked ${revokedCount} session(s)`;
                            this.loadSessions();
                            setTimeout(() => this.successMessage = '', 3000);
                        }
                    },
                    error: (err) => {
                        errorCount++;
                        if (revokedCount + errorCount === otherSessions.length) {
                            this.errorMessage = `Failed to revoke ${errorCount} session(s)`;
                            this.loadSessions();
                            setTimeout(() => this.errorMessage = '', 3000);
                        }
                    }
                });
            });
        }
    }

    getDeviceName(userAgent: string): string {
        if (!userAgent) return 'Unknown Device';

        if (userAgent.includes('Chrome')) return '🌐 Chrome';
        if (userAgent.includes('Firefox')) return '🦊 Firefox';
        if (userAgent.includes('Safari')) return '🧭 Safari';
        if (userAgent.includes('Edge')) return '🌊 Edge';
        if (userAgent.includes('Mobile')) return '📱 Mobile';

        return '💻 Browser';
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString();
    }
}
