import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mfa-setup.html',
  styleUrls: ['./mfa-setup.css']
})
export class MfaSetupComponent implements OnInit {
  qrCodeImage: string = '';
  secret: string = '';
  verificationCode: string = '';
  isMfaEnabled: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  currentUser: any;

  constructor(private authService: AuthService, private storageService: StorageService) { }

  ngOnInit(): void {
    this.currentUser = this.storageService.getUser();
    // Check if MFA is already enabled? 
    // We don't have that info in user object yet unless we update it on login.
    // For now, assume false or check via an endpoint if we had one.
  }

  generateMfa(): void {
    this.authService.generateMfa().subscribe({
      next: data => {
        this.qrCodeImage = data.qrCodeImage;
        this.secret = data.secret;
        this.errorMessage = '';
      },
      error: err => {
        this.errorMessage = err.error.message || 'Error generating QR code';
      }
    });
  }

  enableMfa(): void {
    this.authService.enableMfa(this.verificationCode, this.secret).subscribe({
      next: data => {
        this.isMfaEnabled = true;
        this.successMessage = data.message;
        this.errorMessage = '';
        this.qrCodeImage = '';
        this.secret = '';
      },
      error: err => {
        this.errorMessage = err.error.message || 'Invalid code';
      }
    });
  }
}
