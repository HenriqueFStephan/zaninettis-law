import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { DesignService } from '../../core/design.service';
import { ServiceOffering } from '../../core/models';
import { TranslatePipe } from '../../core/i18n';
import { MarkComponent } from '../../shared/mark/mark.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, MarkComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  private readonly shots = ['home.phRoom', 'home.phPages', 'home.phLibrary', 'home.phCity', 'home.phFacade'] as const;
  readonly marks = ['diamond', 'ring', 'bars', 'plus', 'arc'] as const;
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
    readonly design: DesignService,
  ) {}

  shot(index: number): string {
    return this.shots[index % this.shots.length];
  }

  ngOnInit(): void {
    this.api.getServices().subscribe({
      next: (items) => (this.services = items),
      error: () => (this.services = []),
    });
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
          this.notice = '—';
        },
      });
  }
}
