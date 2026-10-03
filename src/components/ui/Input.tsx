// Encapsula campos de texto com rótulos, ajuda e mensagens acessíveis.
import type { InputHTMLAttributes } from 'react';

/** Propriedades de um campo de texto genérico com rótulo visível. */
export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id'
> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

/**
 * Renderiza um campo de entrada associado a rótulo e mensagens auxiliares.
 *
 * @param props Identificador, rótulo, mensagens e propriedades do input nativo.
 * @returns Um campo de entrada com feedback acessível.
 */
export function Input({
  id,
  label,
  error,
  hint,
  className = '',
  ...props
}: InputProps) {
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={message ? messageId : undefined}
        aria-invalid={error ? true : undefined}
        className={`min-h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${error ? 'border-rose-400' : 'border-slate-200'} ${className}`}
        id={id}
        {...props}
      />
      {message ? (
        <p
          className={`text-xs ${error ? 'text-rose-600' : 'text-slate-500'}`}
          id={messageId}
          role={error ? 'alert' : undefined}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
