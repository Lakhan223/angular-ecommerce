import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { ProductDetail, ProductListItem } from '../models/product.model';
import { API_ORIGIN } from './api.config';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly guestKey = 'ecommerce_cart_guest';
  private currentKey = this.guestKey;
  private readonly itemsSignal = signal<CartItem[]>([]);
  private mode: 'guest' | 'server' = 'guest';

  readonly items = computed(() => this.itemsSignal());
  readonly itemCount = computed(() => this.itemsSignal().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() => this.itemsSignal().reduce((sum, item) => sum + item.price * item.quantity, 0));

  constructor(private readonly auth: AuthService, private readonly http: HttpClient) {
    this.currentKey = this.buildStorageKey();
    this.itemsSignal.set(this.loadItems(this.currentKey));
    this.mode = this.auth.isAuthenticated() ? 'server' : 'guest';
    if (this.mode === 'server') {
      this.loadFromServer();
    }

    effect(() => {
      const key = this.buildStorageKey();
      const isAuth = this.auth.isAuthenticated();
      const nextMode: 'guest' | 'server' = isAuth ? 'server' : 'guest';
      if (nextMode !== this.mode) {
        this.mode = nextMode;
        if (this.mode === 'server') {
          this.loadFromServer();
          return;
        }
      }

      if (key !== this.currentKey && this.mode === 'guest') {
        this.currentKey = key;
        this.itemsSignal.set(this.loadItems(key));
      }
    });
  }

  addItem(product: ProductListItem | ProductDetail, quantity = 1, size?: string, priceOverride?: number): void {
    if (this.mode === 'server') {
      this.http
        .post<CartItem[]>(`${API_BASE_URL}/cart/items`, {
          productId: product.id,
          quantity,
          size: size ?? ''
        })
        .subscribe((items) => this.itemsSignal.set(this.normalizeItems(items)));
      return;
    }

    const items = [...this.itemsSignal()];
    const normalizedSize = (size ?? '').trim();
    const existing = items.find((i) => i.productId === product.id && (i.size ?? '') === normalizedSize);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: Number.isFinite(priceOverride ?? NaN) ? (priceOverride as number) : product.price,
        quantity,
        size: normalizedSize || undefined,
        imageUrl: this.resolveImageUrl(product)
      });
    }
    this.updateItems(items);
  }

  updateQuantity(productId: string, quantity: number, size?: string): void {
    if (this.mode === 'server') {
      this.http
        .put<CartItem[]>(`${API_BASE_URL}/cart/items/${productId}`, { quantity, size: size ?? '' })
        .subscribe((items) => this.itemsSignal.set(this.normalizeItems(items)));
      return;
    }

    const items = this.itemsSignal().map((item) =>
      item.productId === productId && (item.size ?? '') === (size ?? '').trim()
        ? { ...item, quantity }
        : item
    );
    this.updateItems(items);
  }

  removeItem(productId: string, size?: string): void {
    if (this.mode === 'server') {
      this.http
        .delete<CartItem[]>(`${API_BASE_URL}/cart/items/${productId}?size=${encodeURIComponent(size ?? '')}`)
        .subscribe((items) => this.itemsSignal.set(this.normalizeItems(items)));
      return;
    }

    const normalizedSize = (size ?? '').trim();
    const items = this.itemsSignal().filter(
      (item) => !(item.productId === productId && (item.size ?? '') === normalizedSize)
    );
    this.updateItems(items);
  }

  clear(): void {
    if (this.mode === 'server') {
      this.http.delete<CartItem[]>(`${API_BASE_URL}/cart`).subscribe(() => {
        this.itemsSignal.set([]);
      });
      return;
    }

    this.updateItems([]);
  }

  useGuestCart(): void {
    this.mode = 'guest';
    this.currentKey = this.guestKey;
    this.itemsSignal.set(this.loadItems(this.guestKey));
  }

  syncGuestToServer(): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }
    this.mode = 'server';
    const guestItems = this.loadItems(this.guestKey);
    if (guestItems.length === 0) {
      this.loadFromServer();
      return;
    }

    const payload = {
      items: guestItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size ?? ''
      }))
    };

    this.http.post<CartItem[]>(`${API_BASE_URL}/cart/merge`, payload).subscribe((items) => {
      this.itemsSignal.set(this.normalizeItems(items));
      localStorage.removeItem(this.guestKey);
    });
  }

  private updateItems(items: CartItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(this.currentKey, JSON.stringify(items));
  }

  private resolveImageUrl(product: ProductListItem | ProductDetail): string {
    if ('primaryImageUrl' in product) {
      return this.normalizeUrl(product.primaryImageUrl || '');
    }
    return this.normalizeUrl(product.images[0]?.url ?? '');
  }

  private normalizeUrl(url: string): string {
    if (!url) {
      return '';
    }
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${API_ORIGIN}${url}`;
    }
    return url;
  }

  private loadItems(key: string): CartItem[] {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  }

  private loadFromServer(): void {
    this.http
      .get<CartItem[]>(`${API_BASE_URL}/cart`)
      .subscribe((items) => this.itemsSignal.set(this.normalizeItems(items)));
  }

  private normalizeItems(items: CartItem[]): CartItem[] {
    return items.map((item) => ({
      ...item,
      imageUrl: this.normalizeUrl(item.imageUrl || '')
    }));
  }

  private buildStorageKey(): string {
    const email = this.auth.userEmail();
    if (email) {
      return `ecommerce_cart_${encodeURIComponent(email.toLowerCase())}`;
    }
    return this.guestKey;
  }
}
