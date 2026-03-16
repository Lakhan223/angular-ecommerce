import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  message = signal<string | null>(null);
  error = signal<string | null>(null);

  constructor(private readonly auth: AuthService) {}

  submit(): void {
    this.message.set(null);
    this.error.set(null);

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.error.set('All fields are required.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.auth.changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.message.set('Password updated successfully.');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: () => {
        this.error.set('Current password is incorrect or password is invalid.');
      }
    });
  }
}
