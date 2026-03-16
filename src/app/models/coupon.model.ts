export type CouponType = 1 | 2;

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
}

export interface CouponPublic {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface CouponCreateRequest {
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  isActive: boolean;
}

export interface CouponValidateResponse {
  isValid: boolean;
  message: string;
  discount: number;
  coupon?: CouponPublic | null;
}

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  1: 'Percentage',
  2: 'Fixed'
};
