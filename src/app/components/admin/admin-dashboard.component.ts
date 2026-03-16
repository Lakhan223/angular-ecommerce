import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminDashboard } from '../../services/admin.service';
import { AdminNavComponent } from './admin-nav.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminNavComponent],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  dashboard = signal<AdminDashboard | null>(null);

  constructor(private readonly admin: AdminService) {
    this.admin.getDashboard().subscribe((res) => this.dashboard.set(res));
  }
}
