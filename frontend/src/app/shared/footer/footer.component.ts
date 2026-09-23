import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { DesignService } from '../../core/design.service';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  constructor(readonly design: DesignService) {}
}
