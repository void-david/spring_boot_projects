import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  template: `
    <div class="err">
      <span class="err-icon">⚡</span>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .err {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1.1rem 1.4rem;
      background: rgba(255, 68, 102, 0.08);
      border: 1px solid rgba(255, 68, 102, 0.18);
      border-radius: 12px;
      margin: 1.5rem 0;
    }
    .err-icon { font-size: 1.1rem; flex-shrink: 0; }
    p {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      color: #FF8899;
      line-height: 1.4;
      margin: 0;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() message = 'Something went wrong. Please try again.';
}
