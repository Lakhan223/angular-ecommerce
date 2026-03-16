import { Injectable, signal, computed } from '@angular/core';
import { ProductDetail, ProductListItem } from '../models/product.model';
import { API_ORIGIN } from './api.config';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly storageKey = 'ecommerce_wishlist';
  private readonly itemsSignal = signal<WishlistItem[]>(this.loadItems());

  readonly items = computed(() => this.itemsSignal());
  readonly count = computed(() => this.itemsSignal().length);

  add(product: ProductListItem | ProductDetail): void {
    const items = [...this.itemsSignal()];
    if (items.find((item) => item.id === product.id)) {
      return;
    }

    const imageUrl = this.resolveImageUrl(product);

    items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl
    });

    this.update(items);
  }

  remove(id: string): void {
    const items = this.itemsSignal().filter((item) => item.id !== id);
    this.update(items);
  }

  private update(items: WishlistItem[]): void {
    this.itemsSignal.set(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
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

  private loadItems(): WishlistItem[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as WishlistItem[];
    } catch {
      return [];
    }
  }
}
