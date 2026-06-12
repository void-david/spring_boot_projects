import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { TagService } from '../../../core/services/tag.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CategoryResponse } from '../../../core/models/category.model';
import { TagResponse } from '../../../core/models/tag.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';

const PALETTE = [
  { bg: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: 'rgba(124,58,237,0.28)', sel: 'rgba(124,58,237,0.28)' },
  { bg: 'rgba(220,64,200,0.12)', color: '#F0A0E8', border: 'rgba(220,64,200,0.28)', sel: 'rgba(220,64,200,0.28)' },
  { bg: 'rgba(0,200,255,0.12)',  color: '#7AE0FF', border: 'rgba(0,200,255,0.28)',  sel: 'rgba(0,200,255,0.28)'  },
  { bg: 'rgba(0,210,130,0.12)', color: '#5AEFB8', border: 'rgba(0,210,130,0.28)',  sel: 'rgba(0,210,130,0.28)'  },
  { bg: 'rgba(255,180,0,0.12)',  color: '#FFD060', border: 'rgba(255,180,0,0.28)',  sel: 'rgba(255,180,0,0.28)'  },
  { bg: 'rgba(255,68,102,0.12)', color: '#FF8899', border: 'rgba(255,68,102,0.28)', sel: 'rgba(255,68,102,0.28)' },
];

