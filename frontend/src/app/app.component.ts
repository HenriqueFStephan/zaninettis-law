import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { DesignService } from './core/design.service';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isStudio = false;

  constructor(router: Router, _design: DesignService) {
    const sync = (): void => {
      const routed = router.url.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
      const here =
        typeof location !== 'undefined'
          ? location.pathname.split('?')[0].replace(/\/+$/, '') || '/'
          : '/';
      const path = routed === '/' && here !== '/' ? here : routed;
      this.isStudio = path === '/studio';
    };
    router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(sync);
    sync();
  }
}
