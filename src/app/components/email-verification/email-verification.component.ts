import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-email-verification',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div *ngIf="loading" class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p class="text-gray-600 text-lg">Verifying your email...</p>
        </div>

        <div *ngIf="!loading && success" class="text-center">
          <div class="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-800 mb-4">Email Verified!</h2>
          <p class="text-gray-600 mb-6">{{ message }}</p>
          <button 
            (click)="goToLogin()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full">
            Go to Login
          </button>
        </div>

        <div *ngIf="!loading && !success" class="text-center">
          <div class="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-800 mb-4">Verification Failed</h2>
          <p class="text-gray-600 mb-6">{{ message }}</p>
          <button 
            (click)="goToLogin()"
            class="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class EmailVerificationComponent implements OnInit {
    loading = true;
    success = false;
    message = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        const token = this.route.snapshot.queryParamMap.get('token');

        if (!token) {
            this.loading = false;
            this.success = false;
            this.message = 'Invalid verification link. No token provided.';
            return;
        }

        this.authService.verifyEmail(token).subscribe({
            next: (response) => {
                this.loading = false;
                this.success = true;
                this.message = response.message || 'Your email has been verified successfully!';
            },
            error: (error) => {
                this.loading = false;
                this.success = false;
                this.message = error.error?.message || 'Verification failed. The link may be invalid or expired.';
            }
        });
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}