function tagPillStyle(color: string | null, idx: number) {
  if (color) {
    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(5,7), 16);
    return { bg: `rgba(${r},${g},${b},0.12)`, color, border: `rgba(${r},${g},${b},0.35)` };
  }
  return PALETTE[idx % PALETTE.length];
}

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SkeletonComponent],
  template: `
    <div class="page animate-in">
      <a routerLink="/posts" class="back-link">← Back</a>

      <div class="form-card">
        <!-- Card header with gradient top bar -->
        <div class="card-topbar"></div>
        <div class="card-body">
          <h1 class="form-title">{{ isEdit ? 'Edit Post' : 'New Post' }}</h1>

          @if (loadingPost()) {
            <div style="display:flex;flex-direction:column;gap:1.25rem;margin-top:1.5rem;">
              <app-skeleton height="54px" radius="10px" />
              <app-skeleton height="260px" radius="10px" />
              <app-skeleton height="54px" radius="10px" />
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form" novalidate>

              <!-- Title -->
              <div class="field">
                <div class="field-label-row">
                  <label for="pf-title">Title</label>
                  <span class="char-count" [class.warn]="titleLen() > 180">{{ titleLen() }}/200</span>
                </div>
                <input id="pf-title" formControlName="title" type="text" maxlength="200"
                       placeholder="An interesting title..."
                       [class.invalid]="fieldErr('title')" />
                @if (fieldErr('title')) {
                  <span class="field-err">{{ fieldErr('title') }}</span>
                }
              </div>

              <!-- Excerpt -->
              <div class="field">
                <div class="field-label-row">
                  <label for="pf-excerpt">Excerpt <span class="field-optional">(optional)</span></label>
                  <span class="char-count" [class.warn]="excerptLen() > 450">{{ excerptLen() }}/500</span>
                </div>
                <textarea id="pf-excerpt" formControlName="excerpt" rows="3" maxlength="500"
                          placeholder="A short summary shown in post listings..."
                          [class.invalid]="fieldErr('excerpt')"></textarea>
                @if (fieldErr('excerpt')) {
                  <span class="field-err">{{ fieldErr('excerpt') }}</span>
                }
              </div>

              <!-- Cover image URL -->
              <div class="field">
                <label for="pf-cover">Cover image URL <span class="field-optional">(optional)</span></label>
                <input id="pf-cover" formControlName="coverImageUrl" type="url"
                       placeholder="https://images.unsplash.com/..." />
              </div>

              <!-- Content -->
              <div class="field">
                <label for="pf-content">Content</label>
                <textarea id="pf-content" formControlName="content" rows="16"
                          placeholder="Write something extraordinary..."
                          [class.invalid]="fieldErr('content')"></textarea>
                @if (fieldErr('content')) {
                  <span class="field-err">{{ fieldErr('content') }}</span>
                }
              </div>

              <!-- Status toggle -->
              <div class="field">
                <label>Status</label>
                <div class="status-toggle">
                  <button type="button" class="toggle-opt"
                          [class.selected]="form.value.status === 'PUBLISHED'"
                          (click)="form.patchValue({status: 'PUBLISHED'})">Published</button>
                  <button type="button" class="toggle-opt"
                          [class.selected]="form.value.status === 'DRAFT'"
                          (click)="form.patchValue({status: 'DRAFT'})">Draft</button>
                </div>
              </div>

              <!-- Featured toggle -->
              <div class="field">
                <label class="switch-label" (click)="toggleFeatured()">
                  <div class="switch-track" [class.on]="form.value.featured">
                    <div class="switch-thumb"></div>
                  </div>
                  <span class="switch-text">Featured post</span>
                </label>
              </div>

              <!-- Category chips -->
              <div class="field">
                <label>Category <span class="field-optional">(optional)</span></label>
                <div class="cat-chips">
                  <button type="button" class="cat-chip"
                          [class.cat-chip--selected]="!form.value.categoryId"
                          (click)="pickCategory(null)">
                    None
                  </button>
                  @for (cat of categories(); track cat.id) {
                    <button type="button" class="cat-chip"
                            [class.cat-chip--selected]="form.value.categoryId === cat.id"
                            [style.--cat-c]="catStyle(cat.id).color"
                            [style.--cat-b]="catStyle(cat.id).border"
                            [style.--cat-bg]="catStyle(cat.id).bg"
                            (click)="pickCategory(cat.id)">
                      {{ cat.name }}
                    </button>
                  }
                </div>
              </div>

              <!-- Tags multi-select -->
              <div class="field">
                <label>Tags <span class="field-optional">(optional, multiple)</span></label>
                <div class="tag-chips">
                  @for (tag of allTags(); track tag.id; let i = $index) {
                    <button type="button" class="tag-chip"
                            [class.tag-chip--selected]="selectedTagIds().has(tag.id)"
                            [style.--tc]="getTagStyle(tag.color, i).color"
                            [style.--tb]="getTagStyle(tag.color, i).border"
                            [style.--tbg]="getTagStyle(tag.color, i).bg"
                            (click)="toggleTag(tag.id)">
                      {{ tag.name }}
                    </button>
                  }
                </div>
              </div>

              @if (submitErr()) {
                <p class="submit-err">⚡ {{ submitErr() }}</p>
              }

              <div class="form-actions">
                <a routerLink="/posts" class="btn-cancel">Cancel</a>
                <button type="submit" [disabled]="submitting()" class="btn-submit">
                  @if (submitting()) {
                    <span class="spinner"></span> Saving…
                  } @else {
                    {{ isEdit ? 'Save changes' : (form.value.status === 'DRAFT' ? 'Save draft' : 'Publish post') }}
                  }
                </button>
              </div>

            </form>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 3rem 2rem 6rem;
    }
    .animate-in {
      animation: fadeUp 0.4s cubic-bezier(0.4,0,0.2,1) both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .back-link {
      display: inline-block;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.875rem;
      color: var(--text-2);
      text-decoration: none;
      margin-bottom: 2rem;
      transition: color 0.15s;
    }
    .back-link:hover { color: #A78BFA; }

    /* Form card */
    .form-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      overflow: hidden;
    }
    .card-topbar {
      height: 4px;
      background: var(--gradient);
    }
    .card-body {
      padding: 2.5rem 2.75rem;
    }
    .form-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
      margin-bottom: 2rem;
    }

    /* Form layout */
    .form {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .field-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    label {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-2);
      cursor: default;
    }
    .field-optional {
      font-size: 0.7rem;
      font-weight: 400;
      letter-spacing: 0;
      text-transform: none;
      color: var(--text-3);
    }
    .char-count {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: var(--text-3);
    }
    .char-count.warn { color: #FFD060; }

    input, textarea {
      font-family: 'DM Sans', sans-serif;
      font-size: 1rem;
      padding: 0.85rem 1rem;
      background: var(--surface-2);
      border: 1px solid var(--border-2);
      border-radius: 10px;
      color: var(--text);
      outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
      resize: vertical;
    }
    input::placeholder, textarea::placeholder { color: var(--text-3); }
    input:focus, textarea:focus {
      border-color: rgba(124,58,237,0.55);
      box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
    }
    input.invalid, textarea.invalid {
      border-color: rgba(255,68,102,0.45);
    }
    input.invalid:focus, textarea.invalid:focus {
      box-shadow: 0 0 0 3px rgba(255,68,102,0.1);
    }
    .field-err {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.8rem;
      color: #FF8899;
    }

    /* Status toggle */
    .status-toggle {
      display: inline-flex;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 0.2rem;
      gap: 0;
    }
    .toggle-opt {
      font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem; font-weight: 500;
      padding: 0.4rem 1.1rem;
      background: none; border: none; color: var(--text-2);
      border-radius: 999px; cursor: pointer; transition: all 0.18s;
    }
    .toggle-opt.selected {
      background: var(--gradient); color: #fff;
    }

    /* Switch toggle */
    .switch-label {
      display: inline-flex; align-items: center; gap: 0.75rem; cursor: pointer;
    }
    .switch-track {
      width: 42px; height: 24px; background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12); border-radius: 999px;
      position: relative; transition: background 0.2s, border-color 0.2s; flex-shrink: 0;
    }
    .switch-track.on { background: rgba(124,58,237,0.4); border-color: rgba(124,58,237,0.6); }
    .switch-thumb {
      width: 18px; height: 18px; background: #fff; border-radius: 50%;
      position: absolute; top: 2px; left: 2px; transition: transform 0.2s;
    }
    .switch-track.on .switch-thumb { transform: translateX(18px); }
    .switch-text { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: var(--text-2); }

    /* Category chips */
    .cat-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .cat-chip {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 400;
      padding: 0.42rem 1rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      color: var(--text-2);
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.18s;
    }
    .cat-chip:hover {
      background: rgba(255,255,255,0.08);
      color: var(--text);
    }
    .cat-chip--selected {
      background: var(--cat-bg, rgba(124,58,237,0.12)) !important;
      border-color: var(--cat-b, rgba(124,58,237,0.4)) !important;
      color: var(--cat-c, #A78BFA) !important;
    }

    /* Tag chips */
    .tag-chips {
      display: flex; gap: 0.5rem; flex-wrap: wrap;
    }
    .tag-chip {
      font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 400;
      padding: 0.38rem 0.9rem;
      background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: var(--text-2);
      border-radius: 999px; cursor: pointer; transition: all 0.18s;
    }
    .tag-chip:hover { background: rgba(255,255,255,0.08); color: var(--text); }
    .tag-chip--selected {
      background: var(--tbg, rgba(124,58,237,0.12)) !important;
      border-color: var(--tb, rgba(124,58,237,0.4)) !important;
      color: var(--tc, #A78BFA) !important;
    }

    .submit-err {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.875rem;
      color: #FF8899;
      margin: 0;
    }

    /* Actions */
    .form-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      padding-top: 0.5rem;
    }
    .btn-submit {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 0.7rem 1.75rem;
      background: var(--gradient);
      color: #fff;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      transition: opacity 0.18s, transform 0.18s;
    }
    .btn-submit:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.7rem 1.5rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      color: var(--text-2);
      border-radius: 999px;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .btn-cancel:hover { background: rgba(255,255,255,0.08); color: var(--text); }

    /* Spinner */
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class PostFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postSvc = inject(PostService);
  private catSvc = inject(CategoryService);
  private tagSvc = inject(TagService);
  private toast = inject(ToastService);

  categories = signal<CategoryResponse[]>([]);
  allTags = signal<TagResponse[]>([]);
  selectedTagIds = signal<Set<number>>(new Set());
  loadingPost = signal(false);
  submitting = signal(false);
  submitErr = signal<string | null>(null);
  serverErrors = signal<Record<string, string>>({});

  isEdit = false;
  private postId: number | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    content: ['', Validators.required],
    excerpt: ['', Validators.maxLength(500)],
    coverImageUrl: [''],
    categoryId: [null as number | null],
    status: ['PUBLISHED' as 'PUBLISHED' | 'DRAFT'],
    featured: [false],
  });

  titleLen = computed(() => (this.form.value.title ?? '').length);
  excerptLen = computed(() => (this.form.value.excerpt ?? '').length);

  catStyle(id: number) { return PALETTE[id % PALETTE.length]; }
  getTagStyle(color: string | null, idx: number) { return tagPillStyle(color, idx); }

  pickCategory(id: number | null): void {
    this.form.patchValue({ categoryId: id });
  }

  toggleTag(id: number): void {
    this.selectedTagIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  toggleFeatured(): void {
    this.form.patchValue({ featured: !this.form.value.featured });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.postId = idParam ? Number(idParam) : null;
    this.isEdit = !!this.postId;

    this.catSvc.getAllCategories().subscribe({ next: cats => this.categories.set(cats) });
    this.tagSvc.getAllTags().subscribe({ next: tags => this.allTags.set(tags) });

    if (this.isEdit && this.postId) {
      this.loadingPost.set(true);
      this.postSvc.getPostById(this.postId).subscribe({
        next: p => {
          this.form.patchValue({
            title: p.title,
            content: p.content,
            excerpt: p.excerpt ?? '',
            coverImageUrl: p.coverImageUrl ?? '',
            categoryId: p.category?.id ?? null,
            status: p.status,
            featured: p.featured,
          });
          this.selectedTagIds.set(new Set(p.tags.map(t => t.id)));
          this.loadingPost.set(false);
        },
        error: () => {
          this.toast.show('Could not load post.', 'error');
          this.loadingPost.set(false);
        },
      });
    }
  }

  fieldErr(field: string): string | null {
    const srv = this.serverErrors()[field];
    if (srv) return srv;
    const ctrl = this.form.get(field);
    if (!ctrl?.invalid || !ctrl.touched) return null;
    if (ctrl.errors?.['required']) return 'This field is required.';
    if (ctrl.errors?.['maxlength']) return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters.`;
    return 'Invalid value.';
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.submitErr.set(null);
    this.serverErrors.set({});

    const { title, content, excerpt, coverImageUrl, categoryId, status, featured } = this.form.value;
    const payload = {
      title: title!,
      content: content!,
      excerpt: excerpt || null,
      coverImageUrl: coverImageUrl || null,
      categoryId: categoryId ?? null,
      tagIds: [...this.selectedTagIds()],
      status: (status ?? 'PUBLISHED') as 'PUBLISHED' | 'DRAFT',
      featured: featured ?? false,
    };

    const obs = this.isEdit && this.postId
      ? this.postSvc.updatePost(this.postId, payload)
      : this.postSvc.createPost(payload);

    obs.subscribe({
      next: p => {
        this.submitting.set(false);
        this.toast.show(this.isEdit ? 'Post updated.' : 'Post published!');
        this.router.navigate(['/posts', p.id]);
      },
      error: err => {
        this.submitting.set(false);
        if (err.status === 400 && err.error) {
          this.serverErrors.set(err.error);
        } else {
          this.submitErr.set('Failed to save. Please try again.');
        }
      },
    });
  }
}
