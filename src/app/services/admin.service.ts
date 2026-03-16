import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

export interface AdminDashboard {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AdminOrder {
  id: string;
  createdAt: string;
  status: number;
  paymentStatus: number;
  total: number;
  userEmail: string;
  items: { productId: string; name: string; quantity: number; totalPrice: number }[];
}

export interface AdminCreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${API_BASE_URL}/admin/dashboard`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/admin/categories`);
  }

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${API_BASE_URL}/admin/brands`);
  }

  createCategory(payload: Category): Observable<Category> {
    const body = {
      name: payload.name,
      slug: payload.slug,
      parentId: payload.parentId ?? null
    };
    return this.http.post<Category>(`${API_BASE_URL}/admin/categories`, body);
  }

  updateCategory(id: string, payload: Category): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/admin/categories/${id}`, payload);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/admin/categories/${id}`);
  }

  createBrand(payload: Brand): Observable<Brand> {
    const body = {
      name: payload.name,
      slug: payload.slug
    };
    return this.http.post<Brand>(`${API_BASE_URL}/admin/brands`, body);
  }

  updateBrand(id: string, payload: Brand): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/admin/brands/${id}`, payload);
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/admin/brands/${id}`);
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${API_BASE_URL}/admin/users`);
  }

  createUser(payload: AdminCreateUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${API_BASE_URL}/admin/users`, payload);
  }

  updateUserRole(id: string, role: string): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/admin/users/${id}/role`, { role });
  }

  resetPassword(id: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/admin/users/${id}/reset-password`, { newPassword });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/admin/users/${id}`);
  }

  getOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${API_BASE_URL}/admin/orders`);
  }

  updateOrderStatus(orderId: string, status: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/admin/orders/${orderId}/status`, { status });
  }
}
