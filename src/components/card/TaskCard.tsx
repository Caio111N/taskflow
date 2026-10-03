// Apresenta um cartão simples e suas ações básicas na lista.
import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { Card } from '../../types';

/** Ações disponíveis no cartão dentro da lista de origem. */
export interface TaskCardProps {
  card: Card;
  listId: string;
  isDragDisabled?: boolean;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
}

/**
 * Renderiza o título do cartão e controles de edição e exclusão.
 *
 * @param props Cartão normalizado e callbacks da página.
 * @returns A representação do cartão dentro de sua lista.
 */
export const TaskCard = memo(function TaskCard({
  card,
  listId,
  isDragDisabled = false,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${card.id}`,
    data: { type: 'card', cardId: card.id, listId },
    disabled: isDragDisabled,
  });

  return (
    <article
      className={`group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-[border-color,box-shadow,transform] hover:border-indigo-200 hover:shadow-md ${isDragging ? 'z-10 opacity-40' : ''}`}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          aria-label={
            isDragDisabled
              ? `Arraste desativado para ${card.title} enquanto há filtros ativos`
              : `Mover cartão ${card.title}`
          }
          className={`mt-0.5 shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-700 ${isDragDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'}`}
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" size={15} />
        </button>
        <button
          className="min-w-0 flex-1 break-words text-left text-sm font-medium leading-5 text-slate-800 hover:text-indigo-700"
          onClick={() => onEdit(card)}
          type="button"
        >
          {card.title}
        </button>
        <div className="flex shrink-0 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            aria-label={`Editar cartão ${card.title}`}
            className="rounded-md p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
            onClick={() => onEdit(card)}
            type="button"
          >
            <Pencil aria-hidden="true" size={14} />
          </button>
          <button
            aria-label={`Excluir cartão ${card.title}`}
            className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => onDelete(card)}
            type="button"
          >
            <Trash2 aria-hidden="true" size={14} />
          </button>
        </div>
      </div>
    </article>
  );
});
