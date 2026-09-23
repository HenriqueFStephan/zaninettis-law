import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DesignService, LAYOUTS, PALETTES } from '../../core/design.service';
import { I18nService, TranslatePipe } from '../../core/i18n';

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
  readonly layouts = LAYOUTS;
  readonly palettes = PALETTES;
  readonly areas: Area[] = [
    { n: '01', name: 'Societário' },
    { n: '02', name: 'Contencioso' },
    { n: '03', name: 'Contratos' },
    { n: '04', name: 'Trabalhista' },
    { n: '05', name: 'Tributário' },
  ];

  constructor(
    readonly design: DesignService,
    readonly i18n: I18nService,
  ) {}

  layoutName(id: string): string {
    const item = this.layouts.find((layout) => layout.id === id);
    if (!item) {
      return id;
    }
    return this.i18n.lang() === 'en' ? item.nameEn : item.name;
  }

  layoutNote(id: string): string {
    const item = this.layouts.find((layout) => layout.id === id);
    if (!item) {
      return '';
    }
    return this.i18n.lang() === 'en' ? item.noteEn : item.note;
  }

  paletteName(id: string): string {
    const item = this.palettes.find((palette) => palette.id === id);
    if (!item) {
      return id;
    }
    return this.i18n.lang() === 'en' ? item.nameEn : item.name;
  }
}
