import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="comment-form-wrap">
      <h3 class="form-title">Leave a Comment</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="comment-form">
        <div class="form-field">
          <label for="cf-author">Name</label>
          <input id="cf-author" formControlName="author" type="text"
                 [class.invalid]="fieldError('author')" autocomplete="name" />
          @if (fieldError('author')) {
            <span class="field-error">{{ fieldError('author') }}</span>
          }
        </div>
        <div class="form-field">
          <label for="cf-content">Comment</label>
          <textarea id="cf-content" formControlName="content" rows="4"
                    [class.invalid]="fieldError('content')"></textarea>
          @if (fieldError('content')) {
            <span class="field-error">{{ fieldError('content') }}</span>
          }
        </div>
        @if (submitError()) {
          <p class="submit-error">{{ submitError() }}</p>
        }
        <button type="submit" [disabled]="submitting()" class="btn-submit">
          {{ submitting() ? 'Posting…' : 'Post Comment' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .comment-form-wrap {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #E0DDD8;
    }
    .form-title {
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: #1A1A1A;
      margin: 0 0 1.25rem 0;
    }
    .comment-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    label {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      color: #1A1A1A;
    }
    input, textarea {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      padding: 0.6rem 0.75rem;
      border: 1px solid #E0DDD8;
      border-radius: 4px;
      color: #1A1A1A;
      background: white;
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus, textarea:focus { border-color: #C76F4A; }
    input.invalid, textarea.invalid { border-color: #B85C5C; }
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
    .btn-submit {
      align-self: flex-start;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      padding: 0.55rem 1.5rem;
      background: #C76F4A;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-submit:hover:not(:disabled) { background: #b5633f; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class CommentFormComponent {
  @Input() postId!: number;
  @Output() commentAdded = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private commentService = inject(CommentService);

  submitting = signal(false);
  submitError = signal<string | null>(null);
  serverErrors = signal<Record<string, string>>({});

  form = this.fb.group({
    author: ['', Validators.required],
    content: ['', Validators.required],
  });

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

    const { author, content } = this.form.value;
    this.commentService.createComment(this.postId, { author: author!, content: content! }).subscribe({
      next: () => {
        this.form.reset();
        this.submitting.set(false);
        this.commentAdded.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 400 && err.error) {
          this.serverErrors.set(err.error);
        } else {
          this.submitError.set('Failed to post comment. Please try again.');
        }
      },
    });
  }
}
