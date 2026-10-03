// Exibe e gerencia listas e cartões do quadro, incluindo busca e filtros.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { ArrowLeft, LayoutGrid, Search, X } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ListColumn } from '../components/list/ListColumn';
import { AddListForm } from '../components/list/AddListForm';
import { CardModal } from '../components/card/CardModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useBoardStore } from '../store/boardStore';
import type { Card, List } from '../types';
import { NotFoundPage } from './NotFoundPage';

type EditableEntity =
  | { kind: 'list'; id: string; title: string }
  | { kind: 'card'; id: string; title: string };

type DeletableEntity =
  | { kind: 'list'; id: string; title: string }
  | { kind: 'card'; id: string; title: string };

type DragItemData =
  | { type: 'list'; listId: string }
  | { type: 'card'; cardId: string; listId: string };

type DueDateFilter = 'all' | 'overdue' | 'upcoming' | 'none';

/**
 * Verifica se um valor corresponde às opções de filtro de vencimento.
 *
 * @param value Valor recebido pelo campo de seleção.
 * @returns Se o valor é uma opção conhecida.
 */
function isDueDateFilter(value: string): value is DueDateFilter {
  return ['all', 'overdue', 'upcoming', 'none'].includes(value);
}

/**
 * Normaliza texto para buscas sem diferenciar maiúsculas ou acentos.
 *
 * @param value Texto de origem.
 * @returns Texto em minúsculas sem marcas diacríticas.
 */
function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();
}

/**
 * Retorna uma chave de data local no formato YYYY-MM-DD.
 *
 * @param date Data a ser convertida.
 * @returns Data local formatada para comparação com vencimentos.
 */
function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Verifica metadados de arraste sem confiar nos dados dinâmicos do DnD.
 *
 * @param value Dados associados a um elemento arrastável.
 * @returns Se o valor contém o tipo e os identificadores esperados.
 */
function isDragItemData(value: unknown): value is DragItemData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    (data.type === 'list' || data.type === 'card') &&
    typeof data.listId === 'string' &&
    (data.type === 'list' || typeof data.cardId === 'string')
  );
}

/**
 * Move o alvo do teclado para o droppable mais próximo na direção solicitada.
 *
 * @param event Tecla de direção pressionada durante o arraste.
 * @param args Estado geométrico e alvos registrados pelo DndContext.
 * @returns Coordenadas que levam o item ao alvo mais próximo naquela direção.
 */
const boardKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
  const directionByKey: Record<string, 'left' | 'right' | 'up' | 'down'> = {
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
  };
  const direction = directionByKey[event.code];
  const active = args.context.active;
  const activeRect = args.context.collisionRect;

  if (
    !direction ||
    !active ||
    !activeRect ||
    !isDragItemData(active.data.current)
  ) {
    return undefined;
  }

  const activeData = active.data.current;
  const activeCenterX = activeRect.left + activeRect.width / 2;
  const activeCenterY = activeRect.top + activeRect.height / 2;
  const horizontal = direction === 'left' || direction === 'right';
  const sign = direction === 'right' || direction === 'down' ? 1 : -1;

  const candidates = args.context.droppableContainers
    .getEnabled()
    .filter((container) => {
      if (container.id === active.id) {
        return false;
      }

      const data = container.data.current;
      if (!isDragItemData(data)) {
        return false;
      }

      if (activeData.type === 'list') {
        return data.type === 'list';
      }

      return horizontal
        ? data.listId !== activeData.listId
        : data.type === 'card' && data.listId === activeData.listId;
    })
    .map((container) => {
      const rect = args.context.droppableRects.get(container.id);
      if (!rect) {
        return null;
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const primaryDistance = horizontal
        ? (centerX - activeCenterX) * sign
        : (centerY - activeCenterY) * sign;

      if (primaryDistance <= 1) {
        return null;
      }

      const crossDistance = horizontal
        ? Math.abs(centerY - activeCenterY)
        : Math.abs(centerX - activeCenterX);

      return { centerX, centerY, primaryDistance, crossDistance };
    })
    .filter(
      (
        candidate,
      ): candidate is {
        centerX: number;
        centerY: number;
        primaryDistance: number;
        crossDistance: number;
      } => candidate !== null,
    )
    .sort(
      (first, second) =>
        first.primaryDistance - second.primaryDistance ||
        first.crossDistance - second.crossDistance,
    );
  const target = candidates[0];

  if (!target) {
    return undefined;
  }

  return {
    x: args.currentCoordinates.x + target.centerX - activeCenterX,
    y: args.currentCoordinates.y + target.centerY - activeCenterY,
  };
};

