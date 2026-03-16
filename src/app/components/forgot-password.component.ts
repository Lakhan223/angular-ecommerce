import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  email = '';
  message = signal<string | null>(null);
  error = signal<string | null>(null);

  constructor(private readonly auth: AuthService) {}

  submit(): void {
    this.message.set(null);
    this.error.set(null);

    if (!this.email.trim()) {
      this.error.set('Email is required.');
      return;
    }

    this.auth.forgotPassword({ email: this.email.trim() }).subscribe({
      next: () => {
        this.message.set('If this email exists, a reset token has been sent.');
      },
      error: () => {
        this.error.set('Unable to process the request.');
      }
    });
  }
}
