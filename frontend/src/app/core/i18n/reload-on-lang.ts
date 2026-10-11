import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { I18nService } from './i18n.service';

/** Re-run `load` whenever the site language changes (including the initial value). */
export function reloadOnLang(load: () => void): void {
  const i18n = inject(I18nService);
  const destroyRef = inject(DestroyRef);
  load();
  i18n.lang$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => load());
}