/**
 * Evita que o item arrastado seja considerado o próprio destino da colisão.
 *
 * @param args Geometria e alvos registrados pelo contexto de arraste.
 * @returns Colisões ordenadas sem incluir o item ativo.
 */
function detectBoardCollision(args: Parameters<typeof closestCorners>[0]) {
  return closestCorners({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (container) => container.id !== args.active.id,
    ),
  });
}

/**
 * Renderiza listas e cartões do quadro com reordenação por ponteiro e teclado.
 *
 * @returns A tela do quadro ou a página de não encontrado.
 */
export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const board = useBoardStore((state) =>
    boardId ? state.boards[boardId] : undefined,
  );
  const listRecords = useBoardStore((state) => state.lists);
  const cardRecords = useBoardStore((state) => state.cards);
  const createList = useBoardStore((state) => state.createList);
  const renameList = useBoardStore((state) => state.renameList);
  const deleteList = useBoardStore((state) => state.deleteList);
  const createCard = useBoardStore((state) => state.createCard);
  const updateCard = useBoardStore((state) => state.updateCard);
  const createLabel = useBoardStore((state) => state.createLabel);
  const addLabelToCard = useBoardStore((state) => state.addLabelToCard);
  const toggleCardLabel = useBoardStore((state) => state.toggleCardLabel);
  const addChecklistItem = useBoardStore((state) => state.addChecklistItem);
  const toggleChecklistItem = useBoardStore(
    (state) => state.toggleChecklistItem,
  );
  const deleteChecklistItem = useBoardStore(
    (state) => state.deleteChecklistItem,
  );
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const reorderLists = useBoardStore((state) => state.reorderLists);
  const moveCard = useBoardStore((state) => state.moveCard);

  const [editingList, setEditingList] = useState<EditableEntity | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [deletingEntity, setDeletingEntity] = useState<DeletableEntity | null>(
    null,
  );
  const [editTitle, setEditTitle] = useState('');
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [labelFilterId, setLabelFilterId] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>('all');
  const [dragOverlay, setDragOverlay] = useState<{
    kind: 'list' | 'card';
    title: string;
  } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: boardKeyboardCoordinates,
    }),
  );

  const lists = useMemo(
    () =>
      board
        ? board.listIds
            .map((listId) => listRecords[listId])
            .filter((list): list is List => Boolean(list))
        : [],
    [board, listRecords],
  );
  const normalizedSearchTerm = normalizeSearchText(searchTerm.trim());
  const today = getLocalDateKey(new Date());
  const hasActiveFilters =
    Boolean(normalizedSearchTerm) ||
    Boolean(labelFilterId) ||
    dueDateFilter !== 'all';

  const filteredCardsByList = useMemo(
    () =>
      new Map(
        lists.map((list) => {
          const cards = list.cardIds
            .map((cardId) => cardRecords[cardId])
            .filter((card): card is Card => Boolean(card))
            .filter((card) => {
              const matchesSearch =
                !normalizedSearchTerm ||
                normalizeSearchText(
                  `${card.title} ${card.description ?? ''}`,
                ).includes(normalizedSearchTerm);
              const matchesLabel =
                !labelFilterId || card.labelIds.includes(labelFilterId);
              const dueDate = card.dueDate?.slice(0, 10);
              const matchesDueDate = (() => {
                if (dueDateFilter === 'all') {
                  return true;
                }
                if (dueDateFilter === 'none') {
                  return !dueDate;
                }
                if (!dueDate) {
                  return false;
                }
                return dueDateFilter === 'overdue'
                  ? dueDate < today
                  : dueDate >= today;
              })();

              return matchesSearch && matchesLabel && matchesDueDate;
            });

          return [list.id, cards] as const;
        }),
      ),
    [
      cardRecords,
      dueDateFilter,
      labelFilterId,
      lists,
      normalizedSearchTerm,
      today,
    ],
  );
  const visibleCardCount = Array.from(filteredCardsByList.values()).reduce(
    (count, cards) => count + cards.length,
    0,
  );

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.matches('input, textarea, select, [role="textbox"]'));

      if (event.key === '/' && !isEditableTarget) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [hasActiveFilters]);

  const closeEditDialog = useCallback(() => {
    setEditingList(null);
    setFormError('');
  }, []);

  const closeCardModal = useCallback(() => setActiveCardId(null), []);
  const closeDeleteDialog = useCallback(() => setDeletingEntity(null), []);

  const openEditList = useCallback((list: List) => {
    setEditingList({ kind: 'list', id: list.id, title: list.title });
    setEditTitle(list.title);
    setFormError('');
  }, []);

  const openEditCard = useCallback((card: Card) => {
    setActiveCardId(card.id);
  }, []);

  const handleCreateList = useCallback(
    (title: string) => {
      if (boardId) {
        createList(boardId, title);
      }
    },
    [boardId, createList],
  );

  const handleCreateCard = useCallback(
    (listId: string, title: string) => {
      createCard(listId, title);
    },
    [createCard],
  );

  const handleEditSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const normalizedTitle = editTitle.trim();

      if (!normalizedTitle) {
        setFormError('O título não pode ficar vazio.');
        return;
      }

      if (editingList?.kind === 'list') {
        renameList(editingList.id, normalizedTitle);
      }

      closeEditDialog();
    },
    [closeEditDialog, editTitle, editingList, renameList],
  );

  const handleDelete = useCallback(() => {
    if (!deletingEntity || !boardId) {
      return;
    }

    if (deletingEntity.kind === 'list') {
      deleteList(boardId, deletingEntity.id);
    } else {
      deleteCard(deletingEntity.id);
    }

    setDeletingEntity(null);
  }, [boardId, deleteCard, deleteList, deletingEntity]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current;
      if (!isDragItemData(data)) {
        return;
      }

      const title =
        data.type === 'list'
          ? listRecords[data.listId]?.title
          : data.cardId
            ? cardRecords[data.cardId]?.title
            : undefined;
      setDragOverlay({ kind: data.type, title: title ?? '' });
    },
    [cardRecords, listRecords],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragOverlay(null);
      const { active, over } = event;

      if (!over || active.id === over.id || !boardId) {
        return;
      }

      const activeData = active.data.current;
      const overData = over.data.current;
      if (!isDragItemData(activeData) || !isDragItemData(overData)) {
        return;
      }

      if (activeData.type === 'list' && overData.type === 'list') {
        reorderLists(boardId, activeData.listId, overData.listId);
        return;
      }

      if (activeData.type !== 'card') {
        return;
      }

      const destinationListId = overData.listId;
      const destinationList = useBoardStore.getState().lists[destinationListId];
      if (!destinationList) {
        return;
      }

      // Soltar sobre um cartão insere antes dele; sobre a coluna, envia ao final.
      const destinationIndex =
        overData.type === 'card'
          ? destinationList.cardIds.indexOf(overData.cardId)
          : destinationList.cardIds.length;

      moveCard(
        activeData.listId,
        destinationListId,
        activeData.cardId,
        destinationIndex,
      );
    },
    [boardId, moveCard, reorderLists],
  );

  const handleDragCancel = useCallback(() => setDragOverlay(null), []);
  const activeCard = activeCardId ? (cardRecords[activeCardId] ?? null) : null;

  if (!board) {
    return <NotFoundPage />;
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header
        className="shrink-0 px-5 py-4 text-white sm:px-8"
        style={{
          background: `linear-gradient(110deg, ${board.background}, ${board.background}dd)`,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <Link
            aria-label="Voltar aos quadros"
            className="rounded-xl p-2 text-white transition hover:bg-white/15"
            to="/"
          >
            <ArrowLeft aria-hidden="true" size={20} />
          </Link>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <LayoutGrid aria-hidden="true" size={18} />
          </span>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold sm:text-xl">
            {board.title}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Button
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => navigate('/')}
              variant="secondary"
            >
              <ArrowLeft aria-hidden="true" className="sm:hidden" size={16} />
              <span className="hidden sm:inline">Todos os quadros</span>
            </Button>
          </div>
        </div>
      </header>

      {lists.length === 0 ? (
        <section className="m-5 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center sm:m-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <LayoutGrid aria-hidden="true" size={24} />
          </span>
          <h2 className="mt-5 text-lg font-bold">Seu quadro está pronto</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
            Crie a primeira lista para dividir o trabalho em etapas e começar a
            adicionar cartões.
          </p>
          <div className="mt-5">
            <AddListForm onAdd={handleCreateList} />
          </div>
        </section>
      ) : (
        <DndContext
          collisionDetection={detectBoardCollision}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <section
            aria-label="Buscar e filtrar cartões"
            className="mx-5 mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mx-8 sm:grid-cols-[minmax(14rem,1fr)_minmax(12rem,0.7fr)_minmax(12rem,0.7fr)_auto] sm:items-end"
          >
            <div className="grid gap-1.5">
              <label
                className="text-xs font-semibold text-slate-700"
                htmlFor="board-card-search"
              >
                Buscar cartões
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  aria-keyshortcuts="/"
                  className="min-h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  id="board-card-search"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape' && hasActiveFilters) {
                      event.preventDefault();
                      setSearchTerm('');
                      setLabelFilterId('');
                      setDueDateFilter('all');
                    }
                  }}
                  placeholder="Título ou descrição"
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                />
              </div>
              <span className="text-xs text-slate-500">
                Atalho:{' '}
                <kbd className="rounded border border-slate-200 px-1">/</kbd>
              </span>
            </div>
            <div className="grid gap-1.5">
              <label
                className="text-xs font-semibold text-slate-700"
                htmlFor="board-label-filter"
              >
                Etiqueta
              </label>
              <select
                className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                id="board-label-filter"
                onChange={(event) => setLabelFilterId(event.target.value)}
                value={labelFilterId}
              >
                <option value="">Todas as etiquetas</option>
                {board.labels.map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label
                className="text-xs font-semibold text-slate-700"
                htmlFor="board-due-date-filter"
              >
                Vencimento
              </label>
              <select
                className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                id="board-due-date-filter"
                onChange={(event) => {
                  if (isDueDateFilter(event.target.value)) {
                    setDueDateFilter(event.target.value);
                  }
                }}
                value={dueDateFilter}
              >
                <option value="all">Qualquer vencimento</option>
                <option value="overdue">Atrasados</option>
                <option value="upcoming">Hoje ou futuros</option>
                <option value="none">Sem vencimento</option>
              </select>
            </div>
            <div className="flex min-h-10 items-center justify-between gap-3 sm:justify-end">
              <p aria-live="polite" className="text-xs text-slate-600">
                {visibleCardCount}{' '}
                {visibleCardCount === 1
                  ? 'cartão encontrado'
                  : 'cartões encontrados'}
              </p>
              {hasActiveFilters ? (
                <button
                  className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                  onClick={() => {
                    setSearchTerm('');
                    setLabelFilterId('');
                    setDueDateFilter('all');
                    searchInputRef.current?.focus();
                  }}
                  type="button"
                >
                  <X aria-hidden="true" size={14} />
                  Limpar
                </button>
              ) : null}
            </div>
          </section>
          <section
            aria-label={`Listas do quadro ${board.title}`}
            className="flex flex-1 items-start gap-4 overflow-x-auto px-5 py-6 sm:px-8"
          >
            <SortableContext
              items={lists.map((list) => `list-${list.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => {
                const cards = filteredCardsByList.get(list.id) ?? [];

                return (
                  <ListColumn
                    cards={cards}
                    isFiltered={hasActiveFilters}
                    key={list.id}
                    list={list}
                    onAddCard={handleCreateCard}
                    onDeleteCard={(card) =>
                      setDeletingEntity({
                        kind: 'card',
                        id: card.id,
                        title: card.title,
                      })
                    }
                    onDeleteList={(targetList) =>
                      setDeletingEntity({
                        kind: 'list',
                        id: targetList.id,
                        title: targetList.title,
                      })
                    }
                    onEditCard={openEditCard}
                    onEditList={openEditList}
                  />
                );
              })}
            </SortableContext>
            <AddListForm onAdd={handleCreateList} />
          </section>
          <DragOverlay>
            {dragOverlay ? (
              <div className="max-w-xs rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl">
                {dragOverlay.kind === 'list' ? 'Lista: ' : ''}
                {dragOverlay.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Modal
        description="Atualize o nome que aparece no cabeçalho da lista."
        isOpen={Boolean(editingList)}
        onClose={closeEditDialog}
        title="Renomear lista"
      >
        <form className="grid gap-5" onSubmit={handleEditSubmit}>
          <Input
            autoFocus
            error={formError}
            id="entity-title"
            label="Título"
            maxLength={100}
            onChange={(event) => {
              setEditTitle(event.target.value);
              if (formError) {
                setFormError('');
              }
            }}
            value={editTitle}
          />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button onClick={closeEditDialog} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Modal>

      <CardModal
        card={activeCard}
        isOpen={Boolean(activeCard)}
        labels={board.labels}
        onClose={closeCardModal}
        onCreateLabel={(name, color) => {
          if (activeCard) {
            addLabelToCard(board.id, activeCard.id, name, color);
          } else {
            createLabel(board.id, name, color);
          }
        }}
        onToggleLabel={(labelId) => {
          if (activeCard) {
            toggleCardLabel(activeCard.id, labelId);
          }
        }}
        onAddChecklistItem={(text) => {
          if (activeCard) {
            addChecklistItem(activeCard.id, text);
          }
        }}
        onToggleChecklistItem={(itemId) => {
          if (activeCard) {
            toggleChecklistItem(activeCard.id, itemId);
          }
        }}
        onDeleteChecklistItem={(itemId) => {
          if (activeCard) {
            deleteChecklistItem(activeCard.id, itemId);
          }
        }}
        onUpdate={(updates) => {
          if (activeCard) {
            updateCard(activeCard.id, updates);
          }
        }}
      />

      <Modal
        description={
          deletingEntity?.kind === 'list'
            ? 'Todos os cartões desta lista também serão removidos.'
            : 'O cartão será removido permanentemente do quadro.'
        }
        isOpen={Boolean(deletingEntity)}
        onClose={closeDeleteDialog}
        title={
          deletingEntity?.kind === 'list' ? 'Excluir lista?' : 'Excluir cartão?'
        }
      >
        <div className="grid gap-6">
          <p className="text-sm leading-6 text-slate-700">
            Confirmar a exclusão de{' '}
            <strong className="text-slate-950">{deletingEntity?.title}</strong>?
          </p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button onClick={closeDeleteDialog} variant="secondary">
              Cancelar
            </Button>
            <Button onClick={handleDelete} variant="danger">
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
