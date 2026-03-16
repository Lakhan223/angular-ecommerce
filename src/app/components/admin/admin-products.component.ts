import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from './admin-nav.component';
import { ProductService } from '../../services/product.service';
import { ProductListItem, ProductUpsertRequest, ProductImage, ProductVariantUpsert } from '../../models/product.model';
import { API_ORIGIN } from '../../services/api.config';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-products.component.html'
})
export class AdminProductsComponent {
  products = signal<ProductListItem[]>([]);
  categories = signal<{ id: string; name: string }[]>([]);
  brands = signal<{ id: string; name: string }[]>([]);

  form: ProductUpsertRequest = {
    name: '',
    sku: '',
    description: '',
    size: '',
    specifications: {},
    variants: [],
    price: 0,
    oldPrice: null,
    stock: 0,
    categoryId: '',
    brandId: '',
    isActive: true
  };

  isEdit = false;
  editingId: string | null = null;
  imageFiles: File[] = [];
  currentImages: ProductImage[] = [];
  uploadMessage = signal<string | null>(null);
  specRows: { key: string; value: string }[] = [{ key: '', value: '' }];
  variantRows: ProductVariantUpsert[] = [
    { size: '', price: 0, oldPrice: null, stock: 0, isActive: true }
  ];

  constructor(private readonly productsApi: ProductService) {
    this.load();
  }

  load(): void {
    this.productsApi.getProducts({ page: 1, pageSize: 100 }).subscribe((res) => this.products.set(res.items));
    this.productsApi.getCategories().subscribe((res) => this.categories.set(res));
    this.productsApi.getBrands().subscribe((res) => this.brands.set(res));
  }

  edit(id: string): void {
    this.productsApi.getProduct(id).subscribe((product) => {
      this.form = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        size: product.size ?? '',
        specifications: product.specifications ?? {},
        variants: product.variants ?? [],
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        stock: product.stock,
        categoryId: product.categoryId,
        brandId: product.brandId,
        isActive: product.isActive
      };
      this.specRows = this.toSpecRows(product.specifications);
      this.variantRows = (product.variants && product.variants.length)
        ? product.variants.map((v) => ({
            size: v.size,
            price: v.price,
            oldPrice: v.oldPrice ?? null,
            stock: v.stock,
            isActive: v.isActive
          }))
        : [{ size: '', price: 0, oldPrice: null, stock: 0, isActive: true }];
      this.currentImages = product.images || [];
      this.isEdit = true;
      this.editingId = id;
    });
  }

  reset(): void {
    this.form = {
      name: '',
      sku: '',
      description: '',
      size: '',
      specifications: {},
      variants: [],
      price: 0,
      oldPrice: null,
      stock: 0,
      categoryId: '',
      brandId: '',
      isActive: true
    };
    this.isEdit = false;
    this.editingId = null;
    this.imageFiles = [];
    this.currentImages = [];
    this.uploadMessage.set(null);
    this.specRows = [{ key: '', value: '' }];
    this.variantRows = [{ size: '', price: 0, oldPrice: null, stock: 0, isActive: true }];
  }

  save(): void {
    this.form.specifications = this.buildSpecifications();
    this.form.variants = this.buildVariants();
    if (this.isEdit && this.editingId) {
      this.productsApi.updateProduct(this.editingId, this.form).subscribe(() => {
        this.load();
      });
      return;
    }

    this.productsApi.createProduct(this.form).subscribe((created) => {
      if (this.imageFiles.length) {
        this.productsApi.uploadProductImages(created.id, this.imageFiles).subscribe((res) => {
          this.uploadMessage.set(`Uploaded ${res.urls.length} image(s).`);
          this.imageFiles = [];
          this.isEdit = true;
          this.editingId = created.id;
          this.productsApi.getProduct(created.id).subscribe((product) => {
            this.currentImages = product.images || [];
          });
          this.load();
        });
        return;
      }

      this.load();
      this.reset();
    });
  }

  remove(id: string): void {
    this.productsApi.deleteProduct(id).subscribe(() => this.load());
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.imageFiles = target.files ? Array.from(target.files) : [];
  }

  uploadImage(): void {
    if (!this.editingId || this.imageFiles.length === 0) {
      return;
    }

    this.productsApi.uploadProductImages(this.editingId, this.imageFiles).subscribe((res) => {
      this.uploadMessage.set(`Uploaded ${res.urls.length} image(s).`);
      this.imageFiles = [];
      this.productsApi.getProduct(this.editingId!).subscribe((product) => {
        this.currentImages = product.images || [];
      });
    });
  }

  resolveImage(url: string): string {
    if (!url) {
      return 'https://placehold.co/120x120';
    }
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${API_ORIGIN}${url}`;
    }
    return url;
  }

  addSpecRow(): void {
    this.specRows.push({ key: '', value: '' });
  }

  removeSpecRow(index: number): void {
    this.specRows.splice(index, 1);
    if (this.specRows.length === 0) {
      this.specRows.push({ key: '', value: '' });
    }
  }

  private buildSpecifications(): Record<string, string> {
    const specs: Record<string, string> = {};
    for (const row of this.specRows) {
      const key = row.key?.trim();
      const value = row.value?.trim();
      if (key && value) {
        specs[key] = value;
      }
    }
    return specs;
  }

  private toSpecRows(specs?: Record<string, string> | null): { key: string; value: string }[] {
    if (!specs || Object.keys(specs).length === 0) {
      return [{ key: '', value: '' }];
    }
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  }

  addVariantRow(): void {
    this.variantRows.push({ size: '', price: 0, oldPrice: null, stock: 0, isActive: true });
  }

  removeVariantRow(index: number): void {
    this.variantRows.splice(index, 1);
    if (this.variantRows.length === 0) {
      this.variantRows.push({ size: '', price: 0, oldPrice: null, stock: 0, isActive: true });
    }
  }

  private buildVariants(): ProductVariantUpsert[] {
    return this.variantRows
      .map((row) => ({
        size: row.size.trim(),
        price: Number(row.price),
        oldPrice: row.oldPrice ?? null,
        stock: Number(row.stock),
        isActive: row.isActive
      }))
      .filter((row) => row.size && row.price > 0);
  }
}
