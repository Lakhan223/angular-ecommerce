import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from './admin-nav.component';
import { AdminService, AdminOrder } from '../../services/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-orders.component.html'
})
export class AdminOrdersComponent {
  orders = signal<AdminOrder[]>([]);
  statuses = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Processing' },
    { value: 2, label: 'Shipped' },
    { value: 3, label: 'Delivered' },
    { value: 4, label: 'Cancelled' },
    { value: 5, label: 'Refunded' }
  ];

  constructor(private readonly admin: AdminService) {
    this.load();
  }

  load(): void {
    this.admin.getOrders().subscribe((res) => this.orders.set(res));
  }

  updateStatus(order: AdminOrder, status: number): void {
    console.log(`Updating order ${order.id} to status ${status}`);
    this.admin.updateOrderStatus(order.id, status).subscribe(() => this.load());
  }
}
