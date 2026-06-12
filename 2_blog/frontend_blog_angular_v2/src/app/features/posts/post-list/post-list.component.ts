import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PostSummaryResponse } from '../../../core/models/post.model';
import { CategoryResponse } from '../../../core/models/category.model';
import { Page } from '../../../core/models/page.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

const PALETTE = [
  { bg: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: 'rgba(124,58,237,0.28)' },
  { bg: 'rgba(220,64,200,0.12)', color: '#F0A0E8', border: 'rgba(220,64,200,0.28)' },
  { bg: 'rgba(0,200,255,0.12)', color: '#7AE0FF', border: 'rgba(0,200,255,0.28)' },
  { bg: 'rgba(0,210,130,0.12)', color: '#5AEFB8', border: 'rgba(0,210,130,0.28)' },
  { bg: 'rgba(255,180,0,0.12)',  color: '#FFD060', border: 'rgba(255,180,0,0.28)'  },
  { bg: 'rgba(255,68,102,0.12)', color: '#FF8899', border: 'rgba(255,68,102,0.28)' },
];

function tagStyle(color: string | null, idx: number) {
  if (color) {
    // Parse hex color to rgba
    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(5,7), 16);
    return {
      bg: `rgba(${r},${g},${b},0.12)`,
      color: color,
      border: `rgba(${r},${g},${b},0.35)`,
    };
  }
  return PALETTE[idx % PALETTE.length];
}

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [DatePipe, RouterLink, SkeletonComponent, ErrorMessageComponent, PaginationComponent],
  template: `
    <div class="page animate-in">
      <!-- Header -->
      <div class="page-head">
        <div>
          @if (searchQuery()) {
            <p class="eyebrow">Search results</p>
            <h1 class="page-title">{{ searchQuery() }}</h1>
          } @else {
            <p class="eyebrow">The latest</p>
            <h1 class="page-title">Stories & Articles</h1>
          }
        </div>
        <div class="head-right">
          @if (searchQuery()) {
            <a routerLink="/posts" class="btn-clear">✕ Clear search</a>
          }
          @if (auth.isAdmin()) {
            <a routerLink="/posts/new" class="btn-write">
              <span>✦</span> New Post
            </a>
          }
        </div>
      </div>

      <!-- Category filter chips (only when not searching) -->
      @if (!searchQuery()) {
        <div class="filter-bar">
          <button class="chip" [class.chip--active]="!selectedCatId()" (click)="setCategory(null)">
            All
          </button>
          @for (cat of categories(); track cat.id) {
            <button class="chip"
                    [class.chip--active]="selectedCatId() === cat.id"
                    (click)="setCategory(cat.id)"
                    [style.--cc]="catStyle(cat.id).color"
                    [style.--cb]="catStyle(cat.id).border">
              {{ cat.name }}
            </button>
          }
        </div>
      }

      <!-- Loading skeletons -->
      @if (loading()) {
        <div class="skeleton-hero">
          <app-skeleton height="240px" radius="20px" />
        </div>
        <div class="grid">
          @for (n of [1,2,3]; track n) {
            <div class="skel-card">
              <app-skeleton height="22px" width="70px" radius="999px" />
              <app-skeleton height="26px" width="100%" />
              <app-skeleton height="26px" width="65%" />
              <app-skeleton height="14px" width="100px" />
            </div>
          }
        </div>
      }

      @else if (error()) {
        <app-error-message [message]="error()!" />
      }

      @else {
        <!-- Featured hero post (only when not searching) -->
        @if (featured() && !searchQuery()) {
          <a [routerLink]="['/posts', featured()!.id]" class="hero-card">
            @if (featured()!.coverImageUrl) {
              <img [src]="featured()!.coverImageUrl!" class="hero-cover" alt="cover" />
            }
            <div class="hero-inner">
              <div class="hero-top">
                <span class="hero-label">✦ Featured</span>
                @if (featured()!.category) {
                  <span class="cat-pill"
                        [style.background]="catStyle(featured()!.category!.id).bg"
                        [style.color]="catStyle(featured()!.category!.id).color"
                        [style.border-color]="catStyle(featured()!.category!.id).border">
                    {{ featured()!.category!.name }}
                  </span>
                }
                @if (featured()!.status === 'DRAFT') {
                  <span class="draft-badge">DRAFT</span>
                }
              </div>
              <h2 class="hero-title">{{ featured()!.title }}</h2>
              @if (featured()!.excerpt) {
                <p class="hero-excerpt">{{ featured()!.excerpt }}</p>
              }
              <div class="hero-foot">
                <div class="hero-meta">
                  <time>{{ featured()!.createdAt | date:'MMMM d, y' }}</time>
                  <span class="meta-dot">·</span>
                  <span>{{ featured()!.readingTimeMinutes }} min read</span>
                  <span class="meta-dot">·</span>
                  <span>{{ featured()!.viewCount }} views</span>
                  <span class="meta-dot">·</span>
                  <span>{{ featured()!.likeCount }} likes</span>
                </div>
                <span class="read-cta">Read article →</span>
              </div>
            </div>
          </a>
        }

        <!-- Grid of remaining posts -->
        @if (gridPosts().length > 0) {
          <div class="grid">
            @for (post of gridPosts(); track post.id) {
              <div class="post-card">
                @if (post.coverImageUrl) {
                  <img [src]="post.coverImageUrl" class="card-cover" alt="cover" />
                }
                <a [routerLink]="['/posts', post.id]" class="card-link">
                  <div class="card-pills">
                    @if (post.category) {
                      <span class="cat-pill"
                            [style.background]="catStyle(post.category.id).bg"
                            [style.color]="catStyle(post.category.id).color"
                            [style.border-color]="catStyle(post.category.id).border">
                        {{ post.category.name }}
                      </span>
                    } @else {
                      <span class="cat-pill cat-pill--none">Uncategorised</span>
                    }
                    @if (post.status === 'DRAFT') {
                      <span class="draft-badge">DRAFT</span>
                    }
                  </div>
                  <h3 class="card-title">{{ post.title }}</h3>
                  @if (post.excerpt) {
                    <p class="card-excerpt">{{ post.excerpt }}</p>
                  }
                  <!-- Tags -->
                  @if (post.tags && post.tags.length > 0) {
                    <div class="tag-row">
                      @for (tag of post.tags.slice(0, 3); track tag.id; let i = $index) {
                        <span class="tag-pill"
                              [style.background]="getTagStyle(tag.color, i).bg"
                              [style.color]="getTagStyle(tag.color, i).color"
                              [style.border-color]="getTagStyle(tag.color, i).border">
                          {{ tag.name }}
                        </span>
                      }
                    </div>
                  }
                  <div class="card-foot">
                    <time class="card-date">{{ post.createdAt | date:'MMM d, y' }}</time>
                    <div class="card-meta">
                      <span>{{ post.readingTimeMinutes }} min</span>
                      <span>· {{ post.viewCount }} views</span>
                    </div>
                  </div>
                  @if (post.author) {
                    <div class="card-author">
                      <div class="author-avatar">{{ post.author.displayName.charAt(0).toUpperCase() }}</div>
                      <span class="author-name">{{ post.author.displayName }}</span>
                    </div>
                  }
                </a>
                @if (auth.isAdmin()) {
                  <div class="card-actions">
                    <button class="action-btn" (click)="editPost(post.id)">Edit</button>
                    <button class="action-btn action-btn--danger" (click)="deletePost(post.id)">Delete</button>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Empty state -->
        @if (!featured() && gridPosts().length === 0) {
          <div class="empty">
            <div class="empty-glyph">◈</div>
            <h3 class="empty-title">{{ searchQuery() ? 'No results found' : 'Nothing here yet' }}</h3>
            <p class="empty-sub">{{ searchQuery() ? 'Try a different search term.' : 'Be the first to publish something extraordinary.' }}</p>
            @if (!searchQuery() && auth.isAdmin()) {
              <a routerLink="/posts/new" class="btn-cta">Write the first post →</a>
            }
          </div>
        }

        @if (page() && page()!.totalPages > 1) {
          <app-pagination [currentPage]="currentPage()" [totalPages]="page()!.totalPages"
                          (pageChange)="onPageChange($event)" />
        }
      }
    </div>
  `,
  styles: [`
    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem 5rem;
    }
    .animate-in {
      animation: fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .page-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2.5rem;
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
    .head-right { display: flex; align-items: center; gap: 0.75rem; }
    .btn-clear {
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
      padding: 0.5rem 1rem;
      background: rgba(255,68,102,0.06); border: 1px solid rgba(255,68,102,0.2); color: #FF8899;
      border-radius: 999px; text-decoration: none;
      transition: background 0.15s;
    }
    .btn-clear:hover { background: rgba(255,68,102,0.12); }
    .btn-write {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.65rem 1.4rem;
      background: var(--gradient);
      color: #fff;
      border-radius: 999px;
      text-decoration: none;
      transition: opacity 0.2s, transform 0.2s;
      white-space: nowrap;
    }
    .btn-write:hover { opacity: 0.85; transform: translateY(-1px); }
    .btn-write span { font-size: 0.75rem; }

    /* Filter chips */
    .filter-bar {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }
    .chip {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 400;
      padding: 0.38rem 1rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      color: var(--text-2);
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.18s;
    }
    .chip:hover {
      background: rgba(255,255,255,0.08);
      color: var(--text);
      border-color: var(--border-2);
    }
    .chip--active {
      background: var(--primary-dim) !important;
      border-color: rgba(124,58,237,0.4) !important;
      color: #A78BFA !important;
    }

    /* Category pill */
    .cat-pill {
      display: inline-block;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      padding: 0.22rem 0.65rem;
      border: 1px solid;
      border-radius: 999px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .cat-pill--none {
      background: rgba(255,255,255,0.04);
      color: var(--text-3);
      border-color: var(--border);
    }
    .draft-badge {
      display: inline-block;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em;
      padding: 0.2rem 0.6rem;
      background: rgba(255,180,0,0.12); border: 1px solid rgba(255,180,0,0.4); color: #FFD060;
      border-radius: 999px;
    }

    /* Tag pills */
    .tag-row {
      display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.25rem;
    }
    .tag-pill {
      display: inline-block;
      font-family: 'DM Sans', sans-serif; font-size: 0.68rem; font-weight: 500;
      padding: 0.18rem 0.6rem; border: 1px solid; border-radius: 999px;
      white-space: nowrap;
    }

    /* Hero / featured card */
    .hero-card {
      display: block;
      position: relative;
      border-radius: 20px;
      margin-bottom: 2rem;
      text-decoration: none;
      overflow: hidden;
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    .hero-card::before {
      content: '';
      position: absolute;
      inset: -1px;
      background: var(--gradient);
      border-radius: 21px;
      opacity: 0.45;
      z-index: 0;
      transition: opacity 0.25s;
    }
    .hero-card:hover::before { opacity: 0.75; }
    .hero-card:hover { transform: translateY(-3px); }
    .hero-cover {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; opacity: 0.15; border-radius: 19px; z-index: 0;
    }
    .hero-inner {
      position: relative;
      z-index: 1;
      background: var(--surface);
      border-radius: 19px;
      padding: 2.5rem 2.75rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .hero-top {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      flex-wrap: wrap;
    }
    .hero-label {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(1.5rem, 3.5vw, 2.4rem);
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--text);
      line-height: 1.2;
      max-width: 780px;
    }
    .hero-excerpt {
      font-family: 'DM Sans', sans-serif; font-size: 1rem; color: var(--text-2);
      line-height: 1.6; max-width: 680px;
    }
    .hero-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 0.25rem;
    }
    .hero-meta {
      display: flex; align-items: center; gap: 0.5rem;
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: var(--text-2);
    }
    .meta-dot { color: var(--text-3); }
    .read-cta {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Post grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }
    .post-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }
    .post-card:hover {
      border-color: rgba(124,58,237,0.3);
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.35);
    }
    .card-cover {
      width: 100%; height: 160px; object-fit: cover;
    }
    .card-link {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      padding: 1.25rem 1.5rem;
      text-decoration: none;
      flex: 1;
    }
    .card-pills { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .card-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      line-height: 1.35;
      letter-spacing: -0.01em;
      flex: 1;
      transition: color 0.15s;
    }
    .post-card:hover .card-title { color: #BBA6FF; }
    .card-excerpt {
      font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: var(--text-2);
      line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-foot {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: auto; padding-top: 0.25rem;
    }
    .card-date {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: var(--text-3);
    }
    .card-meta {
      font-family: 'DM Sans', sans-serif; font-size: 0.75rem; color: var(--text-3);
      display: flex; gap: 0.25rem;
    }
    .card-author {
      display: flex; align-items: center; gap: 0.5rem;
      padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.04);
      margin-top: 0.5rem;
    }
    .author-avatar {
      width: 22px; height: 22px; border-radius: 50%;
      background: linear-gradient(135deg, #7C3AED, #DC40C8);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Space Grotesk', sans-serif; font-size: 0.65rem; font-weight: 700; color: #fff;
      flex-shrink: 0;
    }
    .author-name {
      font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: var(--text-2);
    }
    .card-actions {
      display: flex;
      gap: 0;
      border-top: 1px solid var(--border);
    }
    .action-btn {
      flex: 1;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      font-weight: 500;
      padding: 0.6rem;
      background: none;
      border: none;
      color: var(--text-2);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .action-btn:hover { background: rgba(255,255,255,0.04); color: var(--text); }
    .action-btn--danger:hover { background: rgba(255,68,102,0.08); color: #FF8899; }
    .action-btn + .action-btn { border-left: 1px solid var(--border); }

    /* Skeleton placeholders */
    .skeleton-hero { margin-bottom: 2rem; }
    .skel-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* Empty state */
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 6rem 2rem;
      gap: 1rem;
    }
    .empty-glyph {
      font-size: 3.5rem;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    .empty-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--text);
    }
    .empty-sub {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      color: var(--text-2);
      max-width: 340px;
    }
    .btn-cta {
      margin-top: 0.5rem;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.7rem 1.75rem;
      background: var(--gradient);
      color: #fff;
      border-radius: 999px;
      text-decoration: none;
      transition: opacity 0.2s, transform 0.2s;
    }
    .btn-cta:hover { opacity: 0.85; transform: translateY(-2px); }
  `]
})
export class PostListComponent implements OnInit {
  private postSvc = inject(PostService);
  private catSvc = inject(CategoryService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  page = signal<Page<PostSummaryResponse> | null>(null);
  categories = signal<CategoryResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(0);
  selectedCatId = signal<number | null>(null);
  searchQuery = signal('');

  featured = computed(() => {
    if (this.searchQuery()) return null;
    return this.page()?.content.find(p => p.featured) ?? this.page()?.content[0] ?? null;
  });

  rest = computed(() => {
    if (this.searchQuery()) return this.page()?.content ?? [];
    const feat = this.featured();
    if (!feat) return this.page()?.content ?? [];
    return this.page()?.content.filter(p => p.id !== feat.id) ?? [];
  });

  gridPosts = computed(() => this.rest());

  catStyle(id: number) {
    return PALETTE[id % PALETTE.length];
  }

  getTagStyle(color: string | null, idx: number) {
    return tagStyle(color, idx);
  }

  ngOnInit(): void {
    this.catSvc.getAllCategories().subscribe({ next: cats => this.categories.set(cats) });
    // Watch for query param
    this.route.queryParams.subscribe(params => {
      const q = params['q'] ?? '';
      this.searchQuery.set(q);
      this.currentPage.set(0);
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const q = this.searchQuery();
    const catId = this.selectedCatId();
    let obs;
    if (q) {
      obs = this.postSvc.searchPosts(q, this.currentPage());
    } else if (catId) {
      obs = this.postSvc.getPostsByCategory(catId, this.currentPage());
    } else {
      obs = this.postSvc.getAllPosts(this.currentPage());
    }
    obs.subscribe({
      next: p => { this.page.set(p); this.loading.set(false); },
      error: () => { this.error.set('Failed to load posts.'); this.loading.set(false); },
    });
  }

  setCategory(id: number | null): void {
    this.selectedCatId.set(id);
    this.currentPage.set(0);
    this.load();
  }

  onPageChange(p: number): void {
    this.currentPage.set(p);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editPost(id: number): void {
    this.router.navigate(['/posts', id, 'edit']);
  }

  deletePost(id: number): void {
    if (!confirm('Delete this post?')) return;
    this.postSvc.deletePost(id).subscribe({
      next: () => { this.toast.show('Post deleted.'); this.load(); },
      error: () => this.toast.show('Could not delete post.', 'error'),
    });
  }
}
