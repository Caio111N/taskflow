// Oferece um botão reutilizável com estados e variações visuais consistentes.
import type { ButtonHTMLAttributes, ReactNode } from 'react';

/** Variações visuais disponíveis para botões genéricos. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Propriedades do botão acessível e reutilizável. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 disabled:text-slate-400',
  danger:
    'bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:bg-rose-300',
};

/**
 * Renderiza um botão com estilo de ação e foco visível.
 *
 * @param props Propriedades nativas do botão, variação e conteúdo.
 * @returns Um botão HTML estilizado.
 */
export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
