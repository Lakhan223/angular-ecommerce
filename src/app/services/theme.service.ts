import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'ecommerce_theme';
  readonly darkMode = signal<boolean>(false);

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    const isDark = stored === 'dark';
    this.darkMode.set(isDark);
    this.applyTheme(isDark);
  }

  toggle(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    localStorage.setItem(this.storageKey, next ? 'dark' : 'light');
    this.applyTheme(next);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
}
