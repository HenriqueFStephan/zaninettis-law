import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { DesignService } from '../../core/design.service';
import { BlogPost } from '../../core/models';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
})
export class ArticleListComponent implements OnInit {
  posts: BlogPost[] = [];

  constructor(
    private api: ApiService,
    readonly design: DesignService,
  ) {}

  ngOnInit(): void {
    this.api.getBlogPosts().subscribe({
      next: (items) => (this.posts = items),
      error: () => (this.posts = []),
    });
  }
}
