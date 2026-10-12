import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { ServiceOffering } from '../../core/models';
import { I18nService, reloadOnLang, TranslatePipe } from '../../core/i18n';
import { photoFor } from '../../core/photos';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent {
  private readonly shots = ['home.phRoom', 'home.phPages', 'home.phLibrary', 'home.phCity', 'home.phFacade'] as const;
  services: ServiceOffering[] = [];
  picked: string[] = [];
  name = '';
  email = '';
  company = '';
  message = '';
  sending = false;
  notice = '';

  constructor(
    private api: ApiService,
    private i18n: I18nService,
  ) {
    reloadOnLang(() => this.loadServices());
  }

  shot(index: number): string {
    return this.shots[index % this.shots.length];
  }

  photo(index: number): string {
    return photoFor(this.shot(index));
  }

  pick(id: string): void {
    this.picked = this.picked.includes(id) ? this.picked.filter((item) => item !== id) : [...this.picked, id];
  }

  send(): void {
    if (this.sending) {
      return;
    }
    this.sending = true;
    this.api
      .submitConsultingRequest({
        name: this.name,
        email: this.email,
        company: this.company,
        service_ids: this.picked,
        message: this.message,
      })
      .subscribe({
        next: (res) => {
          this.sending = false;
          this.notice = res.message;
        },
        error: () => {
          this.sending = false;
          this.notice = this.i18n.t('contact.error');
        },
      });
  }

  private loadServices(): void {
    this.api.getServices().subscribe({
      next: (items) => (this.services = items),
      error: () => (this.services = []),
    });
  }
}
