import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { TagService } from '../../../core/services/tag.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CategoryResponse } from '../../../core/models/category.model';
import { TagResponse } from '../../../core/models/tag.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

const PALETTE = [
  { grad: 'linear-gradient(135deg,rgba(124,58,237,0.25) 0%,rgba(124,58,237,0.05) 100%)', accent: '#A78BFA', glow: 'rgba(124,58,237,0.35)' },
  { grad: 'linear-gradient(135deg,rgba(220,64,200,0.25) 0%,rgba(220,64,200,0.05) 100%)', accent: '#F0A0E8', glow: 'rgba(220,64,200,0.35)' },
  { grad: 'linear-gradient(135deg,rgba(0,200,255,0.25) 0%,rgba(0,200,255,0.05) 100%)',  accent: '#7AE0FF', glow: 'rgba(0,200,255,0.35)'  },
  { grad: 'linear-gradient(135deg,rgba(0,210,130,0.25) 0%,rgba(0,210,130,0.05) 100%)', accent: '#5AEFB8', glow: 'rgba(0,210,130,0.35)'  },
  { grad: 'linear-gradient(135deg,rgba(255,180,0,0.25) 0%,rgba(255,180,0,0.05) 100%)',  accent: '#FFD060', glow: 'rgba(255,180,0,0.35)'  },
  { grad: 'linear-gradient(135deg,rgba(255,68,102,0.25) 0%,rgba(255,68,102,0.05) 100%)',accent: '#FF8899', glow: 'rgba(255,68,102,0.35)' },
];

