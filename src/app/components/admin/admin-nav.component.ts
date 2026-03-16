import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="d-flex flex-wrap gap-2 mb-4">
      <a class="btn btn-outline-dark" routerLink="/admin" routerLinkActive="active">Dashboard</a>
      <a class="btn btn-outline-dark" routerLink="/admin/products" routerLinkActive="active">Products</a>
      <a class="btn btn-outline-dark" routerLink="/admin/categories" routerLinkActive="active">Categories</a>
      <a class="btn btn-outline-dark" routerLink="/admin/brands" routerLinkActive="active">Brands</a>
      <a class="btn btn-outline-dark" routerLink="/admin/coupons" routerLinkActive="active">Coupons</a>
      <a class="btn btn-outline-dark" routerLink="/admin/orders" routerLinkActive="active">Orders</a>
      <a class="btn btn-outline-dark" routerLink="/admin/users" routerLinkActive="active">Users</a>
    </div>
  `
})
export class AdminNavComponent {}
