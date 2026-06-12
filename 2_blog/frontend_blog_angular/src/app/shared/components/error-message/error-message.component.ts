import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  template: `
    <div class="error-box">
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .error-box {
      background: #FFF5F5;
      border: 1px solid #FECACA;
      border-radius: 4px;
      padding: 1rem 1.25rem;
      color: #B85C5C;
      margin: 1rem 0;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
    }
    p { margin: 0; }
  `]
})
export class ErrorMessageComponent {
  @Input() message = 'Something went wrong. Please try again.';
}
