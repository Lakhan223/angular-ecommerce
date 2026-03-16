import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { ThemeService } from './services/theme.service';
import { WishlistService } from './services/wishlist.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './app.component.html'
})
export class AppComponent {
  cartCount = this.cartService.itemCount;
  wishlistCount = this.wishlist.count;
  isAuthenticated = this.authService.isAuthenticated;
  userEmail = this.authService.userEmail;
  userRole = this.authService.userRole;
  darkMode = this.theme.darkMode;

  constructor(
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly wishlist: WishlistService,
    private readonly theme: ThemeService,
    private readonly router: Router
  ) {}

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.cartService.useGuestCart();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
