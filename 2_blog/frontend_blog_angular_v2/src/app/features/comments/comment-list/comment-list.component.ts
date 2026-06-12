import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommentResponse } from '../../../core/models/comment.model';
import { CommentService } from '../../../core/services/comment.service';
import { ToastService } from '../../../shared/services/toast.service';

function initials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2);
}

function avatarColor(name: string): string {
  const palette = ['#7C3AED','#DC40C8','#00C8FF','#00D282','#FFB400','#FF4466'];
  const idx = name.charCodeAt(0) % palette.length;
  return palette[idx];
}

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="comment-list">
      @for (c of comments; track c.id) {
        <div class="comment">
          <div class="avatar" [style.background]="avatarBg(c.author)">
            {{ initials(c.author) }}
          </div>
          <div class="comment-body">
            <div class="comment-meta">
              <span class="comment-author">{{ c.author }}</span>
              <time class="comment-date">{{ c.createdAt | date:'MMM d, y' }}</time>
            </div>
            <p class="comment-text">{{ c.content }}</p>
          </div>
          <button class="del-btn" (click)="remove(c.id)" title="Delete comment">×</button>
        </div>
      } @empty {
        <p class="empty">No comments yet — start the conversation.</p>
      }
    </div>
  `,
  styles: [`
    .comment-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }
    .comment {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      padding: 1.25rem;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 14px;
      position: relative;
      transition: border-color 0.15s;
    }
    .comment:hover { border-color: var(--border-2); }
    .avatar {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      color: #fff;
    }
    .comment-body { flex: 1; min-width: 0; }
    .comment-meta {
      display: flex;
      align-items: baseline;
      gap: 0.6rem;
      margin-bottom: 0.5rem;
    }
    .comment-author {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
    }
    .comment-date {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem;
      color: var(--text-3);
    }
    .comment-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      line-height: 1.6;
      color: #BBBBDD;
      margin: 0;
      word-break: break-word;
    }
    .del-btn {
      flex-shrink: 0;
      background: none;
      border: none;
      color: var(--text-3);
      font-size: 1.2rem;
      line-height: 1;
      cursor: pointer;
      padding: 0.1rem 0.25rem;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }
    .del-btn:hover { color: #FF8899; background: rgba(255,68,102,0.08); }
    .empty {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      color: var(--text-3);
      padding: 1rem 0;
    }
  `]
})
export class CommentListComponent {
  @Input() comments: CommentResponse[] = [];
  @Input() postId!: number;
  @Output() deleted = new EventEmitter<void>();

  private commentSvc = inject(CommentService);
  private toast = inject(ToastService);

  initials = initials;
  avatarBg = avatarColor;

  remove(commentId: number): void {
    if (!confirm('Delete this comment?')) return;
    this.commentSvc.deleteComment(this.postId, commentId).subscribe({
      next: () => { this.toast.show('Comment deleted.'); this.deleted.emit(); },
      error: () => this.toast.show('Could not delete comment.', 'error'),
    });
  }
}
