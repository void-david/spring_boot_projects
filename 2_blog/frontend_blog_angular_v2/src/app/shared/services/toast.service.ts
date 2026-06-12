import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'success'): void {
    const id = Math.random().toString(36).slice(2);
    this.toasts.update(ts => [...ts, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 3800);
  }

  dismiss(id: string): void {
    this.toasts.update(ts => ts.filter(t => t.id !== id));
  }
}
