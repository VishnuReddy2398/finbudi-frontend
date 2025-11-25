import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-security-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-page.html',
  styleUrls: ['./security-page.css']
})
export class SecurityPageComponent {
  showDeleteModal = false;
  password = '';
  errorMessage = '';
  isDeleting = false;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) { }

  openDeleteModal() {
    this.showDeleteModal = true;
    this.password = '';
    this.errorMessage = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  deleteAccount() {
    if (!this.password) {
      this.errorMessage = 'Please enter your password to confirm.';
      return;
    }

    this.isDeleting = true;
    this.authService.deleteAccount(this.password).subscribe({
      next: () => {
        this.storageService.clean();
        this.router.navigate(['/login']);
      },
      error: err => {
        this.errorMessage = err.error.message || 'Failed to delete account';
        this.isDeleting = false;
      }
    });
  }
}
