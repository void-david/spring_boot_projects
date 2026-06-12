import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PostResponse } from '../../../core/models/post.model';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { CommentListComponent } from '../../comments/comment-list/comment-list.component';
import { CommentFormComponent } from '../../comments/comment-form/comment-form.component';

const PALETTE = [
  { bg: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: 'rgba(124,58,237,0.28)' },
  { bg: 'rgba(220,64,200,0.12)', color: '#F0A0E8', border: 'rgba(220,64,200,0.28)' },
  { bg: 'rgba(0,200,255,0.12)',  color: '#7AE0FF', border: 'rgba(0,200,255,0.28)'  },
  { bg: 'rgba(0,210,130,0.12)', color: '#5AEFB8', border: 'rgba(0,210,130,0.28)'  },
  { bg: 'rgba(255,180,0,0.12)',  color: '#FFD060', border: 'rgba(255,180,0,0.28)'  },
  { bg: 'rgba(255,68,102,0.12)', color: '#FF8899', border: 'rgba(255,68,102,0.28)' },
];

function tagStyle(color: string | null, idx: number) {
  if (color) {
    const r = parseInt(color.slice(1,3), 16);
    const g = parseInt(color.slice(3,5), 16);
    const b = parseInt(color.slice(5,7), 16);
    return { bg: `rgba(${r},${g},${b},0.12)`, color, border: `rgba(${r},${g},${b},0.35)` };
  }
  return PALETTE[idx % PALETTE.length];
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, SkeletonComponent, ErrorMessageComponent, CommentListComponent, CommentFormComponent],
  template: `
    <div class="page animate-in">
      <a routerLink="/posts" class="back-link">← Back to posts</a>

      @if (loading()) {
        <div class="skel-wrap">
          <app-skeleton height="18px" width="100px" />
          <app-skeleton height="52px" width="90%" />
          <app-skeleton height="52px" width="60%" />
          <app-skeleton height="14px" width="180px" />
          <div style="margin-top:2rem; display:flex; flex-direction:column; gap:0.6rem;">
            @for (n of [1,2,3,4,5]; track n) {
              <app-skeleton height="18px" [width]="n === 3 ? '85%' : '100%'" />
            }
          </div>
        </div>
      }

      @else if (error()) {
        <app-error-message [message]="error()!" />
      }

      @else if (post()) {
        <!-- Cover image -->
        @if (post()!.coverImageUrl) {
          <img [src]="post()!.coverImageUrl!" class="cover-img" alt="Cover image" />
        }

        <!-- Post header -->
        <header class="post-header">
          <div class="post-meta-row">
            @if (post()!.category) {
              <span class="cat-pill"
                    [style.background]="catStyle(post()!.category!.id).bg"
                    [style.color]="catStyle(post()!.category!.id).color"
                    [style.border-color]="catStyle(post()!.category!.id).border">
                {{ post()!.category!.name }}
              </span>
            }
            @if (post()!.status === 'DRAFT') {
              <span class="draft-badge">DRAFT</span>
            }
            <time class="meta-item">{{ post()!.createdAt | date:'MMMM d, y' }}</time>
            <span class="meta-sep">·</span>
            <span class="meta-item">{{ post()!.readingTimeMinutes }} min read</span>
            <span class="meta-sep">·</span>
            <span class="meta-item">{{ viewCount() }} views</span>
          </div>

          <h1 class="post-title">{{ post()!.title }}</h1>

          @if (post()!.excerpt) {
            <p class="post-excerpt">{{ post()!.excerpt }}</p>
          }

          <!-- Author + like -->
          <div class="post-byline">
            @if (post()!.author) {
              <div class="author-info">
                <div class="author-avatar">{{ post()!.author!.displayName.charAt(0).toUpperCase() }}</div>
                <div>
                  <p class="author-name">{{ post()!.author!.displayName }}</p>
                  <p class="author-sub">Author</p>
                </div>
              </div>
            }
            <div class="like-btn-wrap">
              <button class="like-btn" (click)="like()" [class.liked]="liked()">
                <span class="like-icon">{{ liked() ? '♥' : '♡' }}</span>
                <span>{{ likeCount() }}</span>
              </button>
            </div>
          </div>

          <!-- Tags -->
          @if (post()!.tags && post()!.tags.length > 0) {
            <div class="tag-row">
              @for (tag of post()!.tags; track tag.id; let i = $index) {
                <span class="tag-pill"
                      [style.background]="getTagStyle(tag.color, i).bg"
                      [style.color]="getTagStyle(tag.color, i).color"
                      [style.border-color]="getTagStyle(tag.color, i).border">
                  {{ tag.name }}
                </span>
              }
            </div>
          }

          @if (auth.isAdmin()) {
            <div class="post-actions">
              <a [routerLink]="['/posts', post()!.id, 'edit']" class="btn-edit">Edit post</a>
              <button class="btn-delete" (click)="deletePost()">Delete</button>
            </div>
          }
        </header>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Post body -->
        <div class="post-body">{{ post()!.content }}</div>

        <!-- Comments -->
        <section class="comments-section">
          <h2 class="section-title">
            <span>Discussion</span>
            <span class="comment-count">{{ post()!.comments.length }}</span>
          </h2>
          <app-comment-list [comments]="post()!.comments" [postId]="post()!.id" (deleted)="reload()" />
          <app-comment-form [postId]="post()!.id" (added)="reload()" />
        </section>
      }
    </div>
  `,
  styles: [`
    .page {
      max-width: 760px;
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
    .back-link {
      display: inline-block;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.875rem;
      color: var(--text-2);
      text-decoration: none;
      margin-bottom: 2.5rem;
      transition: color 0.15s;
    }
    .back-link:hover { color: #A78BFA; }

    /* Cover image */
    .cover-img {
      width: 100%; max-height: 420px; object-fit: cover;
      border-radius: 16px; margin-bottom: 2rem;
    }

    /* Skeleton */
    .skel-wrap { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }

    /* Post header */
    .post-header { margin-bottom: 2rem; }
    .post-meta-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    .cat-pill {
      display: inline-block;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.25rem 0.7rem;
      border: 1px solid;
      border-radius: 999px;
    }
    .draft-badge {
      display: inline-block;
      font-family: 'Space Grotesk', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em;
      padding: 0.2rem 0.6rem;
      background: rgba(255,180,0,0.12); border: 1px solid rgba(255,180,0,0.4); color: #FFD060;
      border-radius: 999px;
    }
    .meta-item {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      color: var(--text-2);
    }
    .meta-sep { color: var(--text-3); font-size: 0.75rem; }

    .post-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(1.9rem, 5vw, 3rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.18;
      color: var(--text);
      margin-bottom: 1rem;
    }
    .post-excerpt {
      font-family: 'DM Sans', sans-serif; font-size: 1.1rem; color: var(--text-2);
      line-height: 1.65; margin-bottom: 1.5rem;
      border-left: 3px solid rgba(124,58,237,0.4); padding-left: 1rem;
    }

    /* Author + like */
    .post-byline {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;
    }
    .author-info { display: flex; align-items: center; gap: 0.75rem; }
    .author-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #7C3AED, #DC40C8);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 700; color: #fff;
      flex-shrink: 0;
    }
    .author-name { font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; font-weight: 600; color: var(--text); }
    .author-sub { font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: var(--text-3); }
    .like-btn-wrap {}
    .like-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      font-family: 'Space Grotesk', sans-serif; font-size: 0.875rem; font-weight: 600;
      padding: 0.5rem 1.1rem;
      background: rgba(255,68,102,0.06); border: 1px solid rgba(255,68,102,0.2); color: #FF8899;
      border-radius: 999px; cursor: pointer; transition: all 0.18s;
    }
    .like-btn:hover, .like-btn.liked {
      background: rgba(255,68,102,0.14); border-color: rgba(255,68,102,0.45);
    }
    .like-icon { font-size: 1rem; }

    /* Tags */
    .tag-row { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .tag-pill {
      display: inline-block;
      font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 500;
      padding: 0.22rem 0.7rem; border: 1px solid; border-radius: 999px;
    }

    .post-actions {
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }
    .btn-edit {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 500;
      padding: 0.45rem 1rem;
      background: rgba(124,58,237,0.1);
      border: 1px solid rgba(124,58,237,0.25);
      color: #A78BFA;
      border-radius: 999px;
      text-decoration: none;
      transition: background 0.15s, border-color 0.15s;
    }
    .btn-edit:hover { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.5); }
    .btn-delete {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 500;
      padding: 0.45rem 1rem;
      background: rgba(255,68,102,0.06);
      border: 1px solid rgba(255,68,102,0.2);
      color: #FF8899;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .btn-delete:hover { background: rgba(255,68,102,0.14); border-color: rgba(255,68,102,0.4); }

    /* Divider */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, var(--primary) 0%, rgba(220,64,200,0.6) 50%, transparent 100%);
      margin-bottom: 2.5rem;
      opacity: 0.35;
    }

    /* Post body */
    .post-body {
      font-family: 'DM Sans', sans-serif;
      font-size: 1.075rem;
      line-height: 1.85;
      color: #CCCCEE;
      white-space: pre-wrap;
      word-break: break-word;
      margin-bottom: 4rem;
    }

    /* Comments section */
    .comments-section { border-top: 1px solid var(--border); padding-top: 3rem; }
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 2rem;
    }
    .comment-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 26px;
      padding: 0 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--primary-dim);
      border: 1px solid rgba(124,58,237,0.3);
      color: #A78BFA;
      border-radius: 999px;
    }
  `]
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postSvc = inject(PostService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  post = signal<PostResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  liked = signal(false);
  likeCount = signal(0);
  viewCount = signal(0);

  private get postId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  catStyle(id: number) { return PALETTE[id % PALETTE.length]; }
  getTagStyle(color: string | null, idx: number) { return tagStyle(color, idx); }

  ngOnInit(): void {
    this.reload();
    // Fire-and-forget view tracking
    this.postSvc.recordView(this.postId).subscribe({ error: () => {} });
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.postSvc.getPostById(this.postId).subscribe({
      next: p => {
        this.post.set(p);
        this.likeCount.set(p.likeCount);
        this.viewCount.set(p.viewCount);
        this.loading.set(false);
      },
      error: () => { this.error.set('Post not found or could not be loaded.'); this.loading.set(false); },
    });
  }

  like(): void {
    if (this.liked()) return;
    this.postSvc.likePost(this.postId).subscribe({
      next: () => {
        this.liked.set(true);
        this.likeCount.update(v => v + 1);
      },
      error: () => {},
    });
  }

  deletePost(): void {
    if (!confirm('Delete this post?')) return;
    this.postSvc.deletePost(this.postId).subscribe({
      next: () => { this.toast.show('Post deleted.'); this.router.navigate(['/posts']); },
      error: () => this.toast.show('Could not delete post.', 'error'),
    });
  }
}
