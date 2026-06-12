import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { PostResponse } from '../../../core/models/post.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { CommentListComponent } from '../../comments/comment-list/comment-list.component';
import { CommentFormComponent } from '../../comments/comment-form/comment-form.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, LoadingSpinnerComponent, ErrorMessageComponent, CommentListComponent, CommentFormComponent],
  template: `
    <div class="page-container">
      <a routerLink="/posts" class="back-link">← All Posts</a>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (error()) {
        <app-error-message [message]="error()!" />
      } @else if (post()) {
        <article>
          <header class="post-header">
            <div class="post-meta">
              @if (post()!.category) {
                <span class="category-badge">{{ post()!.category.name }}</span>
              }
              <time class="post-date">{{ post()!.createdAt | date:'MMMM d, y' }}</time>
            </div>
            <h1 class="post-title">{{ post()!.title }}</h1>
            <div class="post-actions">
              <a [routerLink]="['/posts', post()!.id, 'edit']" class="btn-secondary">Edit</a>
              <button (click)="deletePost()" class="btn-danger">Delete</button>
            </div>
          </header>

          <div class="post-content">{{ post()!.content }}</div>

          <section class="comments-section">
            <h2 class="comments-heading">Comments ({{ post()!.comments.length }})</h2>
            <app-comment-list
              [comments]="post()!.comments"
              [postId]="post()!.id"
              (commentDeleted)="reload()"
            />
            <app-comment-form [postId]="post()!.id" (commentAdded)="reload()" />
          </section>
        </article>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 720px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }
    .back-link {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      color: #C76F4A;
      text-decoration: none;
      display: inline-block;
      margin-bottom: 2.5rem;
    }
    .back-link:hover { text-decoration: underline; }
    .post-header { margin-bottom: 2rem; }
    .post-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
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
      font-size: 2.25rem;
      font-weight: 700;
      color: #1A1A1A;
      line-height: 1.3;
      margin: 0 0 1rem 0;
    }
    .post-actions { display: flex; gap: 0.5rem; }
    .post-content {
      font-family: 'Lora', serif;
      font-size: 1.05rem;
      line-height: 1.75;
      color: #1A1A1A;
      white-space: pre-wrap;
      margin-bottom: 3rem;
    }
    .comments-section {
      border-top: 1px solid #E0DDD8;
      padding-top: 2rem;
    }
    .comments-heading {
      font-family: 'Inter', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1A1A1A;
      margin: 0 0 1.5rem 0;
    }
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
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);

  post = signal<PostResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  private get postId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.postService.getPostById(this.postId).subscribe({
      next: (p) => { this.post.set(p); this.loading.set(false); },
      error: () => { this.error.set('Post not found or failed to load.'); this.loading.set(false); },
    });
  }

  deletePost(): void {
    if (!confirm('Delete this post?')) return;
    this.postService.deletePost(this.postId).subscribe({
      next: () => this.router.navigate(['/posts']),
      error: () => this.error.set('Failed to delete post.'),
    });
  }
}
