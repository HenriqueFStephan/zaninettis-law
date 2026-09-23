import { Component } from '@angular/core';

import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <footer>
      <div>
        <strong>Zaninettis</strong>
        <p>{{ 'footer.note' | t }}</p>
      </div>
      <span>{{ 'footer.city' | t }}</span>
    </footer>
  `,
  styles: [`
    footer {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      width: min(1120px, calc(100% - 2.5rem));
      margin: 0 auto;
      padding: 2rem 0 6.5rem;
      border-top: 1px solid var(--line);
      color: var(--mute);
      font-size: 0.92rem;
    }
    strong {
      color: var(--ink);
      font-family: var(--serif);
      font-weight: 460;
    }
    p { margin: 0.35rem 0 0; max-width: 28rem; }
  `],
})
export class FooterComponent {}
