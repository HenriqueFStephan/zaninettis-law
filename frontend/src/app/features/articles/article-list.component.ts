import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { BlogPost } from '../../core/models';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <section class="shell page-intro">
      <p class="kicker">{{ 'nav.articles' | t }}</p>
      <h1 class="serif">{{ 'nav.articles' | t }}</h1>
      <p>{{ 'page.pending' | t }}</p>
      <a class="card" *ngFor="let post of posts" [routerLink]="['/artigos', post.slug]">
        <h2>{{ post.title }}</h2>
        <p>{{ post.excerpt }}</p>
      </a>
    </section>
  `,
  styles: [`
    .card {
      display: block;
      padding: 1.25rem 0;
      border-top: 1px solid var(--line);
      text-decoration: none;
    }
    h2 { margin: 0 0 0.35rem; font-size: 1.8rem; }
    p { color: var(--mute); }
  `],
})
export class ArticleListComponent implements OnInit {
  posts: BlogPost[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getBlogPosts().subscribe({
      next: (items) => (this.posts = items),
      error: () => (this.posts = []),
    });
  }
}
