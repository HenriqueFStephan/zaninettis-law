import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { ApiService } from '../../core/api.service';
import { NewsArticle } from '../../core/models';
import { reloadOnLang, TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.scss'],
})
export class UpdatesComponent {
  private readonly shots = ['home.phCity', 'home.phFacade', 'home.phPages'] as const;
  items: NewsArticle[] = [];

  constructor(private api: ApiService) {
    reloadOnLang(() => this.loadNews());
  }

  shot(index: number): string {
    return this.shots[index % this.shots.length];
  }

  private loadNews(): void {
    this.api.getNews().subscribe({
      next: (items) => (this.items = items),
      error: () => (this.items = []),
    });
  }
}
