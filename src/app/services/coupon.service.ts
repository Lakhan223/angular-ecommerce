import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Coupon, CouponCreateRequest, CouponPublic, CouponValidateResponse } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  constructor(private readonly http: HttpClient) {}

  getActive(): Observable<CouponPublic[]> {
    return this.http.get<CouponPublic[]>(`${API_BASE_URL}/coupons/active`);
  }

  validate(code: string, subtotal: number): Observable<CouponValidateResponse> {
    return this.http.post<CouponValidateResponse>(`${API_BASE_URL}/coupons/validate`, { code, subtotal });
  }

  getAdminCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${API_BASE_URL}/admin/coupons`);
  }

  createCoupon(payload: CouponCreateRequest): Observable<Coupon> {
    return this.http.post<Coupon>(`${API_BASE_URL}/admin/coupons`, payload);
  }

  updateCoupon(id: string, payload: CouponCreateRequest): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/admin/coupons/${id}`, payload);
  }

  deleteCoupon(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/admin/coupons/${id}`);
  }
}
