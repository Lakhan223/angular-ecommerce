import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.component.html'
})
export class WishlistComponent {
  items = this.wishlist.items;

  constructor(private readonly wishlist: WishlistService) {}

  remove(id: string): void {
    this.wishlist.remove(id);
  }
}
