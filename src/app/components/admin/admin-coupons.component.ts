import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from './admin-nav.component';
import { CouponService } from '../../services/coupon.service';
import { COUPON_TYPE_LABELS, Coupon, CouponCreateRequest, CouponType } from '../../models/coupon.model';

type CouponForm = {
  code: string;
  description: string;
  type: CouponType;
  value: number | null;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startsAt: string;
  endsAt: string;
  usageLimit: number | null;
  isActive: boolean;
};

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-coupons.component.html'
})
export class AdminCouponsComponent {
  coupons = signal<Coupon[]>([]);
  typeLabels = COUPON_TYPE_LABELS;
  error = signal<string | null>(null);
  saving = signal(false);

  form: CouponForm = {
    code: '',
    description: '',
    type: 1,
    value: null,
    minOrderAmount: null,
    maxDiscountAmount: null,
    startsAt: '',
    endsAt: '',
    usageLimit: null,
    isActive: true
  };

  isEdit = false;
  editingId: string | null = null;

  constructor(private readonly couponsApi: CouponService) {
    this.load();
  }

  load(): void {
    this.couponsApi.getAdminCoupons().subscribe((res) => this.coupons.set(res));
  }

  generateCode(): void {
    const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
    this.form.code = `SAVE-${rand}`;
  }

  edit(coupon: Coupon): void {
    this.form = {
      code: coupon.code,
      description: coupon.description ?? '',
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount ?? null,
      maxDiscountAmount: coupon.maxDiscountAmount ?? null,
      startsAt: this.toDateInput(coupon.startsAt),
      endsAt: this.toDateInput(coupon.endsAt),
      usageLimit: coupon.usageLimit ?? null,
      isActive: coupon.isActive
    };
    this.isEdit = true;
    this.editingId = coupon.id;
  }

  reset(): void {
    this.form = {
      code: '',
      description: '',
      type: 1,
      value: null,
      minOrderAmount: null,
      maxDiscountAmount: null,
      startsAt: '',
      endsAt: '',
      usageLimit: null,
      isActive: true
    };
    this.isEdit = false;
    this.editingId = null;
  }

  save(): void {
    if (this.saving()) {
      return;
    }
    this.error.set(null);

    const code = this.form.code.trim();
    const value = Number(this.form.value ?? 0);
    if (!code) {
      this.error.set('Code is required.');
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      this.error.set('Value must be greater than 0.');
      return;
    }
    if (this.form.type === 1 && value > 100) {
      this.error.set('Percentage cannot exceed 100.');
      return;
    }
    if (this.form.startsAt && this.form.endsAt) {
      const start = new Date(this.form.startsAt);
      const end = new Date(this.form.endsAt);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start > end) {
        this.error.set('Start date must be before end date.');
        return;
      }
    }

    const payload = this.toPayload();
    this.saving.set(true);
    if (this.isEdit && this.editingId) {
      this.couponsApi.updateCoupon(this.editingId, payload).subscribe({
        next: () => {
          this.load();
        },
        error: (err) => this.setServerError(err),
        complete: () => this.saving.set(false)
      });
      return;
    }

    this.couponsApi.createCoupon(payload).subscribe({
      next: () => {
        this.load();
        this.reset();
      },
      error: (err) => this.setServerError(err),
      complete: () => this.saving.set(false)
    });
  }

  remove(id: string): void {
    this.couponsApi.deleteCoupon(id).subscribe(() => this.load());
  }

  private toPayload(): CouponCreateRequest {
    return {
      code: this.form.code.trim(),
      description: this.form.description.trim(),
      type: this.form.type,
      value: Number(this.form.value ?? 0),
      minOrderAmount: this.toNullableNumber(this.form.minOrderAmount),
      maxDiscountAmount: this.toNullableNumber(this.form.maxDiscountAmount),
      startsAt: this.form.startsAt || null,
      endsAt: this.form.endsAt || null,
      usageLimit: this.toNullableNumber(this.form.usageLimit),
      isActive: this.form.isActive
    };
  }

  private toNullableNumber(value: number | null): number | null {
    if (value === null || Number.isNaN(value)) {
      return null;
    }
    return value;
  }

  private toDateInput(value?: string | null): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().slice(0, 10);
  }

  private setServerError(err: unknown): void {
    const anyErr = err as { error?: { errors?: Record<string, string[]>; title?: string; message?: string } };
    const errors = anyErr?.error?.errors;
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0];
      const messages = firstKey ? errors[firstKey] : undefined;
      if (Array.isArray(messages) && messages.length) {
        this.error.set(messages[0]);
        this.saving.set(false);
        return;
      }
    }
    const fallback = anyErr?.error?.title || anyErr?.error?.message || 'Validation failed.';
    this.error.set(fallback);
    this.saving.set(false);
  }
}
