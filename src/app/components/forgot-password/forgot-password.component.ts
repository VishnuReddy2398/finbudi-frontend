import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
    form: any = {
        email: null
    };
    isSuccessful = false;
    isFailed = false;
    errorMessage = '';
    successMessage = '';

    constructor(private authService: AuthService) { }

    onSubmit(): void {
        const { email } = this.form;

        this.authService.forgotPassword(email).subscribe({
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
