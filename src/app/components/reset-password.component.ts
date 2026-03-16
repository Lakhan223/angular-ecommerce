import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  message = signal<string | null>(null);
  error = signal<string | null>(null);
  hasToken = computed(() => !!this.token.trim());

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');
    if (email) {
      this.email = email;
    }
    if (token) {
      this.token = decodeURIComponent(token);
    }
  }

  submit(): void {
    this.message.set(null);
    this.error.set(null);

    if (!this.email.trim() || !this.token.trim()) {
      this.error.set('Reset link is invalid or expired.');
      return;
    }

    if (!this.newPassword.trim()) {
      this.error.set('New password is required.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.auth
      .resetPassword({ email: this.email.trim(), token: this.token.trim(), newPassword: this.newPassword })
      .subscribe({
        next: () => {
          this.message.set('Password reset successful. You can login now.');
          setTimeout(() => this.router.navigate(['/login']), 800);
        },
        error: () => {
          this.error.set('Reset failed. Token may be invalid or expired.');
        }
      });
  }
}
