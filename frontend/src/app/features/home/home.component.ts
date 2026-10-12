import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MsgKey, TranslatePipe } from '../../core/i18n';
import { photoFor } from '../../core/photos';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  photo(key: string): string {
    return photoFor(key);
  }

  readonly areas: { key: MsgKey }[] = [
    { key: 'home.area.tributario' },
    { key: 'home.area.societario' },
    { key: 'home.area.contencioso' },
    { key: 'home.area.trabalhista' },
    { key: 'home.area.contratos' },
  ];
}
