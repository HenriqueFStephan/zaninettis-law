import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <section class="shell page-intro">
      <p class="kicker">{{ 'nav.contact' | t }}</p>
      <h1 class="serif">{{ 'nav.contact' | t }}</h1>
      <p>{{ 'page.pending' | t }}</p>
      <form (ngSubmit)="send()">
        <label>{{ 'contact.name' | t }}<input name="name" [(ngModel)]="name" required /></label>
        <label>{{ 'contact.email' | t }}<input type="email" name="email" [(ngModel)]="email" required /></label>
        <label>{{ 'contact.subject' | t }}<input name="subject" [(ngModel)]="subject" required /></label>
        <label>{{ 'contact.message' | t }}<textarea name="message" [(ngModel)]="message" required minlength="10"></textarea></label>
        <button class="btn" type="submit" [disabled]="sending">{{ sending ? ('contact.sending' | t) : ('contact.send' | t) }}</button>
        <p *ngIf="notice">{{ notice }}</p>
      </form>
    </section>
  `,
  styles: [`
    form { display: grid; gap: 0.8rem; max-width: 32rem; margin-top: 1.5rem; }
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
export class ContactComponent {
  name = '';
  email = '';
  subject = '';
  message = '';
  sending = false;
  notice = '';

  constructor(private api: ApiService) {}

  send(): void {
    if (this.sending) {
      return;
    }
    this.sending = true;
    this.api
      .submitContact({
        name: this.name,
        email: this.email,
        subject: this.subject,
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
