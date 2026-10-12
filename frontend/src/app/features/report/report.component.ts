import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { TranslatePipe } from '../../core/i18n';
import { renderReportMarkdown } from './report-markdown';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit {
  html: SafeHtml | null = null;
  missing = false;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.http.get(`assets/reports/latest.md?t=${Date.now()}`, { responseType: 'text' }).subscribe({
      next: (markdown) => {
        this.html = this.sanitizer.bypassSecurityTrustHtml(renderReportMarkdown(markdown));
      },
      error: () => {
        this.missing = true;
      },
    });
  }
}
