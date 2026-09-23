import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mark',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle *ngIf="name === 'ring'" cx="16" cy="16" r="9" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path *ngIf="name === 'diamond'" d="M16 5 27 16 16 27 5 16Z" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path *ngIf="name === 'bars'" d="M8 9h16M8 16h16M8 23h10" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path *ngIf="name === 'plus'" d="M16 7v18M7 16h18" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path *ngIf="name === 'arc'" d="M8 22c2-9 14-9 16 0" fill="none" stroke="currentColor" stroke-width="1.6" />
    </svg>
  `,
  styles: [`
    :host { display: inline-flex; color: var(--seal); }
    :host-context(.shut) { color: inherit; }
    svg { width: 1.35rem; height: 1.35rem; display: block; }
  `],
})
export class MarkComponent {
  @Input() name: 'ring' | 'diamond' | 'bars' | 'plus' | 'arc' = 'ring';
}
