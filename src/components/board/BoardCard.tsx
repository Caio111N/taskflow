// Apresenta um quadro e suas ações de edição e remoção na página inicial.
import { memo } from 'react';
import {
  CalendarDays,
  MoreHorizontal,
  SquareArrowOutUpRight,
} from 'lucide-react';
import type { Board } from '../../types';

/** Ações disponibilizadas no cartão de quadro. */
export interface BoardCardProps {
  board: Board;
  onOpen: (board: Board) => void;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
}

/**
 * Renderiza a prévia de um quadro com ações explícitas e acessíveis.
 *
 * @param props Quadro e callbacks para edição e exclusão.
 * @returns Um cartão de quadro da página inicial.
 */
export const BoardCard = memo(function BoardCard({
  board,
  onOpen,
  onEdit,
  onDelete,
}: BoardCardProps) {
  const createdAt = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(board.createdAt));

  return (
    <article className="group relative min-h-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div
        aria-hidden="true"
        className="h-32"
        style={{
          background: `linear-gradient(135deg, ${board.background}, ${board.background}cc)`,
        }}
      />
      <div className="p-4">
        <button
          className="max-w-full truncate text-left text-lg font-bold text-slate-900 hover:text-indigo-700"
          onClick={() => onOpen(board)}
          type="button"
        >
          {board.title}
        </button>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays aria-hidden="true" size={14} />
          Criado em {createdAt}
        </p>
        <button
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          onClick={() => onOpen(board)}
          type="button"
        >
          Abrir quadro
          <SquareArrowOutUpRight aria-hidden="true" size={14} />
        </button>
      </div>
      <div className="absolute right-3 top-3 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          aria-label={`Editar quadro ${board.title}`}
          className="rounded-lg bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-white hover:text-indigo-700"
          onClick={() => onEdit(board)}
          type="button"
        >
          <MoreHorizontal aria-hidden="true" size={18} />
        </button>
        <button
          aria-label={`Excluir quadro ${board.title}`}
          className="rounded-lg bg-white/95 px-2.5 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-white"
          onClick={() => onDelete(board)}
          type="button"
        >
          Excluir
        </button>
      </div>
    </article>
  );
});
