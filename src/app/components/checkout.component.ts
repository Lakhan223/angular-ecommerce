import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { CouponService } from '../services/coupon.service';
import { CouponPublic } from '../models/coupon.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent {
  items = this.cart.items;
  total = this.cart.total;
  couponDiscount = signal(0);
  couponMessage = signal<string | null>(null);
  couponCode = '';
  appliedCouponCode = '';
  availableCoupons = signal<CouponPublic[]>([]);
  grandTotal = computed(() => Math.max(0, this.total() - this.couponDiscount()));

  form = this.fb.nonNullable.group({
    shipping: this.fb.nonNullable.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['India', Validators.required]
    }),
    billing: this.fb.nonNullable.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['India', Validators.required]
    }),
    paymentProvider: ['Stripe', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly cart: CartService,
    private readonly orders: OrderService,
    private readonly coupons: CouponService,
    private readonly router: Router
  ) {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.coupons.getActive().subscribe((res) => this.availableCoupons.set(res));
  }

  applyCoupon(): void {
    const code = this.couponCode.trim();
    if (!code) {
      this.couponMessage.set('Enter a coupon code.');
      this.couponDiscount.set(0);
      this.appliedCouponCode = '';
      return;
    }

    this.coupons.validate(code, this.total()).subscribe((res) => {
      this.couponMessage.set(res.message);
      if (res.isValid) {
        this.couponDiscount.set(res.discount);
        this.appliedCouponCode = res.coupon?.code ?? code;
      } else {
        this.couponDiscount.set(0);
        this.appliedCouponCode = '';
      }
    });
  }

  useCoupon(code: string): void {
    this.couponCode = code;
    this.applyCoupon();
  }

  placeOrder(): void {
    if (this.form.invalid || this.items().length === 0) {
      return;
    }

    const payload = {
      shippingAddress: this.form.getRawValue().shipping,
      billingAddress: this.form.getRawValue().billing,
      items: this.items().map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size ?? null
      })),
      paymentProvider: this.form.getRawValue().paymentProvider || 'Stripe',
      couponCode: this.appliedCouponCode || null
    };

    this.orders.placeOrder(payload).subscribe(() => {
      this.cart.clear();
      this.router.navigate(['/orders']);
    });
  }
}
