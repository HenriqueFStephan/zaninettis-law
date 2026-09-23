import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { I18nService, TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <header class="bar">
      <a class="mark" routerLink="/" aria-label="Zaninettis">
        <img src="assets/brand/mark.svg" alt="" width="28" height="28" />
        <span>Zaninettis</span>
      </a>
      <button type="button" class="menu" (click)="open = !open">{{ 'nav.menu' | t }}</button>
      <nav [class.open]="open">
        <a routerLink="/" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }" (click)="open = false">{{ 'nav.home' | t }}</a>
        <a routerLink="/atuacao" routerLinkActive="on" (click)="open = false">{{ 'nav.services' | t }}</a>
        <a routerLink="/artigos" routerLinkActive="on" (click)="open = false">{{ 'nav.articles' | t }}</a>
        <a routerLink="/atualizacoes" routerLinkActive="on" (click)="open = false">{{ 'nav.updates' | t }}</a>
        <a routerLink="/contato" routerLinkActive="on" (click)="open = false">{{ 'nav.contact' | t }}</a>
        <button type="button" class="lang" (click)="toggleLang()">{{ i18n.lang() === 'pt-BR' ? 'EN' : 'PT' }}</button>
      </nav>
    </header>
  `,
  styles: [`
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: min(1120px, calc(100% - 2.5rem));
      margin: 0 auto;
      padding: 1.1rem 0;
      border-bottom: 1px solid var(--line);
    }
    .mark {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      font-family: var(--serif);
      font-size: 1.25rem;
    }
    nav {
      display: flex;
      align-items: center;
      gap: 1.15rem;
    }
    nav a {
      text-decoration: none;
      color: var(--mute);
      font-size: 0.92rem;
    }
    nav a.on { color: var(--ink); }
    .lang, .menu {
      border: 0;
      background: transparent;
      color: var(--seal);
      cursor: pointer;
      letter-spacing: 0.08em;
    }
    .menu { display: none; }
    @media (max-width: 760px) {
      .menu { display: inline-flex; }
      nav {
        display: none;
        position: absolute;
        top: 4.2rem;
        left: 1.25rem;
        right: 1.25rem;
        flex-direction: column;
        align-items: flex-start;
        padding: 1rem;
        background: var(--surface);
        border: 1px solid var(--line);
        z-index: 5;
      }
      nav.open { display: flex; }
    }
  `],
})
export class HeaderComponent {
  open = false;

  constructor(readonly i18n: I18nService) {}

  toggleLang(): void {
    this.i18n.setLang(this.i18n.lang() === 'pt-BR' ? 'en' : 'pt-BR');
  }
}
