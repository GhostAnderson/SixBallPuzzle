import { THEMES } from '../themes/themes';

interface Props {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export default function ThemeSwitcher({ currentTheme, onThemeChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '0.5rem 0' }}>
      {THEMES.map(t => (
        <button key={t.name} onClick={() => onThemeChange(t.name)}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: currentTheme === t.name ? '#4444ff' : '#333', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
          {t.name}
        </button>
      ))}
    </div>
  );
}
