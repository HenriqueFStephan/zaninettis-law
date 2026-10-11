import { Injectable } from '@angular/core';

export type LayoutId = 'galeria';
export type PaletteId = 'claro';

const LAYOUT_KEY = 'zaninettis-layout';
const PALETTE_KEY = 'zaninettis-palette';

const CLARO = {
  ink: '#142033',
  paper: '#f4f7fb',
  seal: '#1f4e79',
  mute: '#5c6b7c',
  line: '#d5deea',
  surface: '#ffffff',
} as const;

const GALERIA_TYPE = {
  display: '"Manrope", "Segoe UI", sans-serif',
  text: '"Manrope", "Segoe UI", sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
} as const;

@Injectable({ providedIn: 'root' })
export class DesignService {
  readonly layout: LayoutId = 'galeria';
  readonly palette: PaletteId = 'claro';

  constructor() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LAYOUT_KEY);
      localStorage.removeItem(PALETTE_KEY);
    }
    this.apply();
  }

  private apply(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.dataset['layout'] = this.layout;
    root.dataset['palette'] = this.palette;
    root.style.setProperty('--ink', CLARO.ink);
    root.style.setProperty('--paper', CLARO.paper);
    root.style.setProperty('--seal', CLARO.seal);
    root.style.setProperty('--mute', CLARO.mute);
    root.style.setProperty('--line', CLARO.line);
    root.style.setProperty('--surface', CLARO.surface);
    root.style.setProperty('--on-seal', onColor(CLARO.seal));
    root.style.setProperty('--display', GALERIA_TYPE.display);
    root.style.setProperty('--text', GALERIA_TYPE.text);
    root.style.setProperty('--mono', GALERIA_TYPE.mono);
    root.style.setProperty('--serif', GALERIA_TYPE.display);
    root.style.colorScheme = 'light';
  }
}

function channel(hex: string, shift: number): number {
  const raw = parseInt(hex.slice(1 + shift, 3 + shift), 16) / 255;
  return raw <= 0.03928 ? raw / 12.92 : ((raw + 0.055) / 1.055) ** 2.4;
}

function isDark(hex: string): boolean {
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 2) + 0.0722 * channel(hex, 4) < 0.4;
}

function onColor(hex: string): string {
  return isDark(hex) ? '#f7f4ee' : '#161616';
}
