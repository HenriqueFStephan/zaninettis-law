import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { ServiceOffering } from '../../core/models';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <section class="shell page-intro">
      <p class="kicker">{{ 'nav.services' | t }}</p>
      <h1 class="serif">{{ 'nav.services' | t }}</h1>
      <p>{{ 'page.pending' | t }}</p>
      <div class="list" *ngIf="services.length">
        <article *ngFor="let service of services">
          <h2>{{ service.title }}</h2>
          <p>{{ service.description }}</p>
          <ul>
            <li *ngFor="let item of service.highlights">{{ item }}</li>
          </ul>
          <button type="button" (click)="pick(service.id)">{{ 'services.inquire' | t }}</button>
        </article>
      </div>
      <form *ngIf="picked.length" (ngSubmit)="send()">
        <h2 class="serif">{{ 'services.inquire' | t }}</h2>
        <label>{{ 'contact.name' | t }}<input name="name" [(ngModel)]="name" required /></label>
        <label>{{ 'contact.email' | t }}<input type="email" name="email" [(ngModel)]="email" required /></label>
        <label>{{ 'contact.company' | t }}<input name="company" [(ngModel)]="company" /></label>
        <label>{{ 'contact.message' | t }}<textarea name="message" [(ngModel)]="message" required minlength="10"></textarea></label>
        <button class="btn" type="submit" [disabled]="sending">{{ sending ? ('contact.sending' | t) : ('contact.send' | t) }}</button>
        <p *ngIf="notice">{{ notice }}</p>
      </form>
    </section>
  `,
  styles: [`
    .list { display: grid; gap: 1rem; margin: 2rem 0; }
    article, form {
      padding: 1.25rem 0;
      border-top: 1px solid var(--line);
    }
    h2 { margin: 0 0 0.4rem; font-size: 1.8rem; }
    ul { padding-left: 1.1rem; color: var(--mute); }
    button[type="button"] {
      border: 0;
      background: transparent;
      color: var(--seal);
      cursor: pointer;
      padding: 0;
    }
    form { display: grid; gap: 0.8rem; max-width: 32rem; }
    label { display: grid; gap: 0.3rem; }
    input, textarea {
      padding: 0.7rem 0.8rem;
      border: 1px solid var(--line);
      background: var(--surface);
      color: var(--ink);
    }
    textarea { min-height: 8rem; }
  `],
})
export class ServicesComponent implements OnInit {
  services: ServiceOffering[] = [];
  picked: string[] = [];
  name = '';
  email = '';
  company = '';
  message = '';
  sending = false;
  notice = '';

  constructor(private api: ApiService) {}

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
