import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { CreateOrderRequest, Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private readonly http: HttpClient) {}

  placeOrder(payload: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${API_BASE_URL}/orders`, payload);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_BASE_URL}/orders`);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/orders/${id}`);
  }
}
