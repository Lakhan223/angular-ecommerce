import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { PagedResult } from '../models/paged-result.model';
import { ProductDetail, ProductListItem, ProductUpsertRequest } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private readonly http: HttpClient) {}

  getProducts(query: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedResult<ProductListItem>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<PagedResult<ProductListItem>>(`${API_BASE_URL}/products`, { params });
  }

  getProduct(id: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${API_BASE_URL}/products/${id}`);
  }

  getCategories(): Observable<{ id: string; name: string; slug: string }[]> {
    return this.http.get<{ id: string; name: string; slug: string }[]>(`${API_BASE_URL}/products/categories`);
  }

  getBrands(): Observable<{ id: string; name: string; slug: string }[]> {
    return this.http.get<{ id: string; name: string; slug: string }[]>(`${API_BASE_URL}/products/brands`);
  }

  addReview(productId: string, payload: { rating: number; title: string; comment: string }): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/products/${productId}/reviews`, payload);
  }

  createProduct(payload: ProductUpsertRequest): Observable<ProductDetail> {
    return this.http.post<ProductDetail>(`${API_BASE_URL}/products`, payload);
  }

  updateProduct(id: string, payload: ProductUpsertRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/products/${id}`, payload);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/products/${id}`);
  }

  uploadProductImage(id: string, file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('files', file);
    return this.http.post<{ url: string }>(`${API_BASE_URL}/products/${id}/images`, form);
  }

  uploadProductImages(id: string, files: File[]): Observable<{ urls: string[] }> {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    return this.http.post<{ urls: string[] }>(`${API_BASE_URL}/products/${id}/images`, form);
  }
}
