import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { PostSummaryResponse } from '../../../core/models/post.model';
import { CategoryResponse } from '../../../core/models/category.model';
import { Page } from '../../../core/models/page.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { PaginationControlsComponent } from '../../../shared/components/pagination-controls/pagination-controls.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [DatePipe, RouterLink, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent, PaginationControlsComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Posts</h1>
        <a routerLink="/posts/new" class="btn-primary">New Post</a>
      </div>

      <div class="filters">
        <select [(ngModel)]="selectedCategoryId" (ngModelChange)="onCategoryFilter()" class="filter-select">
          <option [ngValue]="null">All Categories</option>
          @for (cat of categories(); track cat.id) {
            <option [ngValue]="cat.id">{{ cat.name }}</option>
          }
        </select>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (error()) {
        <app-error-message [message]="error()!" />
      } @else {
        <div class="post-list">
          @for (post of postsPage()?.content; track post.id) {
            <article class="post-card">
              <div class="post-meta">
                @if (post.category) {
                  <span class="category-badge">{{ post.category.name }}</span>
                }
                <time class="post-date">{{ post.createdAt | date:'MMMM d, y' }}</time>
              </div>
              <h2 class="post-title">
                <a [routerLink]="['/posts', post.id]">{{ post.title }}</a>
              </h2>
              <div class="post-actions">
                <a [routerLink]="['/posts', post.id, 'edit']" class="btn-secondary">Edit</a>
                <button (click)="deletePost(post.id)" class="btn-danger">Delete</button>
              </div>
            </article>
          } @empty {
            <p class="empty-state">No posts yet. <a routerLink="/posts/new">Create your first post.</a></p>
          }
        </div>

        @if (postsPage() && postsPage()!.totalPages > 1) {
          <app-pagination-controls
            [currentPage]="currentPage()"
            [totalPages]="postsPage()!.totalPages"
            (pageChange)="onPageChange($event)"
          />
        }
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1024px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .page-header h1 {
      font-family: 'Lora', serif;
      font-size: 2rem;
      color: #1A1A1A;
      margin: 0;
    }
    .filters {
      margin-bottom: 2rem;
    }
    .filter-select {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid #E0DDD8;
      border-radius: 4px;
      background: white;
      color: #1A1A1A;
      outline: none;
      cursor: pointer;
    }
    .filter-select:focus { border-color: #C76F4A; }
    .post-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .post-card {
      background: white;
      border: 1px solid #E0DDD8;
      border-radius: 6px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .post-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .category-badge {
      font-family: 'Inter', sans-serif;
      font-size: 0.7rem;
      font-weight: 500;
      padding: 0.2rem 0.65rem;
      border: 1px solid #C76F4A;
      border-radius: 12px;
      color: #C76F4A;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .post-date {
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      color: #999;
    }
    .post-title {
      font-family: 'Lora', serif;
      font-size: 1.35rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
    }
    .post-title a {
      color: #1A1A1A;
      text-decoration: none;
    }
    .post-title a:hover { color: #C76F4A; }
    .post-actions {
      display: flex;
      gap: 0.5rem;
    }
    .empty-state {
      font-family: 'Inter', sans-serif;
      color: #888;
      text-align: center;
      padding: 3rem;
    }
    .empty-state a { color: #C76F4A; }
    .btn-primary {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      padding: 0.55rem 1.25rem;
      background: #C76F4A;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: background 0.15s;
    }
    .btn-primary:hover { background: #b5633f; }
    .btn-secondary {
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      padding: 0.3rem 0.7rem;
      background: none;
      color: #C76F4A;
      border: 1px solid #C76F4A;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .btn-secondary:hover { background: #C76F4A; color: white; }
    .btn-danger {
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
    .btn-danger:hover { background: #B85C5C; color: white; }
  `]
})
export class PostListComponent implements OnInit {
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);

  postsPage = signal<Page<PostSummaryResponse> | null>(null);
  categories = signal<CategoryResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(0);
  selectedCategoryId: number | null = null;

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading.set(true);
    this.error.set(null);
    const obs = this.selectedCategoryId
      ? this.postService.getPostsByCategory(this.selectedCategoryId, this.currentPage())
      : this.postService.getAllPosts(this.currentPage());
    obs.subscribe({
      next: (page) => { this.postsPage.set(page); this.loading.set(false); },
      error: () => { this.error.set('Failed to load posts.'); this.loading.set(false); },
    });
  }

  onCategoryFilter(): void {
    this.currentPage.set(0);
    this.loadPosts();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPosts();
  }

  deletePost(id: number): void {
    if (!confirm('Delete this post?')) return;
    this.postService.deletePost(id).subscribe({
      next: () => this.loadPosts(),
      error: () => this.error.set('Failed to delete post.'),
    });
  }
}
