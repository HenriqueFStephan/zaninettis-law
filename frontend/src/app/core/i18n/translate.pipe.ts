import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';

import { I18nService } from './i18n.service';
import { MsgKey } from './messages';

@Pipe({
  name: 't',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private readonly sub: Subscription;

  constructor(
    private i18n: I18nService,
    cdr: ChangeDetectorRef,
  ) {
    this.sub = this.i18n.lang$.subscribe(() => cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  transform(key: MsgKey | string, params?: Record<string, string | number>): string {
    this.i18n.lang();
    return this.i18n.t(key, params);
  }
}
