import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'ecommerce_token';
  private readonly tokenSignal = signal<string | null>(null);
  private readonly emailSignal = signal<string | null>(null);
  private readonly roleSignal = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly userEmail = computed(() => this.emailSignal());
  readonly userRole = computed(() => this.roleSignal());

  constructor(private readonly http: HttpClient) {
    const stored = this.getStoredAuth();
    if (stored) {
      this.emailSignal.set(stored.email);
      this.roleSignal.set(stored.role);
    } else {
      this.hydrateFromToken();
    }
    this.tokenSignal.set(this.getToken());
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, payload).pipe(
      tap((response) => this.storeAuth(response))
    );
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, payload).pipe(
      tap((response) => this.storeAuth(response))
    );
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/forgot-password`, payload);
  }

  resetPassword(payload: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/reset-password`, payload);
  }

  changePassword(payload: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/change-password`, payload);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('ecommerce_email');
    localStorage.removeItem('ecommerce_role');
    this.tokenSignal.set(null);
    this.emailSignal.set(null);
    this.roleSignal.set(null);
  }

  ensureHydrated(): void {
    if (!this.emailSignal() || !this.roleSignal()) {
      this.hydrateFromToken();
    }
  }

  getToken(): string | null {
    if (this.tokenSignal()) {
      return this.tokenSignal();
    }
    const token = localStorage.getItem(this.tokenKey);
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }
    this.tokenSignal.set(token);
    return token;
  }

  private storeAuth(response: AuthResponse): void {
    const normalized = this.normalizeAuthResponse(response as unknown as Record<string, unknown>);
    if (normalized.token) {
      localStorage.setItem(this.tokenKey, normalized.token);
      this.tokenSignal.set(normalized.token);
    }
    if (normalized.email && normalized.role) {
      localStorage.setItem('ecommerce_email', normalized.email);
      localStorage.setItem('ecommerce_role', normalized.role);
      this.emailSignal.set(normalized.email);
      this.roleSignal.set(normalized.role);
    } else {
      this.hydrateFromToken();
    }
  }

  private getStoredAuth(): { email: string; role: string } | null {
    const email = localStorage.getItem('ecommerce_email');
    const role = localStorage.getItem('ecommerce_role');
    if (!email || !role || email === 'undefined' || email === 'null' || role === 'undefined' || role === 'null') {
      return null;
    }
    return { email, role };
  }

  private hydrateFromToken(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return;
    }

    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const email =
        payload.email ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
      const role =
        payload.role ||
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (email) {
        this.emailSignal.set(email);
        localStorage.setItem('ecommerce_email', email);
      }
      if (role) {
        this.roleSignal.set(role);
        localStorage.setItem('ecommerce_role', role);
      }
    } catch {
      // ignore malformed token
    }
  }

  private normalizeAuthResponse(response: Record<string, unknown>): { token: string | null; email: string | null; role: string | null } {
    const token = (response.token ?? response.Token) as string | undefined;
    const email = (response.email ?? response.Email) as string | undefined;
    const role = (response.role ?? response.Role) as string | undefined;
    return {
      token: token ?? null,
      email: email ?? null,
      role: role ?? null
    };
  }
}
