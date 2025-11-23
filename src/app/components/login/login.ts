import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  form: any = {
    username: '',
    password: '',
    code: '',
    captcha: false
  };
  isMfaRequired = false;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  showResendButton = false;
  resendMessage = '';
  userEmail = '';

  constructor(private authService: AuthService, private storage: StorageService, private router: Router) { }

  ngOnInit(): void {
    if (this.storage.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storage.getUser().roles;
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    const { username, password, code, captcha } = this.form;

    // Mock CAPTCHA Token Generation
    const recaptchaToken = captcha ? 'mock-token' : undefined;

    this.authService.login(username, password, code, recaptchaToken).subscribe({
      next: data => {
        if (data.mfaRequired) {
          this.isMfaRequired = true;
          this.isLoginFailed = false;
          return;
        }

        this.storage.saveUser(data);

        // Save refresh token
        if (data.refreshToken) {
          this.storage.saveRefreshToken(data.refreshToken);
        }

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.storage.getUser().roles;
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;

        // Check if error is about email verification
        if (this.errorMessage && this.errorMessage.toLowerCase().includes('verify your email')) {
          this.showResendButton = true;
          this.userEmail = this.form.username; // Store for resend
        } else {
          this.showResendButton = false;
        }
      }
    });
  }

  resendVerificationEmail(): void {
    this.resendMessage = '';
    this.authService.resendVerificationEmail(this.userEmail).subscribe({
      next: (response) => {
        this.resendMessage = response.message || 'Verification email sent!';
        this.showResendButton = false;
      },
      error: (err) => {
        this.resendMessage = err.error?.message || 'Failed to resend email';
      }
    });
  }
}
