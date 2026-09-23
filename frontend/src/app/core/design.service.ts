import { Injectable, signal } from '@angular/core';

export type LayoutId = 'indice' | 'portico' | 'dossie' | 'atlas' | 'carta';
export type PaletteId = 'tinta' | 'laje' | 'noite' | 'argila' | 'biblioteca';

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
    id: 'indice',
    name: 'Índice',
    nameEn: 'Index',
    note: 'Coluna de identidade e lista numerada.',
    noteEn: 'Identity column and a numbered list.',
  },
  {
    id: 'portico',
    name: 'Pórtico',
    nameEn: 'Portico',
    note: 'Uma frase em tela cheia e uma faixa de áreas.',
    noteEn: 'A full-screen line and a practice rail.',
  },
  {
    id: 'dossie',
    name: 'Dossiê',
    nameEn: 'Dossier',
    note: 'Manifesto à esquerda e notas empilhadas.',
    noteEn: 'A statement on the left, stacked notes on the right.',
  },
  {
    id: 'atlas',
    name: 'Atlas',
    nameEn: 'Atlas',
    note: 'Grade de áreas, sem herói.',
    noteEn: 'A grid of practices, no hero.',
  },
  {
    id: 'carta',
    name: 'Carta',
    nameEn: 'Letter',
    note: 'Coluna estreita, como uma carta.',
    noteEn: 'A narrow column, like a letter.',
  },
];

export const PALETTES: PaletteOption[] = [
  {
    id: 'tinta',
    name: 'Tinta',
    nameEn: 'Ink',
    ink: '#1a1814',
    paper: '#f4efe6',
    seal: '#8c3a2f',
    mute: '#6f675f',
    line: '#e4dcd0',
    surface: '#fbf8f3',
  },
  {
    id: 'laje',
    name: 'Laje',
    nameEn: 'Slate',
    ink: '#1c2830',
    paper: '#eef2f4',
    seal: '#8d7344',
    mute: '#5e6b73',
    line: '#d5dee3',
    surface: '#f7f9fa',
  },
  {
    id: 'noite',
    name: 'Noite',
    nameEn: 'Night',
    ink: '#10182a',
    paper: '#f6f3ee',
    seal: '#b8733a',
    mute: '#5c6574',
    line: '#e3ddd4',
    surface: '#fbf9f6',
  },
  {
    id: 'argila',
    name: 'Argila',
    nameEn: 'Clay',
    ink: '#2a221e',
    paper: '#f6efe8',
    seal: '#c45c3e',
    mute: '#7a6a60',
    line: '#eadfd4',
    surface: '#fbf6f1',
  },
  {
    id: 'biblioteca',
    name: 'Biblioteca',
    nameEn: 'Library',
    ink: '#1e2924',
    paper: '#f5f2ea',
    seal: '#8a6232',
    mute: '#667068',
    line: '#e2ddd2',
    surface: '#faf8f3',
  },
];

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
  readonly palette = signal<PaletteId>(stored(PALETTE_KEY, PALETTES.map((item) => item.id), 'tinta'));

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
    const root = document.documentElement;
    root.dataset['layout'] = this.layout();
    root.dataset['palette'] = palette.id;
    root.style.setProperty('--ink', palette.ink);
    root.style.setProperty('--paper', palette.paper);
    root.style.setProperty('--seal', palette.seal);
    root.style.setProperty('--mute', palette.mute);
    root.style.setProperty('--line', palette.line);
    root.style.setProperty('--surface', palette.surface);
  }
}
