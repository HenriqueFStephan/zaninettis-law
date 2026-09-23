import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { DesignService } from '../../core/design.service';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  name = '';
  email = '';
  subject = '';
  message = '';
  sending = false;
  notice = '';

  constructor(
    private api: ApiService,
    readonly design: DesignService,
  ) {}

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
