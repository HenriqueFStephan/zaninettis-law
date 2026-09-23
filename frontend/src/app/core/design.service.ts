import { Injectable, signal } from '@angular/core';

export type LayoutId = 'galeria' | 'indice' | 'lamina' | 'revista' | 'painel';
export type PaletteId = 'claro' | 'noite' | 'vinho' | 'marinho' | 'sinal';

export interface LayoutOption {
  id: LayoutId;
  name: string;
  nameEn: string;
  note: string;
  noteEn: string;
}

export interface PaletteOption {
  id: PaletteId;
  name: string;
  nameEn: string;
  ink: string;
  paper: string;
  seal: string;
  mute: string;
  line: string;
  surface: string;
}

const LAYOUT_KEY = 'zaninettis-layout';
const PALETTE_KEY = 'zaninettis-palette';

export const LAYOUTS: LayoutOption[] = [
  {
    id: 'galeria',
    name: 'Galeria',
    nameEn: 'Gallery',
    note: 'Foto em tela cheia, faixa de áreas e um mosaico.',
    noteEn: 'A full-bleed photo, a practice strip, and a mosaic.',
  },
  {
    id: 'indice',
    name: 'Índice',
    nameEn: 'Index',
    note: 'Abas empilhadas. A página aberta desce no meio.',
    noteEn: 'Stacked tabs. The open page drops down in the middle.',
  },
  {
    id: 'lamina',
    name: 'Lâmina',
    nameEn: 'Poster',
    note: 'Lajes escuras. A aba aberta desenrola o conteúdo.',
    noteEn: 'Dark slabs. The open tab unrolls the page.',
  },
  {
    id: 'revista',
    name: 'Revista',
    nameEn: 'Magazine',
    note: 'Capa com foto, três colunas e um índice no rodapé.',
    noteEn: 'A cover with a photo, three columns, and an index.',
  },
  {
    id: 'painel',
    name: 'Painel',
    nameEn: 'Panel',
    note: 'Trilho lateral e módulos alinhados.',
    noteEn: 'A side rail and aligned modules.',
  },
];

export const PALETTES: PaletteOption[] = [
  {
    id: 'claro',
    name: 'Claro',
    nameEn: 'Daylight',
    ink: '#142033',
    paper: '#f4f7fb',
    seal: '#1f4e79',
    mute: '#5c6b7c',
    line: '#d5deea',
    surface: '#ffffff',
  },
  {
    id: 'noite',
    name: 'Noite',
    nameEn: 'Night',
    ink: '#f4f0e6',
    paper: '#111111',
    seal: '#f5d90a',
    mute: '#b7b1a6',
    line: '#2c2c2c',
    surface: '#1b1b1b',
  },
  {
    id: 'vinho',
    name: 'Vinho',
    nameEn: 'Wine',
    ink: '#241416',
    paper: '#f6efe8',
    seal: '#8e1d2c',
    mute: '#6e585c',
    line: '#e4d4cc',
    surface: '#fffaf6',
  },
  {
    id: 'marinho',
    name: 'Marinho',
    nameEn: 'Navy',
    ink: '#0c1c33',
    paper: '#e7eef5',
    seal: '#b0893e',
    mute: '#516277',
    line: '#c9d6e4',
    surface: '#f7fafc',
  },
  {
    id: 'sinal',
    name: 'Sinal',
    nameEn: 'Signal',
    ink: '#161616',
    paper: '#ffffff',
    seal: '#d7263d',
    mute: '#5e5e5e',
    line: '#ececec',
    surface: '#fafafa',
  },
];

const LAYOUT_TYPE: Record<LayoutId, { display: string; text: string; mono: string }> = {
  galeria: {
    display: '"Manrope", "Segoe UI", sans-serif',
    text: '"Manrope", "Segoe UI", sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  indice: {
    display: '"Source Serif 4", "Times New Roman", serif',
    text: '"Source Sans 3", "Segoe UI", sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  lamina: {
    display: '"Anton", "Arial Narrow", sans-serif',
    text: '"Manrope", "Segoe UI", sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  revista: {
    display: '"Fraunces", "Times New Roman", serif',
    text: '"Outfit", "Segoe UI", sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  painel: {
    display: '"IBM Plex Sans", "Segoe UI", sans-serif',
    text: '"IBM Plex Sans", "Segoe UI", sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
};

function stored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof localStorage === 'undefined') {
    return fallback;
  }
  const value = localStorage.getItem(key) as T | null;
  return value && allowed.includes(value) ? value : fallback;
}

@Injectable({ providedIn: 'root' })
export class DesignService {
  readonly layout = signal<LayoutId>(stored(LAYOUT_KEY, LAYOUTS.map((item) => item.id), 'indice'));
  readonly palette = signal<PaletteId>(stored(PALETTE_KEY, PALETTES.map((item) => item.id), 'claro'));

  constructor() {
    this.apply();
  }

  setLayout(id: LayoutId): void {
    this.layout.set(id);
    localStorage.setItem(LAYOUT_KEY, id);
    this.apply();
  }

  setPalette(id: PaletteId): void {
    this.palette.set(id);
    localStorage.setItem(PALETTE_KEY, id);
    this.apply();
  }

  private apply(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const palette = PALETTES.find((item) => item.id === this.palette()) ?? PALETTES[0];
    const type = LAYOUT_TYPE[this.layout()];
    const root = document.documentElement;
    root.dataset['layout'] = this.layout();
    root.dataset['palette'] = palette.id;
    root.style.setProperty('--ink', palette.ink);
    root.style.setProperty('--paper', palette.paper);
    root.style.setProperty('--seal', palette.seal);
    root.style.setProperty('--mute', palette.mute);
    root.style.setProperty('--line', palette.line);
    root.style.setProperty('--surface', palette.surface);
    root.style.setProperty('--on-seal', onColor(palette.seal));
    root.style.setProperty('--display', type.display);
    root.style.setProperty('--text', type.text);
    root.style.setProperty('--mono', type.mono);
    root.style.setProperty('--serif', type.display);
    root.style.colorScheme = isDark(palette.paper) ? 'dark' : 'light';
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
