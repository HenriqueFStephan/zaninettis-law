import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../core/api.service';
import { DesignService } from '../../core/design.service';
import { NewsArticle } from '../../core/models';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.scss'],
})
export class UpdatesComponent implements OnInit {
  private readonly shots = ['home.phCity', 'home.phFacade', 'home.phPages'] as const;
  items: NewsArticle[] = [];

  constructor(
    private api: ApiService,
    readonly design: DesignService,
  ) {}

  shot(index: number): string {
    return this.shots[index % this.shots.length];
  }

  ngOnInit(): void {
    this.api.getNews().subscribe({
      next: (items) => (this.items = items),
      error: () => (this.items = []),
    });
  }
}
