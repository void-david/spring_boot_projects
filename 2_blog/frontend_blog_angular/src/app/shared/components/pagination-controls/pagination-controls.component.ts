import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  template: `
    <div class="pagination">
      <button (click)="go(currentPage - 1)" [disabled]="currentPage === 0" class="page-btn">Previous</button>
      <span class="page-info">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
      <button (click)="go(currentPage + 1)" [disabled]="currentPage >= totalPages - 1" class="page-btn">Next</button>
    </div>
  `,
  styles: [`
    .pagination {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
      padding: 2rem 0;
    }
    .page-btn {
      background: none;
      border: 1px solid #C76F4A;
      color: #C76F4A;
      padding: 0.4rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      transition: background 0.15s, color 0.15s;
    }
    .page-btn:hover:not(:disabled) {
      background: #C76F4A;
      color: white;
    }
    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .page-info {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      color: #666;
    }
  `]
})
export class PaginationControlsComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  go(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
