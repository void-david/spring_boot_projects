import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      @for (toast of svc.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type">
          <span class="toast-icon">
            @switch (toast.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @default { ● }
            }
          </span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" (click)="svc.dismiss(toast.id)" aria-label="Dismiss">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9000;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.9rem 1.1rem 0.9rem 1rem;
      border-radius: 14px;
      backdrop-filter: blur(20px) saturate(180%);
      pointer-events: all;
      animation: toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      min-width: 260px;
      max-width: 400px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.4;
    }
    .toast--success {
      background: rgba(0, 210, 130, 0.14);
      border: 1px solid rgba(0, 210, 130, 0.3);
      color: #4DFFC0;
    }
    .toast--error {
      background: rgba(255, 68, 102, 0.14);
      border: 1px solid rgba(255, 68, 102, 0.3);
      color: #FF8899;
    }
    .toast--info {
      background: rgba(124, 58, 237, 0.14);
      border: 1px solid rgba(124, 58, 237, 0.3);
      color: #B09FFF;
    }
    .toast-icon {
      font-weight: 700;
      font-size: 0.875rem;
      flex-shrink: 0;
      width: 20px;
      text-align: center;
    }
    .toast-msg { flex: 1; }
    .toast-close {
      background: none;
      border: none;
      color: inherit;
      opacity: 0.5;
      cursor: pointer;
      font-size: 1.1rem;
      line-height: 1;
      padding: 0 0 0 0.25rem;
      flex-shrink: 0;
      transition: opacity 0.15s;
    }
    .toast-close:hover { opacity: 1; }
    @keyframes toastIn {
      from { transform: translateX(110%) scale(0.95); opacity: 0; }
      to   { transform: translateX(0) scale(1); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  svc = inject(ToastService);
}
