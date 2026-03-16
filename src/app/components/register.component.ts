import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  error = signal<string | null>(null);

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  register(): void {
    this.error.set(null);
    this.auth
      .register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password
      })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: () => this.error.set('Registration failed')
      });
  }
}
