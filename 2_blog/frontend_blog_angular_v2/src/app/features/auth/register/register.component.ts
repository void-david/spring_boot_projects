import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page animate-in">
      <div class="auth-card">
        <div class="card-topbar"></div>
        <div class="card-body">
          <div class="auth-header">
            <span class="logo-mark">◆</span>
            <h1 class="auth-title">Create account</h1>
            <p class="auth-sub">Join LUMEN today</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form" novalidate>

            <div class="field">
              <label for="reg-username">Username</label>
              <input id="reg-username" formControlName="username" type="text"
                     placeholder="coolwriter42"
                     [class.invalid]="fieldErr('username')" autocomplete="username" />
              @if (fieldErr('username')) {
                <span class="field-err">{{ fieldErr('username') }}</span>
              }
            </div>

            <div class="field">
              <label for="reg-display">Display name <span class="opt">(optional)</span></label>
              <input id="reg-display" formControlName="displayName" type="text"
                     placeholder="Cool Writer" autocomplete="name" />
            </div>

            <div class="field">
              <label for="reg-email">Email</label>
              <input id="reg-email" formControlName="email" type="email"
                     placeholder="you@example.com"
                     [class.invalid]="fieldErr('email')" autocomplete="email" />
              @if (fieldErr('email')) {
                <span class="field-err">{{ fieldErr('email') }}</span>
              }
            </div>

            <div class="field">
              <label for="reg-password">Password</label>
              <input id="reg-password" formControlName="password" type="password"
                     placeholder="Min 6 characters"
                     [class.invalid]="fieldErr('password')" autocomplete="new-password" />
              @if (fieldErr('password')) {
                <span class="field-err">{{ fieldErr('password') }}</span>
              }
            </div>

            @if (submitErr()) {
              <p class="submit-err">⚡ {{ submitErr() }}</p>
            }

            <button type="submit" [disabled]="submitting()" class="btn-submit">
              @if (submitting()) {
                <span class="spinner"></span> Creating account…
              } @else {
                Create account →
              }
            </button>

          </form>

          <p class="auth-switch">
            Already have an account?
            <a routerLink="/login" class="auth-link">Sign in →</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: calc(100vh - 62px);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
    }
    .animate-in { animation: fadeUp 0.4s cubic-bezier(0.4,0,0.2,1) both; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .auth-card {
      width: 100%; max-width: 440px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; overflow: hidden;
    }
    .card-topbar { height: 4px; background: var(--gradient); }
    .card-body { padding: 2.5rem 2.25rem; }
    .auth-header {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.5rem; margin-bottom: 2rem; text-align: center;
    }
    .logo-mark {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #7C3AED, #DC40C8);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .auth-title {
      font-family: 'Space Grotesk', sans-serif; font-size: 1.6rem; font-weight: 700;
      letter-spacing: -0.02em; color: var(--text);
    }
    .auth-sub {
      font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: var(--text-2);
    }
    .form { display: flex; flex-direction: column; gap: 1.25rem; }
    .field { display: flex; flex-direction: column; gap: 0.45rem; }
    label {
      font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 600;
      letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-2);
    }
    .opt { font-size: 0.7rem; font-weight: 400; letter-spacing: 0; text-transform: none; color: var(--text-3); }
    input {
      font-family: 'DM Sans', sans-serif; font-size: 1rem;
      padding: 0.85rem 1rem;
      background: var(--surface-2); border: 1px solid var(--border-2);
      border-radius: 10px; color: var(--text); outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    input::placeholder { color: var(--text-3); }
    input:focus { border-color: rgba(124,58,237,0.55); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
    input.invalid { border-color: rgba(255,68,102,0.45); }
    .field-err { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: #FF8899; }
    .submit-err { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #FF8899; margin: 0; }
    .btn-submit {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem; font-weight: 600;
      padding: 0.85rem 2rem; background: var(--gradient); color: #fff;
      border: none; border-radius: 999px; cursor: pointer;
      transition: opacity 0.18s, transform 0.18s; width: 100%;
    }
    .btn-submit:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .spinner {
      display: inline-block; width: 15px; height: 15px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-switch {
      margin-top: 1.5rem; text-align: center;
      font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: var(--text-2);
    }
    .auth-link {
      color: #A78BFA; text-decoration: none; font-weight: 500;
      transition: color 0.15s;
    }
    .auth-link:hover { color: #C0A8FF; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  submitting = signal(false);
  submitErr = signal<string | null>(null);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9_]+$')]],
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  fieldErr(field: string): string | null {
    const ctrl = this.form.get(field);
    if (!ctrl?.invalid || !ctrl.touched) return null;
    if (ctrl.errors?.['required']) return 'This field is required.';
    if (ctrl.errors?.['email']) return 'Please enter a valid email.';
    if (ctrl.errors?.['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors?.['maxlength']) return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters.`;
    if (ctrl.errors?.['pattern']) return 'Only letters, numbers, and underscores allowed.';
    return 'Invalid value.';
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.submitErr.set(null);

    const { username, displayName, email, password } = this.form.value;
    this.auth.register({
      username: username!,
      email: email!,
      password: password!,
      displayName: displayName || undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/posts']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitErr.set(err.error?.error ?? 'Registration failed. Please try again.');
      },
    });
  }
}
