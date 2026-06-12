import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryResponse } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <h1 class="form-heading">{{ isEdit ? 'Edit Post' : 'New Post' }}</h1>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="post-form">
          <div class="form-field">
            <label for="pf-title">Title</label>
            <input id="pf-title" formControlName="title" type="text" [class.invalid]="fieldError('title')" />
            @if (fieldError('title')) {
              <span class="field-error">{{ fieldError('title') }}</span>
            }
          </div>

          <div class="form-field">
            <label for="pf-content">Content</label>
            <textarea id="pf-content" formControlName="content" rows="14" [class.invalid]="fieldError('content')"></textarea>
            @if (fieldError('content')) {
              <span class="field-error">{{ fieldError('content') }}</span>
            }
          </div>

          <div class="form-field">
            <label for="pf-category">Category</label>
            <select id="pf-category" formControlName="categoryId" [class.invalid]="fieldError('categoryId')">
              <option value="">Select a category</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
            @if (fieldError('categoryId')) {
              <span class="field-error">{{ fieldError('categoryId') }}</span>
            }
          </div>

          @if (submitError()) {
            <p class="submit-error">{{ submitError() }}</p>
          }

          <div class="form-actions">
            <a routerLink="/posts" class="btn-cancel">Cancel</a>
            <button type="submit" [disabled]="submitting()" class="btn-primary">
              {{ submitting() ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Post') }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 720px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }
    .form-heading {
      font-family: 'Lora', serif;
      font-size: 2rem;
      color: #1A1A1A;
      margin: 0 0 2rem 0;
    }
    .post-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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
    input, textarea, select {
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      padding: 0.65rem 0.75rem;
      border: 1px solid #E0DDD8;
      border-radius: 4px;
      color: #1A1A1A;
      background: white;
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus, textarea:focus, select:focus { border-color: #C76F4A; }
    input.invalid, textarea.invalid, select.invalid { border-color: #B85C5C; }
    textarea { resize: vertical; }
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
    .form-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      padding-top: 0.5rem;
    }
    .btn-primary {
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
    .btn-cancel {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      padding: 0.65rem 1.5rem;
      background: none;
      color: #666;
      border: 1px solid #E0DDD8;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      transition: border-color 0.15s, color 0.15s;
    }
    .btn-cancel:hover { border-color: #999; color: #1A1A1A; }
  `]
})
export class PostFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);

  categories = signal<CategoryResponse[]>([]);
  loading = signal(false);
  submitting = signal(false);
  submitError = signal<string | null>(null);
  serverErrors = signal<Record<string, string>>({});

  isEdit = false;
  private postId: number | null = null;

  form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    categoryId: ['', Validators.required],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.postId = idParam ? Number(idParam) : null;
    this.isEdit = !!this.postId;

    this.categoryService.getAllCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });

    if (this.isEdit && this.postId) {
      this.loading.set(true);
      this.postService.getPostById(this.postId).subscribe({
        next: (post) => {
          this.form.patchValue({
            title: post.title,
            content: post.content,
            categoryId: String(post.category?.id ?? ''),
          });
          this.loading.set(false);
        },
        error: () => {
          this.submitError.set('Failed to load post.');
          this.loading.set(false);
        },
      });
    }
  }

  fieldError(field: string): string | null {
    const srv = this.serverErrors()[field];
    if (srv) return srv;
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl.touched ? 'This field is required.' : null;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.submitError.set(null);
    this.serverErrors.set({});

    const { title, content, categoryId } = this.form.value;
    const payload = { title: title!, content: content!, categoryId: Number(categoryId), tagIds: [] as number[] };

    const obs = this.isEdit && this.postId
      ? this.postService.updatePost(this.postId, payload)
      : this.postService.createPost(payload);

    obs.subscribe({
      next: (post) => { this.submitting.set(false); this.router.navigate(['/posts', post.id]); },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 400 && err.error) {
          this.serverErrors.set(err.error);
        } else {
          this.submitError.set('Failed to save post. Please try again.');
        }
      },
    });
  }
}
