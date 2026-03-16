import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from './admin-nav.component';
import { AdminService, AdminUser, AdminCreateUserRequest } from '../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent {
  users = signal<AdminUser[]>([]);
  roles = ['Admin', 'Customer'];
  newUser: AdminCreateUserRequest = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Customer'
  };
  resetPasswords: Record<string, string> = {};

  constructor(private readonly admin: AdminService) {
    this.load();
  }

  load(): void {
    this.admin.getUsers().subscribe((res) => this.users.set(res));
  }

  createUser(): void {
    this.admin.createUser(this.newUser).subscribe(() => {
      this.newUser = { email: '', password: '', firstName: '', lastName: '', role: 'Customer' };
      this.load();
    });
  }

  changeRole(user: AdminUser, role: string): void {
    this.admin.updateUserRole(user.id, role).subscribe(() => this.load());
  }

  resetPassword(user: AdminUser): void {
    const newPassword = this.resetPasswords[user.id];
    if (!newPassword) {
      return;
    }
    this.admin.resetPassword(user.id, newPassword).subscribe(() => {
      this.resetPasswords[user.id] = '';
    });
  }

  remove(id: string): void {
    this.admin.deleteUser(id).subscribe(() => this.load());
  }
}
