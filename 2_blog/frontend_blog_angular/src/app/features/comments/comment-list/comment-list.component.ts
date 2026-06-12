import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommentResponse } from '../../../core/models/comment.model';
import { CommentService } from '../../../core/services/comment.service';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="comment-list">
      @for (comment of comments; track comment.id) {
        <div class="comment">
          <div class="comment-meta">
            <span class="comment-author">{{ comment.author }}</span>
            <time class="comment-date">{{ comment.createdAt | date:'MMM d, y' }}</time>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
          <button (click)="remove(comment.id)" class="btn-delete-comment">Delete</button>
        </div>
      } @empty {
        <p class="no-comments">No comments yet. Be the first!</p>
      }
    </div>
  `,
  styles: [`
    .comment-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .comment {
      padding: 1rem 1.25rem;
      background: #FDFBF8;
      border: 1px solid #E0DDD8;
      border-radius: 4px;
    }
    .comment-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .comment-author {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1A1A1A;
    }
    .comment-date {
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem;
      color: #999;
    }
    .comment-content {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      line-height: 1.55;
      color: #444;
      margin: 0 0 0.75rem 0;
    }
    .btn-delete-comment {
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      background: none;
      color: #B85C5C;
      border: 1px solid #B85C5C;
      border-radius: 3px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .btn-delete-comment:hover {
      background: #B85C5C;
      color: white;
    }
    .no-comments {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      color: #888;
      margin: 0;
    }
  `]
})
export class CommentListComponent {
  @Input() comments: CommentResponse[] = [];
  @Input() postId!: number;
  @Output() commentDeleted = new EventEmitter<void>();

  private commentService = inject(CommentService);

  remove(commentId: number): void {
    if (!confirm('Delete this comment?')) return;
    this.commentService.deleteComment(this.postId, commentId).subscribe({
      next: () => this.commentDeleted.emit(),
    });
  }
}
