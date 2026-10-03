// Permite alternar entre os temas claro e escuro persistidos na aplicação.
import { Moon, Sun } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { Button } from './Button';

/**
 * Renderiza o controle acessível de alternância do tema visual.
 *
 * @returns Um botão que alterna entre os temas claro e escuro.
 */
export function ThemeToggle() {
  const theme = useBoardStore((state) => state.theme);
  const setTheme = useBoardStore((state) => state.setTheme);
  const isDark = theme === 'dark';

  return (
    <Button
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      variant="secondary"
    >
      {isDark ? (
        <Sun aria-hidden="true" size={17} />
      ) : (
        <Moon aria-hidden="true" size={17} />
      )}
      <span className="hidden sm:inline">
        {isDark ? 'Tema claro' : 'Tema escuro'}
      </span>
    </Button>
  );
}
