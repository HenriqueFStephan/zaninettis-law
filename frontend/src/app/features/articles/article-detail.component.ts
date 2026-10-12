import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { BlogPost } from '../../core/models';
import { reloadOnLang, TranslatePipe } from '../../core/i18n';
import { photoFor } from '../../core/photos';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
})
export class ArticleDetailComponent {
  post: BlogPost | null = null;

  photo(key: string): string {
    return photoFor(key);
  }

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {
    reloadOnLang(() => this.loadPost());
  }

  private loadPost(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getBlogBySlug(slug).subscribe({
      next: (post) => (this.post = post),
      error: () => (this.post = null),
    });
  }
}
