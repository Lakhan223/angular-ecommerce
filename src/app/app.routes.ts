import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list.component';
import { ProductDetailComponent } from './components/product-detail.component';
import { CartComponent } from './components/cart.component';
import { CheckoutComponent } from './components/checkout.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AdminProductsComponent } from './components/admin/admin-products.component';
import { AdminCategoriesComponent } from './components/admin/admin-categories.component';
import { AdminBrandsComponent } from './components/admin/admin-brands.component';
import { AdminCouponsComponent } from './components/admin/admin-coupons.component';
import { AdminUsersComponent } from './components/admin/admin-users.component';
import { AdminOrdersComponent } from './components/admin/admin-orders.component';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { ForgotPasswordComponent } from './components/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password.component';
import { ChangePasswordComponent } from './components/change-password.component';
import { OrdersComponent } from './components/orders.component';
import { WishlistComponent } from './components/wishlist.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [adminGuard] },
  { path: 'admin/categories', component: AdminCategoriesComponent, canActivate: [adminGuard] },
  { path: 'admin/brands', component: AdminBrandsComponent, canActivate: [adminGuard] },
  { path: 'admin/coupons', component: AdminCouponsComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [adminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
