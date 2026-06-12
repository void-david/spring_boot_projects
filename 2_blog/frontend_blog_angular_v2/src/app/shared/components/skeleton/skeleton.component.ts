import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `<div class="skel" [style.width]="width" [style.height]="height" [style.border-radius]="radius"></div>`,
  styles: [`
    .skel {
      background: rgba(255,255,255,0.04);
      position: relative;
      overflow: hidden;
      display: block;
    }
    .skel::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%);
      animation: shimmer 1.8s ease-in-out infinite;
    }
    @keyframes shimmer {
      from { transform: translateX(-100%); }
      to   { transform: translateX(100%); }
    }
  `]
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() radius = '8px';
}
