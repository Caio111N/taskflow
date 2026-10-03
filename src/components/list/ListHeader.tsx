// Mostra o nome e as ações de gerenciamento de uma lista.
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { List } from '../../types';

/** Propriedades necessárias para iniciar a reordenação pelo teclado ou ponteiro. */
export interface DragHandleProps {
  attributes: DraggableAttributes;
  listeners?: SyntheticListenerMap;
}

/** Propriedades da faixa de título de uma lista. */
export interface ListHeaderProps {
  list: List;
  cardCount?: number;
  dragHandleProps: DragHandleProps;
  onRename: (list: List) => void;
  onDelete: (list: List) => void;
}

/**
 * Renderiza o título da lista e botões acessíveis para renomear ou excluir.
 *
 * @param props Lista atual e callbacks de gerenciamento.
 * @returns O cabeçalho visual da lista.
 */
export function ListHeader({
  list,
  cardCount = list.cardIds.length,
  dragHandleProps,
  onRename,
  onDelete,
}: ListHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-2 px-1 pb-3">
      <button
        aria-label={`Mover lista ${list.title}`}
        className="cursor-grab rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 active:cursor-grabbing"
        type="button"
        {...dragHandleProps.attributes}
        {...dragHandleProps.listeners}
      >
        <GripVertical aria-hidden="true" size={16} />
      </button>
      <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">
        {list.title}
      </h2>
      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
        {cardCount}
      </span>
      <div className="flex shrink-0 items-center">
        <button
          aria-label={`Renomear lista ${list.title}`}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-indigo-700"
          onClick={() => onRename(list)}
          type="button"
        >
          <Pencil aria-hidden="true" size={15} />
        </button>
        <button
          aria-label={`Excluir lista ${list.title}`}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-100 hover:text-rose-700"
          onClick={() => onDelete(list)}
          type="button"
        >
          <Trash2 aria-hidden="true" size={15} />
        </button>
      </div>
    </header>
  );
}
