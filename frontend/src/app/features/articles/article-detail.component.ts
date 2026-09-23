import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { BlogPost } from '../../core/models';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <article class="shell page-intro" *ngIf="post">
      <a routerLink="/artigos">{{ 'nav.articles' | t }}</a>
      <h1 class="serif">{{ post.title }}</h1>
      <p class="excerpt">{{ post.excerpt }}</p>
      <div class="body">{{ post.content_markdown }}</div>
    </article>
  `,
  styles: [`
    a { color: var(--seal); }
    h1 { font-size: clamp(2.2rem, 5vw, 3.6rem); max-width: 18ch; }
    .excerpt, .body { max-width: 40rem; color: var(--mute); white-space: pre-wrap; }
  `],
})
export class ArticleDetailComponent implements OnInit {
  post: BlogPost | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.api.getBlogBySlug(slug).subscribe({
      next: (post) => (this.post = post),
      error: () => (this.post = null),
    });
  }
}
