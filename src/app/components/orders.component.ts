import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html'
})
export class OrdersComponent {
  orders = signal<Order[]>([]);
  loading = signal(true);

  constructor(private readonly ordersService: OrderService) {
    this.ordersService.getOrders().subscribe((res) => {
      this.orders.set(res);
      this.loading.set(false);
    });
  }
}
