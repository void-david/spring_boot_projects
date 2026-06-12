import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="cf-wrap">
      <h3 class="cf-title">Add a comment</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="cf-form" novalidate>
        <div class="cf-row">
          <div class="field">
            <label for="cf-author">Your name</label>
            <input id="cf-author" formControlName="author" type="text"
                   placeholder="e.g. Alex Kim" autocomplete="name"
                   [class.invalid]="fieldErr('author')" />
            @if (fieldErr('author')) {
              <span class="field-err">{{ fieldErr('author') }}</span>
            }
          </div>
        </div>
        <div class="field">
          <label for="cf-content">Comment</label>
          <textarea id="cf-content" formControlName="content" rows="4"
                    placeholder="Share your thoughts..."
                    [class.invalid]="fieldErr('content')"></textarea>
          @if (fieldErr('content')) {
            <span class="field-err">{{ fieldErr('content') }}</span>
          }
        </div>
        @if (submitErr()) {
          <p class="submit-err">⚡ {{ submitErr() }}</p>
        }
        <div class="cf-actions">
          <button type="submit" [disabled]="submitting()" class="btn-post">
            @if (submitting()) {
              <span class="spinner"></span> Posting…
            } @else {
              Post comment →
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .cf-wrap {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.75rem;
    }
    .cf-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1.4rem;
    }
    .cf-form { display: flex; flex-direction: column; gap: 1.1rem; }
    .cf-row { display: grid; grid-template-columns: 1fr; gap: 1.1rem; }
    .field { display: flex; flex-direction: column; gap: 0.45rem; }
    label {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-2);
    }
    input, textarea {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      padding: 0.75rem 1rem;
      background: var(--surface-3);
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
    input.invalid, textarea.invalid { border-color: rgba(255,68,102,0.45); }
    .field-err {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.78rem;
      color: #FF8899;
    }
    .submit-err {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      color: #FF8899;
      margin: 0;
    }
    .cf-actions { display: flex; justify-content: flex-end; }
    .btn-post {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.65rem 1.5rem;
      background: var(--gradient);
      color: #fff;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      transition: opacity 0.18s, transform 0.18s;
    }
    .btn-post:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
    .btn-post:disabled { opacity: 0.5; cursor: not-allowed; }
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
export class CommentFormComponent {
  @Input() postId!: number;
  @Output() added = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private commentSvc = inject(CommentService);
  private toast = inject(ToastService);

  submitting = signal(false);
  submitErr = signal<string | null>(null);
  serverErrors = signal<Record<string, string>>({});

  form = this.fb.group({
    author: ['', Validators.required],
    content: ['', Validators.required],
  });

  fieldErr(field: string): string | null {
    const srv = this.serverErrors()[field];
    if (srv) return srv;
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl.touched ? 'This field is required.' : null;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.submitErr.set(null);
    this.serverErrors.set({});

    const { author, content } = this.form.value;
    this.commentSvc.createComment(this.postId, { author: author!, content: content! }).subscribe({
      next: () => {
        this.form.reset();
        this.submitting.set(false);
        this.toast.show('Comment posted!');
        this.added.emit();
      },
      error: err => {
        this.submitting.set(false);
        if (err.status === 400 && err.error) {
          this.serverErrors.set(err.error);
        } else {
          this.submitErr.set('Failed to post comment. Please try again.');
        }
      },
    });
  }
}