function tagColorStyle(color: string | null, idx: number) {
  if (color) {
    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(5,7), 16);
    return {
      bg: `rgba(${r},${g},${b},0.12)`,
      border: `rgba(${r},${g},${b},0.35)`,
      color,
    };
  }
  const p = PALETTE[idx % PALETTE.length];
  return { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', color: p.accent };
}

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SkeletonComponent, ErrorMessageComponent],
  template: `
    <div class="page animate-in">
      <!-- Header -->
      <div class="page-head">
        <div>
          <p class="eyebrow">Browse by</p>
          <h1 class="page-title">Topics</h1>
        </div>
        @if (auth.isAdmin()) {
          <button class="btn-add" (click)="toggleCreate()" [class.btn-add--open]="showCreate()">
            <span class="btn-add-icon">{{ showCreate() ? '×' : '+' }}</span>
            <span>{{ showCreate() ? 'Cancel' : 'New Topic' }}</span>
          </button>
        }
      </div>

      <!-- Create form (collapsible) -->
      @if (showCreate() && auth.isAdmin()) {
        <div class="create-card animate-in">
          <form [formGroup]="createForm" (ngSubmit)="createCategory()" class="create-form">
            <div class="field">
              <label for="nc-name">Topic name</label>
              <input id="nc-name" formControlName="name" type="text"
                     placeholder="e.g. Machine Learning" autofocus
                     [class.invalid]="createFieldErr('name')" />
              @if (createFieldErr('name')) {
                <span class="field-err">{{ createFieldErr('name') }}</span>
              }
            </div>
            @if (createErr()) {
              <p class="submit-err">⚡ {{ createErr() }}</p>
            }
            <div class="form-actions">
              <button type="submit" [disabled]="creating()" class="btn-save-new">
                @if (creating()) { <span class="spinner"></span> Creating… }
                @else { Create topic }
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="cat-grid">
          @for (n of [1,2,3,4,5,6]; track n) {
            <div class="skel-cat">
              <app-skeleton height="60px" width="60px" radius="50%" />
              <app-skeleton height="22px" width="80%" />
              <app-skeleton height="14px" width="50%" />
            </div>
          }
        </div>
      }

      @else if (error()) {
        <app-error-message [message]="error()!" />
      }

      @else {
        <div class="cat-grid">
          @for (cat of categories(); track cat.id) {
            <div class="cat-card" [style.background]="palette(cat.id).grad">

              @if (editingId() === cat.id) {
                <!-- Inline edit form -->
                <form [formGroup]="editForm" (ngSubmit)="saveEdit(cat.id)" class="edit-form">
                  <input formControlName="name" type="text" class="edit-input"
                         [class.invalid]="editFieldErr('name')" (keydown.escape)="cancelEdit()" />
                  @if (editFieldErr('name')) {
                    <span class="edit-err">{{ editFieldErr('name') }}</span>
                  }
                  <div class="edit-actions">
                    <button type="submit" class="edit-save">Save</button>
                    <button type="button" class="edit-cancel" (click)="cancelEdit()">Cancel</button>
                  </div>
                </form>
              } @else {
                <!-- Normal view -->
                <div class="cat-letter" [style.color]="palette(cat.id).accent">
                  {{ cat.name.charAt(0).toUpperCase() }}
                </div>
                <div class="cat-info">
                  <h3 class="cat-name" [style.color]="palette(cat.id).accent">{{ cat.name }}</h3>
                  <a [routerLink]="['/posts']" [queryParams]="{}" class="cat-link">View posts →</a>
                </div>
                @if (auth.isAdmin()) {
                  <div class="cat-controls">
                    <button class="ctrl-btn" (click)="startEdit(cat)" title="Edit">✎</button>
                    <button class="ctrl-btn ctrl-btn--del" (click)="deleteCategory(cat.id)" title="Delete">✕</button>
                  </div>
                }
              }

            </div>
          }

          @if (categories().length === 0) {
            <div class="cat-empty">
              <div class="empty-glyph">◈</div>
              <p>No topics yet. Create your first one above.</p>
            </div>
          }
        </div>
      }

      <!-- ─── Tags Section ─── -->
      <div class="section-divider">
        <div class="section-line"></div>
        <span class="section-label">Tags</span>
        <div class="section-line"></div>
      </div>

      <div class="tags-head">
        <h2 class="tags-title">All Tags</h2>
        @if (auth.isAdmin()) {
          <button class="btn-add btn-add-sm" (click)="toggleCreateTag()" [class.btn-add--open]="showCreateTag()">
            <span class="btn-add-icon">{{ showCreateTag() ? '×' : '+' }}</span>
            <span>{{ showCreateTag() ? 'Cancel' : 'New Tag' }}</span>
          </button>
        }
      </div>

      <!-- Create tag form -->
      @if (showCreateTag() && auth.isAdmin()) {
        <div class="create-card animate-in">
          <form [formGroup]="createTagForm" (ngSubmit)="createTag()" class="create-form create-form--tag">
            <div class="field">
              <label for="nt-name">Tag name</label>
              <input id="nt-name" formControlName="name" type="text"
                     placeholder="e.g. TypeScript" autofocus
                     [class.invalid]="createTagFieldErr('name')" />
              @if (createTagFieldErr('name')) {
                <span class="field-err">{{ createTagFieldErr('name') }}</span>
              }
            </div>
            <div class="field">
              <label for="nt-color">Color <span class="opt">(optional)</span></label>
              <div class="color-pick-row">
                <input id="nt-color" formControlName="color" type="color" class="color-input" />
                <span class="color-val">{{ createTagForm.value.color }}</span>
              </div>
            </div>
            @if (createTagErr()) {
              <p class="submit-err">⚡ {{ createTagErr() }}</p>
            }
            <div class="form-actions">
              <button type="submit" [disabled]="creatingTag()" class="btn-save-new">
                @if (creatingTag()) { <span class="spinner"></span> Creating… }
                @else { Create tag }
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Tags grid -->
      @if (tagsLoading()) {
        <div class="tag-cloud">
          @for (n of [1,2,3,4,5,6]; track n) {
            <app-skeleton height="32px" width="80px" radius="999px" />
          }
        </div>
      } @else {
        <div class="tag-cloud">
          @for (tag of allTags(); track tag.id; let i = $index) {
            @if (editingTagId() === tag.id) {
              <!-- Inline tag edit -->
              <form [formGroup]="editTagForm" (ngSubmit)="saveTagEdit(tag.id)" class="tag-edit-form">
                <input formControlName="name" type="text" class="tag-edit-input"
                       (keydown.escape)="cancelTagEdit()" />
                <input formControlName="color" type="color" class="color-input-sm" />
                <button type="submit" class="tag-edit-save">✓</button>
                <button type="button" class="tag-edit-cancel" (click)="cancelTagEdit()">✕</button>
              </form>
            } @else {
              <div class="tag-item"
                   [style.background]="getTagColorStyle(tag.color, i).bg"
                   [style.border-color]="getTagColorStyle(tag.color, i).border"
                   [style.color]="getTagColorStyle(tag.color, i).color">
                <span class="tag-name">{{ tag.name }}</span>
                @if (auth.isAdmin()) {
                  <button class="tag-ctrl" (click)="startTagEdit(tag)" title="Edit">✎</button>
                  <button class="tag-ctrl tag-ctrl--del" (click)="deleteTag(tag.id)" title="Delete">✕</button>
                }
              </div>
            }
          }
          @if (allTags().length === 0 && !tagsLoading()) {
            <p class="no-tags">No tags yet.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem 6rem;
    }
    .animate-in {
      animation: fadeUp 0.45s cubic-bezier(0.4,0,0.2,1) both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .page-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .eyebrow {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-3);
      margin-bottom: 0.4rem;
    }
    .page-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--text);
      line-height: 1.1;
    }
    .btn-add {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.65rem 1.4rem;
      background: var(--gradient);
      color: #fff;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s;
    }
    .btn-add:hover { opacity: 0.85; transform: translateY(-1px); }
    .btn-add--open { background: rgba(255,255,255,0.08); }
    .btn-add--open:hover { opacity: 0.9; background: rgba(255,255,255,0.12); }
    .btn-add-sm { font-size: 0.8rem; padding: 0.5rem 1.1rem; }
    .btn-add-icon {
      font-size: 1rem;
      font-weight: 300;
      line-height: 1;
    }

    /* Create card */
    .create-card {
      background: var(--surface);
      border: 1px solid rgba(124,58,237,0.25);
      border-radius: 16px;
      padding: 1.75rem 2rem;
      margin-bottom: 2rem;
    }
    .create-form { display: flex; flex-direction: column; gap: 1rem; max-width: 480px; }
    .create-form--tag { flex-direction: row; flex-wrap: wrap; align-items: flex-end; max-width: none; }
    .create-form--tag .field { flex: 1; min-width: 160px; }
    .create-form--tag .form-actions { flex-shrink: 0; }
    .field { display: flex; flex-direction: column; gap: 0.45rem; }
    label {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-2);
      cursor: default;
    }
    .opt { font-size: 0.7rem; font-weight: 400; letter-spacing: 0; text-transform: none; color: var(--text-3); }
    input {
      font-family: 'DM Sans', sans-serif;
      font-size: 1rem;
      padding: 0.75rem 1rem;
      background: var(--surface-2);
      border: 1px solid var(--border-2);
      border-radius: 10px;
      color: var(--text);
      outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    input::placeholder { color: var(--text-3); }
    input:focus {
      border-color: rgba(124,58,237,0.55);
      box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
    }
    input.invalid { border-color: rgba(255,68,102,0.45); }
    .field-err, .edit-err {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: #FF8899;
    }
    .submit-err {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      color: #FF8899;
    }
    .form-actions { display: flex; }
    .btn-save-new {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.65rem 1.75rem;
      background: var(--gradient);
      color: #fff;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      transition: opacity 0.18s, transform 0.18s;
    }
    .btn-save-new:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
    .btn-save-new:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Color picker */
    .color-pick-row { display: flex; align-items: center; gap: 0.75rem; }
    .color-input {
      width: 48px; height: 38px; padding: 0.15rem 0.25rem;
      border-radius: 8px; cursor: pointer;
    }
    .color-input-sm { width: 36px; height: 30px; padding: 0.1rem; border-radius: 6px; cursor: pointer; flex-shrink: 0; }
    .color-val { font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: var(--text-2); }

    /* Category grid */
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 3rem;
    }
    .cat-card {
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.07);
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      position: relative;
      transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
      overflow: hidden;
    }
    .cat-card:hover {
      transform: translateY(-4px);
      border-color: rgba(255,255,255,0.14);
      box-shadow: 0 16px 48px rgba(0,0,0,0.4);
    }
    .cat-letter {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1;
      opacity: 0.85;
      letter-spacing: -0.03em;
    }
    .cat-info { flex: 1; }
    .cat-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.15rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      margin-bottom: 0.35rem;
    }
    .cat-link {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.8rem;
      color: var(--text-3);
      text-decoration: none;
      transition: color 0.15s;
    }
    .cat-link:hover { color: var(--text-2); }
    .cat-controls {
      display: flex;
      gap: 0.4rem;
      align-self: flex-end;
    }
    .ctrl-btn {
      font-size: 0.875rem;
      padding: 0.35rem 0.65rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--text-2);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .ctrl-btn:hover { background: rgba(255,255,255,0.1); color: var(--text); }
    .ctrl-btn--del:hover { background: rgba(255,68,102,0.12); border-color: rgba(255,68,102,0.3); color: #FF8899; }

    /* Inline edit */
    .edit-form { display: flex; flex-direction: column; gap: 0.6rem; }
    .edit-input {
      font-family: 'DM Sans', sans-serif;
      font-size: 1rem;
      padding: 0.6rem 0.875rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      color: var(--text);
      outline: none;
    }
    .edit-input:focus { border-color: rgba(124,58,237,0.6); }
    .edit-actions { display: flex; gap: 0.5rem; }
    .edit-save {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.4rem 1rem;
      background: var(--gradient);
      border: none;
      color: #fff;
      border-radius: 999px;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .edit-save:hover { opacity: 0.85; }
    .edit-cancel {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.8rem;
      padding: 0.4rem 0.875rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-2);
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .edit-cancel:hover { background: rgba(255,255,255,0.1); }

    /* Skeleton cards */
    .skel-cat {
      border-radius: 18px;
      border: 1px solid var(--border);
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
      background: var(--surface);
    }

    /* Empty */
    .cat-empty {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 4rem 2rem;
      color: var(--text-3);
      font-family: 'DM Sans', sans-serif;
    }
    .empty-glyph {
      font-size: 2.5rem;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Section divider */
    .section-divider {
      display: flex; align-items: center; gap: 1rem; margin: 3rem 0 2rem;
    }
    .section-line { flex: 1; height: 1px; background: var(--border); }
    .section-label {
      font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-3);
    }

    /* Tags section */
    .tags-head {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .tags-title {
      font-family: 'Space Grotesk', sans-serif; font-size: 1.3rem; font-weight: 700;
      letter-spacing: -0.02em; color: var(--text);
    }

    /* Tag cloud */
    .tag-cloud {
      display: flex; flex-wrap: wrap; gap: 0.6rem;
    }
    .tag-item {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.35rem 0.85rem; border: 1px solid; border-radius: 999px;
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500;
      transition: opacity 0.15s;
    }
    .tag-name {}
    .tag-ctrl {
      background: none; border: none; cursor: pointer; color: inherit; opacity: 0.5;
      font-size: 0.75rem; padding: 0; line-height: 1; transition: opacity 0.15s;
    }
    .tag-ctrl:hover { opacity: 1; }
    .tag-ctrl--del:hover { color: #FF8899; }

    /* Tag inline edit */
    .tag-edit-form {
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: var(--surface); border: 1px solid rgba(124,58,237,0.3);
      border-radius: 999px; padding: 0.25rem 0.5rem;
    }
    .tag-edit-input {
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
      padding: 0.2rem 0.5rem; border-radius: 999px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      color: var(--text); outline: none; width: 120px;
    }
    .tag-edit-save, .tag-edit-cancel {
      background: none; border: none; cursor: pointer; font-size: 0.875rem;
      padding: 0.2rem 0.3rem; border-radius: 4px; transition: background 0.15s;
    }
    .tag-edit-save { color: #5AEFB8; }
    .tag-edit-save:hover { background: rgba(0,210,130,0.12); }
    .tag-edit-cancel { color: #FF8899; }
    .tag-edit-cancel:hover { background: rgba(255,68,102,0.12); }
    .no-tags { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: var(--text-3); }

    /* Spinner */
    .spinner {
      display: inline-block;
      width: 13px;
      height: 13px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CategoryListComponent implements OnInit {
  private catSvc = inject(CategoryService);
  private tagSvc = inject(TagService);
  auth = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  categories = signal<CategoryResponse[]>([]);
  allTags = signal<TagResponse[]>([]);
  loading = signal(false);
  tagsLoading = signal(false);
  error = signal<string | null>(null);

  // Category create
  showCreate = signal(false);
  creating = signal(false);
  createErr = signal<string | null>(null);
  createServerErrors = signal<Record<string, string>>({});
  editingId = signal<number | null>(null);
  editServerErrors = signal<Record<string, string>>({});

  // Tag create
  showCreateTag = signal(false);
  creatingTag = signal(false);
  createTagErr = signal<string | null>(null);
  editingTagId = signal<number | null>(null);

  createForm = this.fb.group({ name: ['', Validators.required] });
  editForm = this.fb.group({ name: ['', Validators.required] });
  createTagForm = this.fb.group({ name: ['', Validators.required], color: ['#7C3AED'] });
  editTagForm = this.fb.group({ name: ['', Validators.required], color: ['#7C3AED'] });

  palette(id: number) { return PALETTE[id % PALETTE.length]; }
  getTagColorStyle(color: string | null, idx: number) { return tagColorStyle(color, idx); }

  ngOnInit(): void { this.load(); this.loadTags(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.catSvc.getAllCategories().subscribe({
      next: cats => { this.categories.set(cats); this.loading.set(false); },
      error: () => { this.error.set('Failed to load topics.'); this.loading.set(false); },
    });
  }

  loadTags(): void {
    this.tagsLoading.set(true);
    this.tagSvc.getAllTags().subscribe({
      next: tags => { this.allTags.set(tags); this.tagsLoading.set(false); },
      error: () => { this.tagsLoading.set(false); },
    });
  }

  // ─── Categories ───

  toggleCreate(): void {
    this.showCreate.update(v => !v);
    if (!this.showCreate()) this.createForm.reset();
  }

  createFieldErr(field: string): string | null {
    const srv = this.createServerErrors()[field];
    if (srv) return srv;
    const ctrl = this.createForm.get(field);
    return ctrl?.invalid && ctrl.touched ? 'Name is required.' : null;
  }

  editFieldErr(field: string): string | null {
    const srv = this.editServerErrors()[field];
    if (srv) return srv;
    const ctrl = this.editForm.get(field);
    return ctrl?.invalid && ctrl.touched ? 'Name is required.' : null;
  }

  createCategory(): void {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) return;
    this.creating.set(true);
    this.createErr.set(null);
    this.createServerErrors.set({});
    this.catSvc.createCategory({ name: this.createForm.value.name! }).subscribe({
      next: () => {
        this.creating.set(false);
        this.showCreate.set(false);
        this.createForm.reset();
        this.toast.show('Topic created!');
        this.load();
      },
      error: err => {
        this.creating.set(false);
        if (err.status === 400 && err.error) this.createServerErrors.set(err.error);
        else this.createErr.set('Failed to create topic.');
      },
    });
  }

  startEdit(cat: CategoryResponse): void {
    this.editingId.set(cat.id);
    this.editServerErrors.set({});
    this.editForm.patchValue({ name: cat.name });
  }

  cancelEdit(): void { this.editingId.set(null); }

  saveEdit(id: number): void {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;
    this.editServerErrors.set({});
    this.catSvc.updateCategory(id, { name: this.editForm.value.name! }).subscribe({
      next: () => { this.editingId.set(null); this.toast.show('Topic updated.'); this.load(); },
      error: err => {
        if (err.status === 400 && err.error) this.editServerErrors.set(err.error);
        else this.toast.show('Could not update topic.', 'error');
      },
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Delete this topic?')) return;
    this.catSvc.deleteCategory(id).subscribe({
      next: () => { this.toast.show('Topic deleted.'); this.load(); },
      error: () => this.toast.show('Could not delete topic.', 'error'),
    });
  }

  // ─── Tags ───

  toggleCreateTag(): void {
    this.showCreateTag.update(v => !v);
    if (!this.showCreateTag()) this.createTagForm.reset({ name: '', color: '#7C3AED' });
  }

  createTagFieldErr(field: string): string | null {
    const ctrl = this.createTagForm.get(field);
    return ctrl?.invalid && ctrl.touched ? 'Name is required.' : null;
  }

  createTag(): void {
    this.createTagForm.markAllAsTouched();
    if (this.createTagForm.invalid) return;
    this.creatingTag.set(true);
    this.createTagErr.set(null);
    const { name, color } = this.createTagForm.value;
    this.tagSvc.createTag({ name: name!, color: color || null }).subscribe({
      next: () => {
        this.creatingTag.set(false);
        this.showCreateTag.set(false);
        this.createTagForm.reset({ name: '', color: '#7C3AED' });
        this.toast.show('Tag created!');
        this.loadTags();
      },
      error: err => {
        this.creatingTag.set(false);
        this.createTagErr.set(err.error?.name ?? 'Failed to create tag.');
      },
    });
  }

  startTagEdit(tag: TagResponse): void {
    this.editingTagId.set(tag.id);
    this.editTagForm.patchValue({ name: tag.name, color: tag.color ?? '#7C3AED' });
  }

  cancelTagEdit(): void { this.editingTagId.set(null); }

  saveTagEdit(id: number): void {
    this.editTagForm.markAllAsTouched();
    if (this.editTagForm.invalid) return;
    const { name, color } = this.editTagForm.value;
    this.tagSvc.updateTag(id, { name: name!, color: color || null }).subscribe({
      next: () => { this.editingTagId.set(null); this.toast.show('Tag updated.'); this.loadTags(); },
      error: () => this.toast.show('Could not update tag.', 'error'),
    });
  }

  deleteTag(id: number): void {
    if (!confirm('Delete this tag?')) return;
    this.tagSvc.deleteTag(id).subscribe({
      next: () => { this.toast.show('Tag deleted.'); this.loadTags(); },
      error: () => this.toast.show('Could not delete tag.', 'error'),
    });
  }
}
