import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  error = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  login(): void {
    this.error.set(null);
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.auth.ensureHydrated();
        const role = (res.role || this.auth.userRole() || '').toLowerCase();
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          if (returnUrl.startsWith('/admin') && role !== 'admin') {
            this.router.navigate(['/']);
            return;
          }
          this.router.navigateByUrl(returnUrl);
          return;
        }
        this.router.navigate([role === 'admin' ? '/admin' : '/']);
      },
      error: () => this.error.set('Invalid credentials')
    });
  }
}
