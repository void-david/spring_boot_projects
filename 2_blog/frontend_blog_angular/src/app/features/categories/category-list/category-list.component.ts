import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryResponse } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="page-container">
      <h1 class="page-heading">Categories</h1>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (error()) {
        <app-error-message [message]="error()!" />
      } @else {
        <div class="category-list">
          @for (cat of categories(); track cat.id) {
            <div class="category-item">
              @if (editingId() === cat.id) {
                <form [formGroup]="editForm" (ngSubmit)="saveEdit(cat.id)" class="inline-form">
                  <input formControlName="name" type="text" class="inline-input"
                         [class.invalid]="editFieldError('name')" />
                  @if (editFieldError('name')) {
                    <span class="field-error-inline">{{ editFieldError('name') }}</span>
                  }
                  <div class="inline-actions">
                    <button type="submit" class="btn-save">Save</button>
                    <button type="button" (click)="cancelEdit()" class="btn-cancel">Cancel</button>
                  </div>
                </form>
              } @else {
                <span class="category-name">{{ cat.name }}</span>
                <div class="category-actions">
                  <button (click)="startEdit(cat)" class="btn-edit">Edit</button>
                  <button (click)="deleteCategory(cat.id)" class="btn-delete">Delete</button>
                </div>
              }
            </div>
          } @empty {
            <p class="empty-state">No categories yet.</p>
          }
        </div>

        <div class="create-section">
          <h2 class="create-heading">New Category</h2>
          <form [formGroup]="createForm" (ngSubmit)="createCategory()" class="create-form">
            <div class="form-field">
              <label for="cat-name">Name</label>
              <input id="cat-name" formControlName="name" type="text" [class.invalid]="createFieldError('name')" />
              @if (createFieldError('name')) {
                <span class="field-error">{{ createFieldError('name') }}</span>
              }
            </div>
            @if (createError()) {
              <p class="submit-error">{{ createError() }}</p>
            }
            <button type="submit" [disabled]="creating()" class="btn-primary">
              {{ creating() ? 'Creating…' : 'Create Category' }}
            </button>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 720px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }
    .page-heading {
      font-family: 'Lora', serif;
      font-size: 2rem;
      color: #1A1A1A;
      margin: 0 0 2rem 0;
    }
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 3rem;
    }
    .category-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.875rem 1rem;
      background: white;
      border: 1px solid #E0DDD8;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      min-height: 52px;
    }
    .category-name {
      font-family: 'Inter', sans-serif;
      font-size: 0.95rem;
      color: #1A1A1A;
    }
    .category-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
    .inline-form {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      flex-wrap: wrap;
    }
    .inline-input {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      padding: 0.4rem 0.65rem;
      border: 1px solid #E0DDD8;
      border-radius: 4px;
      color: #1A1A1A;
      background: white;
      outline: none;
      flex: 1;
      min-width: 150px;
      transition: border-color 0.15s;
    }
    .inline-input:focus { border-color: #C76F4A; }
    .inline-input.invalid { border-color: #B85C5C; }
    .field-error-inline {
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem;
      color: #B85C5C;
    }
    .inline-actions { display: flex; gap: 0.5rem; }
    .btn-save {
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      padding: 0.35rem 0.75rem;
      background: #C76F4A;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-save:hover { background: #b5633f; }
    .btn-cancel {
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      padding: 0.35rem 0.75rem;
      background: none;
      color: #666;
      border: 1px solid #E0DDD8;
      border-radius: 4px;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .btn-cancel:hover { border-color: #999; color: #1A1A1A; }
    .btn-edit {
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      padding: 0.3rem 0.7rem;
      background: none;
      color: #C76F4A;
      border: 1px solid #C76F4A;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .btn-edit:hover { background: #C76F4A; color: white; }
    .btn-delete {
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      padding: 0.3rem 0.7rem;
      background: none;
      color: #B85C5C;
      border: 1px solid #B85C5C;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .btn-delete:hover { background: #B85C5C; color: white; }
    .create-section {
      border-top: 1px solid #E0DDD8;
      padding-top: 2rem;
    }
    .create-heading {
      font-family: 'Inter', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1A1A1A;
      margin: 0 0 1.25rem 0;
    }
    .create-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    label {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      color: #1A1A1A;
    }
    input {
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      padding: 0.65rem 0.75rem;
      border: 1px solid #E0DDD8;
      border-radius: 4px;
      color: #1A1A1A;
      background: white;
      outline: none;
      max-width: 400px;
      transition: border-color 0.15s;
    }
    input:focus { border-color: #C76F4A; }
    input.invalid { border-color: #B85C5C; }
    .field-error {
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      color: #B85C5C;
    }
    .submit-error {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      color: #B85C5C;
      margin: 0;
    }
    .btn-primary {
      align-self: flex-start;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      padding: 0.65rem 1.75rem;
      background: #C76F4A;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-primary:hover:not(:disabled) { background: #b5633f; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .empty-state {
      font-family: 'Inter', sans-serif;
      color: #888;
      padding: 1rem 0;
      font-size: 0.9rem;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  categories = signal<CategoryResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  editingId = signal<number | null>(null);
  creating = signal(false);
  createError = signal<string | null>(null);
  createServerErrors = signal<Record<string, string>>({});
  editServerErrors = signal<Record<string, string>>({});

  createForm = this.fb.group({ name: ['', Validators.required] });
  editForm = this.fb.group({ name: ['', Validators.required] });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => { this.categories.set(cats); this.loading.set(false); },
      error: () => { this.error.set('Failed to load categories.'); this.loading.set(false); },
    });
  }

  createFieldError(field: string): string | null {
    const srv = this.createServerErrors()[field];
    if (srv) return srv;
    const ctrl = this.createForm.get(field);
    return ctrl?.invalid && ctrl.touched ? 'This field is required.' : null;
  }

  editFieldError(field: string): string | null {
    const srv = this.editServerErrors()[field];
    if (srv) return srv;
    const ctrl = this.editForm.get(field);
    return ctrl?.invalid && ctrl.touched ? 'This field is required.' : null;
  }

  createCategory(): void {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) return;
    this.creating.set(true);
    this.createError.set(null);
    this.createServerErrors.set({});

    this.categoryService.createCategory({ name: this.createForm.value.name! }).subscribe({
      next: () => { this.createForm.reset(); this.creating.set(false); this.load(); },
      error: (err) => {
        this.creating.set(false);
        if (err.status === 400 && err.error) {
          this.createServerErrors.set(err.error);
        } else {
          this.createError.set('Failed to create category.');
        }
      },
    });
  }

  startEdit(cat: CategoryResponse): void {
    this.editingId.set(cat.id);
    this.editServerErrors.set({});
    this.editForm.patchValue({ name: cat.name });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(id: number): void {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;
    this.editServerErrors.set({});
    this.categoryService.updateCategory(id, { name: this.editForm.value.name! }).subscribe({
      next: () => { this.editingId.set(null); this.load(); },
      error: (err) => {
        if (err.status === 400 && err.error) {
          this.editServerErrors.set(err.error);
        }
      },
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete this category?')) return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Failed to delete category.'),
    });
  }
}
