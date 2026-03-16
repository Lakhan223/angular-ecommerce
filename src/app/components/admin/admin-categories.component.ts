import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminNavComponent } from './admin-nav.component';
import { AdminService, Category } from '../../services/admin.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  templateUrl: './admin-categories.component.html'
})
export class AdminCategoriesComponent {
  categories = signal<Category[]>([]);
  error = signal<string | null>(null);
  form: Category = { id: '', name: '', slug: '' };
  isEdit = false;

  constructor(private readonly admin: AdminService) {
    this.load();
  }

  load(): void {
    this.admin.getCategories().subscribe((res) => this.categories.set(res));
  }

  edit(category: Category): void {
    this.form = { ...category };
    this.isEdit = true;
  }

  reset(): void {
    this.form = { id: '', name: '', slug: '' };
    this.isEdit = false;
  }

  save(): void {
    if (!this.form.name) {
      return;
    }
    if (!this.form.slug) {
      this.form.slug = this.slugify(this.form.name);
    }
    if (this.isEdit && this.form.id) {
      this.admin.updateCategory(this.form.id, this.form).subscribe(() => {
        this.load();
        this.reset();
      });
      return;
    }

    this.admin.createCategory(this.form).subscribe(() => {
      this.load();
      this.reset();
    });
  }

  remove(id: string): void {
    this.error.set(null);
    this.admin.deleteCategory(id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => {
        const message = typeof err.error === 'string' ? err.error : err.error?.message;
        this.error.set(message || 'Unable to delete category.');
      }
    });
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
