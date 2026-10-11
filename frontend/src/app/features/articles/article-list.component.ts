import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { BlogPost } from '../../core/models';
import { reloadOnLang, TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
})
export class ArticleListComponent {
  posts: BlogPost[] = [];

  constructor(private api: ApiService) {
    reloadOnLang(() => this.loadPosts());
  }

  private loadPosts(): void {
    this.api.getBlogPosts().subscribe({
      next: (items) => (this.posts = items),
      error: () => (this.posts = []),
    });
  }
}
