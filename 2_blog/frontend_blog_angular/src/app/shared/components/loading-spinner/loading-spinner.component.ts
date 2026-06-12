import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-wrap">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .spinner-wrap {
      display: flex;
      justify-content: center;
      padding: 3rem 0;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #E0DDD8;
      border-top-color: #C76F4A;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoadingSpinnerComponent {}
