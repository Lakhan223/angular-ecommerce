import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  items = this.cart.items;
  total = this.cart.total;

  constructor(private readonly cart: CartService) {}

  updateQuantity(productId: string, quantity: number, size?: string): void {
    if (quantity <= 0) {
      this.cart.removeItem(productId, size);
      return;
    }
    this.cart.updateQuantity(productId, quantity, size);
  }

  remove(productId: string, size?: string): void {
    this.cart.removeItem(productId, size);
  }
}
