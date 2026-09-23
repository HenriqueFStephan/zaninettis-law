import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'atuacao',
    loadComponent: () =>
      import('./features/services/services.component').then((m) => m.ServicesComponent),
  },
  {
    path: 'artigos',
    loadComponent: () =>
      import('./features/articles/article-list.component').then((m) => m.ArticleListComponent),
  },
  {
    path: 'artigos/:slug',
    loadComponent: () =>
      import('./features/articles/article-detail.component').then((m) => m.ArticleDetailComponent),
  },
  {
    path: 'atualizacoes',
    loadComponent: () =>
      import('./features/updates/updates.component').then((m) => m.UpdatesComponent),
  },
  {
    path: 'contato',
    loadComponent: () =>
      import('./features/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'studio',
    loadComponent: () =>
      import('./features/studio/studio.component').then((m) => m.StudioComponent),
  },
  { path: '**', redirectTo: '' },
];
