import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { StorageService } from './services/storage.service';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
    title = 'finance-tracker-frontend';
    isLoggedIn = false;
    isSidebarOpen = false;
    username?: string;

    constructor(
        private storage: StorageService,
        private authService: AuthService,
        private router: Router
    ) {
        // Listen to route changes to update auth state
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.checkLoginStatus();
        });
    }

    ngOnInit(): void {
        this.checkLoginStatus();
    }

    checkLoginStatus(): void {
        this.isLoggedIn = this.storage.isLoggedIn();

        if (this.isLoggedIn) {
            const user = this.storage.getUser();
            this.username = user.username;
        }
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    logout(): void {
        const refreshToken = this.storage.getRefreshToken();

        if (refreshToken) {
            this.authService.logout(refreshToken).subscribe({
                next: () => {
                    this.storage.clean();
                    this.isLoggedIn = false;
                    this.router.navigate(['/home']);
                },
                error: () => {
                    // Even if backend call fails, clear local storage
                    this.storage.clean();
                    this.isLoggedIn = false;
                    this.router.navigate(['/home']);
                }
            });
        } else {
            this.storage.clean();
            this.isLoggedIn = false;
            this.router.navigate(['/home']);
        }
    }
}
