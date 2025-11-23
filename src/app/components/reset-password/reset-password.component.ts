import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
    form: any = {
        password: null,
        confirmPassword: null
    };
    token = '';
    isSuccessful = false;
    isFailed = false;
    errorMessage = '';
    successMessage = '';

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.token = this.route.snapshot.queryParams['token'];
        if (!this.token) {
            this.isFailed = true;
            this.errorMessage = 'Invalid or missing reset token.';
        }
    }

    onSubmit(): void {
        const { password, confirmPassword } = this.form;

        if (password !== confirmPassword) {
            this.isFailed = true;
            this.errorMessage = 'Passwords do not match.';
            return;
        }

        this.authService.resetPassword(this.token, password).subscribe({
            next: data => {
                this.isSuccessful = true;
                this.isFailed = false;
                this.successMessage = data.message;
            },
            error: err => {
                this.errorMessage = err.error.message;
                this.isFailed = true;
            }
        });
    }
}
