import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { I18nService } from './core/i18n';
import { DesignService } from './core/design.service';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <ng-container *ngIf="isStudio; else site">
      <router-outlet />
    </ng-container>
    <ng-template #site>
      <div class="frame" [attr.data-layout]="design.layout()">
        <app-header />
        <main>
          <router-outlet />
        </main>
        <app-footer />
      </div>
    </ng-template>
  `,
  styles: [`
    main { min-height: calc(100vh - 140px); }
    .frame[data-layout='galeria'] main { padding-top: 4.2rem; }
    .frame[data-layout='lamina'] {
      display: grid;
      grid-template-columns: 4.6rem minmax(0, 1fr);
    }
    .frame[data-layout='lamina'] app-header { grid-row: 1 / span 2; }
    .frame[data-layout='painel'] {
      display: grid;
      grid-template-columns: 12.5rem minmax(0, 1fr);
      min-height: 100vh;
    }
    .frame[data-layout='painel'] app-header { grid-row: 1 / span 2; }
    @media (max-width: 800px) {
      .frame[data-layout='lamina'],
      .frame[data-layout='painel'] { display: block; }
    }
  `],
})
export class AppComponent {
  isStudio = false;

  constructor(router: Router, _i18n: I18nService, readonly design: DesignService) {
    const sync = (): void => {
      const routed = router.url.split('?')[0].split('#')[0].replace(/\/+$/, '');
      const here =
        typeof location !== 'undefined'
          ? location.pathname.split('?')[0].replace(/\/+$/, '')
          : '';
      this.isStudio = routed === '/studio' || here === '/studio';
    };
    router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(sync);
    sync();
  }
}
