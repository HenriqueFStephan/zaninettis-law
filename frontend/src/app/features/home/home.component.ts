import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../core/i18n';

interface Area {
  n: string;
  name: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  readonly areas: Area[] = [
    { n: '01', name: 'Societário' },
    { n: '02', name: 'Contencioso' },
    { n: '03', name: 'Contratos' },
    { n: '04', name: 'Trabalhista' },
    { n: '05', name: 'Tributário' },
  ];
}
