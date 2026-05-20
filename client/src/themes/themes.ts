export interface Theme {
  name: string;
  renderer: 'gradient' | 'solid' | 'emoji';
  emojiMap?: Record<string, string>;
}

export const THEMES: Theme[] = [
  { name: 'Vibrant', renderer: 'gradient' },
  { name: 'Flat', renderer: 'solid' },
  { name: 'Emoji', renderer: 'emoji', emojiMap: { red: '🍎', purple: '🍇', yellow: '⭐', blue: '🐳', green: '🐸' } },
];

export const BALL_COLORS_HEX: Record<string, string> = {
  red: '#ff3366',
  purple: '#8833ff',
  yellow: '#ffbb00',
  blue: '#3366ff',
  green: '#22bb55',
};

const DEFAULT_THEME = 'Vibrant';
const STORAGE_KEY = 'six-balls-theme';

export function getStoredTheme(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.some(t => t.name === stored)) return stored;
  } catch {}
  return DEFAULT_THEME;
}

export function storeTheme(name: string): void {
  try { localStorage.setItem(STORAGE_KEY, name); } catch {}
}
