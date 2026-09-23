import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../core/api.service';
import { NewsArticle } from '../../core/models';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <section class="shell page-intro">
      <p class="kicker">{{ 'nav.updates' | t }}</p>
      <h1 class="serif">{{ 'nav.updates' | t }}</h1>
      <p>{{ 'page.pending' | t }}</p>
      <article *ngFor="let item of items">
        <h2>{{ item.title }}</h2>
        <p>{{ item.summary }}</p>
        <a *ngIf="item.source_url" [href]="item.source_url" target="_blank" rel="noopener">{{ item.source_name || item.source_url }}</a>
      </article>
    </section>
  `,
  styles: [`
    article { padding: 1.2rem 0; border-top: 1px solid var(--line); }
    h2 { margin: 0 0 0.35rem; font-size: 1.6rem; }
    p { color: var(--mute); }
  `],
})
export class UpdatesComponent implements OnInit {
  items: NewsArticle[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getNews().subscribe({
      next: (items) => (this.items = items),
      error: () => (this.items = []),
    });
  }
}
