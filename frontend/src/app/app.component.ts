import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { DesignService } from './core/design.service';
import { I18nService, TranslatePipe } from './core/i18n';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { MarkComponent } from './shared/mark/mark.component';

interface Tab {
  n: string;
  path: string;
  key: 'nav.home' | 'nav.services' | 'nav.articles' | 'nav.updates' | 'nav.contact';
  mark: 'ring' | 'diamond' | 'bars' | 'plus' | 'arc';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, HeaderComponent, FooterComponent, TranslatePipe, MarkComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isStudio = false;
  path = '/';
  readonly tabs: Tab[] = [
    { n: '01', path: '/', key: 'nav.home', mark: 'ring' },
    { n: '02', path: '/atuacao', key: 'nav.services', mark: 'diamond' },
    { n: '03', path: '/artigos', key: 'nav.articles', mark: 'bars' },
    { n: '04', path: '/atualizacoes', key: 'nav.updates', mark: 'plus' },
    { n: '05', path: '/contato', key: 'nav.contact', mark: 'arc' },
  ];

  constructor(
    router: Router,
    readonly i18n: I18nService,
    readonly design: DesignService,
  ) {
    const sync = (): void => {
      const routed = router.url.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
      const here =
        typeof location !== 'undefined'
          ? location.pathname.split('?')[0].replace(/\/+$/, '') || '/'
          : '/';
      const path = routed === '/' && here !== '/' ? here : routed;
      this.path = path;
      this.isStudio = path === '/studio';
    };
    router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(sync);
    sync();
  }

  get rollout(): boolean {
    const layout = this.design.layout();
    return layout === 'indice' || layout === 'lamina';
  }

  isOpen(tabPath: string): boolean {
    if (tabPath === '/') {
      return this.path === '/';
    }
    return this.path === tabPath || this.path.startsWith(`${tabPath}/`);
  }

  toggleLang(): void {
    this.i18n.setLang(this.i18n.lang() === 'pt-BR' ? 'en' : 'pt-BR');
  }
}
