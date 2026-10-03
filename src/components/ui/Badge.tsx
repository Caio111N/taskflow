// Exibe informações curtas em uma etiqueta visual compacta.
import type { HTMLAttributes, ReactNode } from 'react';

/** Propriedades de conteúdo e cor para a etiqueta genérica. */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  color?: string;
}

/**
 * Renderiza uma etiqueta com fundo suave e contraste de texto automático.
 *
 * @param props Texto, cor de destaque e atributos HTML adicionais.
 * @returns Uma etiqueta semântica inline.
 */
export function Badge({
  children,
  color = '#e0e7ff',
  className = '',
  style,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-slate-800 ${className}`}
      style={{ backgroundColor: color, ...style }}
      {...props}
    >
      {children}
    </span>
  );
}
