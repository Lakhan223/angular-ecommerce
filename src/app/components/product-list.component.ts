import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../services/product.service';
import { ProductListItem } from '../models/product.model';
import { API_ORIGIN } from '../services/api.config';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent {
  items = signal<ProductListItem[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = 12;

  categories = signal<{ id: string; name: string }[]>([]);
  brands = signal<{ id: string; name: string }[]>([]);

  searchText = '';
  selectedCategoryId: string | null = null;
  selectedBrandId: string | null = null;
  sortValue = 'newest';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  pageCount = computed(() => Math.ceil(this.total() / this.pageSize));

  constructor(private readonly products: ProductService) {
    this.loadFilters();
    this.load();
  }

  load(): void {
    this.products
      .getProducts({
        search: this.searchText,
        categoryId: this.selectedCategoryId || undefined,
        brandId: this.selectedBrandId || undefined,
        minPrice: this.minPrice ?? undefined,
        maxPrice: this.maxPrice ?? undefined,
        sort: this.sortValue,
        page: this.page(),
        pageSize: this.pageSize
      })
      .subscribe((res) => {
        this.items.set(res.items);
        this.total.set(res.total);
      });
  }

  loadFilters(): void {
    this.products.getCategories().subscribe((res) => this.categories.set(res));
    this.products.getBrands().subscribe((res) => this.brands.set(res));
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  nextPage(): void {
    if (this.page() < this.pageCount()) {
      this.page.set(this.page() + 1);
      this.load();
    }
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.load();
    }
  }

  resolveImage(url: string): string {
    if (!url) {
      return 'https://placehold.co/600x400';
    }
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${API_ORIGIN}${url}`;
    }
    return url;
  }
}
