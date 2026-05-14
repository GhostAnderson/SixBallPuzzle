export interface Theme {
  name: string;
  renderer: 'gradient' | 'solid' | 'emoji';
  emojiMap?: Record<string, string>;
}

export const THEMES: Theme[] = [
  { name: 'Classic', renderer: 'gradient' },
  { name: 'Flat', renderer: 'solid' },
  { name: 'Emoji', renderer: 'emoji', emojiMap: { red: '🍎', purple: '🍇', yellow: '⭐', blue: '🐳', green: '🐸' } },
  { name: 'Fruit', renderer: 'emoji', emojiMap: { red: '🍎', purple: '🍇', yellow: '🍋', blue: '🫐', green: '🥝' } },
];

const DEFAULT_THEME = 'Classic';
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

export function getThemeEmojiMap(themeName: string): Record<string, string> | undefined {
  const theme = THEMES.find(t => t.name === themeName);
  return theme?.emojiMap;
}
