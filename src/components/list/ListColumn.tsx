// Compõe cabeçalho, cartões arrastáveis e criação de cartão de uma lista.
import { memo, useState, type FormEvent } from 'react';
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import type { Card, List } from '../../types';
import { TaskCard } from '../card/TaskCard';
import { ListHeader } from './ListHeader';

/** Propriedades da coluna de lista e de suas operações. */
export interface ListColumnProps {
  list: List;
  cards: Card[];
  isFiltered?: boolean;
  onAddCard: (listId: string, title: string) => void;
  onEditList: (list: List) => void;
  onDeleteList: (list: List) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (card: Card) => void;
}

/**
 * Renderiza uma lista Kanban com cartões e formulário de criação inline.
 *
 * @param props Lista, cartões associados e operações delegadas à página.
 * @returns Uma coluna com cartões e botão para adicionar novo cartão.
 */
export const ListColumn = memo(function ListColumn({
  list,
  cards,
  isFiltered = false,
  onAddCard,
  onEditList,
  onDeleteList,
  onEditCard,
  onDeleteCard,
}: ListColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `list-${list.id}`,
    data: { type: 'list', listId: list.id },
  });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [formError, setFormError] = useState('');

  function handleAddCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = newCardTitle.trim();

    if (!normalizedTitle) {
      setFormError('Digite um título para o cartão.');
      return;
    }

    onAddCard(list.id, normalizedTitle);
    setNewCardTitle('');
    setFormError('');
    setIsAddingCard(false);
  }

  return (
    <section
      aria-label={`Lista ${list.title}`}
      className={`flex max-h-[calc(100vh-11rem)] w-72 shrink-0 flex-col rounded-2xl bg-slate-100 p-3 shadow-sm transition-shadow sm:w-80 ${isDragging ? 'z-10 opacity-60 shadow-xl' : ''}`}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <ListHeader
        cardCount={cards.length}
        dragHandleProps={{ attributes, listeners }}
        list={list}
        onDelete={onDeleteList}
        onRename={onEditList}
      />
      <SortableContext
        items={cards.map((card) => `card-${card.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-12 flex-1 space-y-2 overflow-y-auto px-0.5 pb-2">
          {cards.map((card) => (
            <TaskCard
              card={card}
              isDragDisabled={isFiltered}
              key={card.id}
              listId={list.id}
              onDelete={onDeleteCard}
              onEdit={onEditCard}
            />
          ))}
          {cards.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-500">
              {isFiltered
                ? 'Nenhum cartão corresponde aos filtros'
                : 'Nenhum cartão nesta lista'}
            </p>
          ) : null}
        </div>
      </SortableContext>
      {isAddingCard ? (
        <form className="mt-2 grid gap-2" onSubmit={handleAddCard}>
          <label className="sr-only" htmlFor={`new-card-${list.id}`}>
            Título do cartão
          </label>
          <input
            autoFocus
            className="min-h-10 rounded-lg border border-indigo-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            id={`new-card-${list.id}`}
            maxLength={100}
            onChange={(event) => {
              setNewCardTitle(event.target.value);
              if (formError) {
                setFormError('');
              }
            }}
            placeholder="Título do cartão"
            value={newCardTitle}
          />
          {formError ? (
            <p className="text-xs text-rose-700" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              className="min-h-9 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700"
              type="submit"
            >
              Adicionar cartão
            </button>
            <button
              className="min-h-9 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              onClick={() => {
                setNewCardTitle('');
                setFormError('');
                setIsAddingCard(false);
              }}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          className="mt-2 flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-indigo-700"
          onClick={() => setIsAddingCard(true)}
          type="button"
        >
          <Plus aria-hidden="true" size={17} />
          Adicionar cartão
        </button>
      )}
    </section>
  );
});
