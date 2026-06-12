import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="pager">
      <button class="pager-btn" (click)="go(currentPage - 1)" [disabled]="currentPage === 0">← Prev</button>
      <div class="pager-info">
        <span class="pager-current">{{ currentPage + 1 }}</span>
        <span class="pager-sep">/</span>
        <span class="pager-total">{{ totalPages }}</span>
      </div>
      <button class="pager-btn" (click)="go(currentPage + 1)" [disabled]="currentPage >= totalPages - 1">Next →</button>
    </div>
  `,
  styles: [`
    .pager {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      padding: 3rem 0 1rem;
    }
    .pager-btn {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0.55rem 1.4rem;
      background: rgba(124, 58, 237, 0.08);
      border: 1px solid rgba(124, 58, 237, 0.22);
      color: #9F7BFF;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pager-btn:hover:not(:disabled) {
      background: rgba(124, 58, 237, 0.18);
      border-color: rgba(124, 58, 237, 0.5);
      color: #C0A8FF;
    }
    .pager-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .pager-info {
      display: flex;
      align-items: baseline;
      gap: 0.3rem;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.875rem;
    }
    .pager-current {
      font-size: 1.05rem;
      font-weight: 600;
      background: linear-gradient(135deg, #9F7BFF, #DD70CC);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .pager-sep, .pager-total { color: #444466; }
  `]
})
export class PaginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  go(p: number): void {
    if (p >= 0 && p < this.totalPages) this.pageChange.emit(p);
  }
}
