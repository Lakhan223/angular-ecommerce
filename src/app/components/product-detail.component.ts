import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { WishlistService } from '../services/wishlist.service';
import { ProductDetail } from '../models/product.model';
import { API_ORIGIN } from '../services/api.config';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent {
  product = signal<ProductDetail | null>(null);
  loading = signal(true);
  selectedImage = signal<string>('');
  specEntries = computed(() => Object.entries(this.product()?.specifications ?? {}));
  variants = computed(() => (this.product()?.variants ?? []).filter((v) => v.isActive));
  sizes = computed(() => {
    const variants = this.variants();
    if (variants.length) {
      return variants.map((v) => v.size);
    }
    const raw = this.product()?.size ?? '';
    return raw
      .split(/[,/|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  });
  selectedSize = signal<string>('');
  selectedVariant = computed(() => {
    const size = this.selectedSize();
    if (!size) {
      return null;
    }
    return this.variants().find((v) => v.size === size) ?? null;
  });
  displayPrice = computed(() => this.selectedVariant()?.price ?? this.product()?.price ?? 0);
  displayOldPrice = computed(() => this.selectedVariant()?.oldPrice ?? this.product()?.oldPrice ?? null);

  rating = 5;
  title = '';
  comment = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly products: ProductService,
    private readonly cart: CartService,
    private readonly auth: AuthService,
    private readonly wishlist: WishlistService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.products.getProduct(id).subscribe((res) => {
        this.product.set(res);
        if (res.images.length) {
          this.selectedImage.set(res.images[0].url);
        }
        const sizes = res.variants?.length
          ? res.variants.filter((v) => v.isActive).map((v) => v.size)
          : res.size
            ? res.size.split(/[,/|]/).map((s) => s.trim()).filter((s) => s.length > 0)
            : [];
        this.selectedSize.set(sizes[0] ?? '');
        this.loading.set(false);
      });
    }
  }

  addToCart(): void {
    const item = this.product();
    if (!item) {
      return;
    }
    this.cart.addItem(item, 1, this.selectedSize(), this.selectedVariant()?.price);
  }

  addToWishlist(): void {
    const item = this.product();
    if (!item) {
      return;
    }
    this.wishlist.add(item);
  }

  submitReview(): void {
    const item = this.product();
    if (!item) {
      return;
    }

    this.products
      .addReview(item.id, {
        rating: this.rating,
        title: this.title,
        comment: this.comment
      })
      .subscribe(() => {
        this.title = '';
        this.comment = '';
      });
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  resolveImage(url: string): string {
    if (!url) {
      return 'https://placehold.co/700x500';
    }
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${API_ORIGIN}${url}`;
    }
    return url;
  }

  selectImage(url: string): void {
    this.selectedImage.set(url);
  }
}
