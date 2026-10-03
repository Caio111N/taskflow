// Centraliza o estado normalizado, as regras de domínio e a persistência local.
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  Board,
  Card,
  ChecklistItem,
  List,
  State,
  Theme,
  UpdateCardInput,
} from '../types';

const DEFAULT_BOARD_BACKGROUND = '#6366f1';
const STORAGE_KEY = 'taskflow-storage';

/** Estado da aplicação combinado com as operações disponíveis no domínio. */
export interface BoardStore extends State {
  /** Cria um quadro e retorna seu identificador. */
  createBoard: (title: string, background?: string) => string;
  /** Atualiza o título de um quadro existente. */
  renameBoard: (boardId: string, title: string) => void;
  /** Atualiza a cor ou imagem de fundo de um quadro existente. */
  updateBoardBackground: (boardId: string, background: string) => void;
  /** Cria uma etiqueta associada ao quadro e retorna seu identificador. */
  createLabel: (boardId: string, name: string, color: string) => string;
  /** Remove o quadro e todos os dados que pertencem às suas listas. */
  deleteBoard: (boardId: string) => void;
  /** Cria uma lista no quadro e retorna seu identificador. */
  createList: (boardId: string, title: string) => string;
  /** Atualiza o título de uma lista existente. */
  renameList: (listId: string, title: string) => void;
  /** Remove uma lista e seus cartões de todos os registros e relações. */
  deleteList: (boardId: string, listId: string) => void;
  /** Reordena duas listas já pertencentes ao mesmo quadro. */
  reorderLists: (
    boardId: string,
    activeListId: string,
    overListId: string,
  ) => void;
  /** Cria um cartão na lista indicada e retorna seu identificador. */
  createCard: (listId: string, title: string) => string;
  /** Atualiza os campos editáveis de um cartão. */
  updateCard: (cardId: string, updates: UpdateCardInput) => void;
  /** Alterna a associação de uma etiqueta existente no cartão. */
  toggleCardLabel: (cardId: string, labelId: string) => void;
  /** Cria e associa ao cartão uma etiqueta nova ou já existente no quadro. */
  addLabelToCard: (
    boardId: string,
    cardId: string,
    name: string,
    color: string,
  ) => string;
  /** Adiciona um item ao checklist e retorna seu identificador. */
  addChecklistItem: (cardId: string, text: string) => string;
  /** Alterna o estado de conclusão de um item do checklist. */
  toggleChecklistItem: (cardId: string, itemId: string) => void;
  /** Remove um item do checklist. */
  deleteChecklistItem: (cardId: string, itemId: string) => void;
  /** Remove um cartão e limpa qualquer referência a ele nas listas. */
  deleteCard: (cardId: string) => void;
  /** Move ou reordena um cartão dentro ou entre listas. */
  moveCard: (
    sourceListId: string,
    destinationListId: string,
    cardId: string,
    destinationIndex?: number,
  ) => void;
  /** Define o tema visual persistido da aplicação. */
  setTheme: (theme: Theme) => void;
}

/**
 * Exige a existência de um registro antes de executar uma ação de domínio.
 *
 * @param entity Registro localizado pelo identificador.
 * @param entityName Nome legível do tipo de registro para a mensagem de erro.
 * @param id Identificador solicitado.
 * @returns O registro existente.
 */
function requireEntity<T>(
  entity: T | undefined,
  entityName: string,
  id: string,
): T {
  if (!entity) {
    throw new Error(`${entityName} "${id}" não foi encontrado.`);
  }

  return entity;
}

/**
 * Normaliza e valida títulos para evitar registros sem nome visível.
 *
 * @param title Título recebido pela ação.
 * @returns O título sem espaços excedentes nas extremidades.
 */
function normalizeTitle(title: string): string {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    throw new Error('O título não pode ficar vazio.');
  }

  return normalizedTitle;
}

/**
 * Cria a store global do TaskFlow com persistência automática no navegador.
 *
 * @remarks
 * A persistência grava os registros normalizados, de modo que uma atualização
 * de cartão não precise serializar cópias do cartão dentro de quadros e listas.
 *
 * @returns O hook Zustand com estado, seletores e ações de domínio.
 */
export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      boards: {},
      lists: {},
      cards: {},
      theme: 'light',

      createBoard: (title, background = DEFAULT_BOARD_BACKGROUND) => {
        const board: Board = {
          id: nanoid(),
          title: normalizeTitle(title),
          background,
          listIds: [],
          labels: [],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          boards: { ...state.boards, [board.id]: board },
        }));

        return board.id;
      },

      renameBoard: (boardId, title) => {
        const board = requireEntity(get().boards[boardId], 'Quadro', boardId);
        const normalizedTitle = normalizeTitle(title);

        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: { ...board, title: normalizedTitle },
          },
        }));
      },

      updateBoardBackground: (boardId, background) => {
        const board = requireEntity(get().boards[boardId], 'Quadro', boardId);

        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: { ...board, background },
          },
        }));
      },

      createLabel: (boardId, name, color) => {
        const board = requireEntity(get().boards[boardId], 'Quadro', boardId);
        const normalizedName = normalizeTitle(name);
        const existingLabel = board.labels.find(
          (label) =>
            label.name.toLocaleLowerCase() ===
            normalizedName.toLocaleLowerCase(),
        );

        if (existingLabel) {
          return existingLabel.id;
        }

        const label = { id: nanoid(), name: normalizedName, color };
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: { ...board, labels: [...board.labels, label] },
          },
        }));

        return label.id;
      },

      deleteBoard: (boardId) => {
        const board = requireEntity(get().boards[boardId], 'Quadro', boardId);
        const listIds = new Set(board.listIds);
        const cardIds = new Set<string>();

        // Reúne cartões antes de remover as listas para preservar a integridade.
        for (const listId of listIds) {
          const list = get().lists[listId];
          if (list) {
            list.cardIds.forEach((cardId) => cardIds.add(cardId));
          }
        }

        set((state) => {
          const boards = { ...state.boards };
          const lists = { ...state.lists };
          const cards = { ...state.cards };

          delete boards[boardId];
          listIds.forEach((listId) => delete lists[listId]);
          cardIds.forEach((cardId) => delete cards[cardId]);

          return { boards, lists, cards };
        });
      },

      createList: (boardId, title) => {
        const board = requireEntity(get().boards[boardId], 'Quadro', boardId);
        const list: List = {
          id: nanoid(),
          title: normalizeTitle(title),
          cardIds: [],
        };

        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: { ...board, listIds: [...board.listIds, list.id] },
          },
          lists: { ...state.lists, [list.id]: list },
        }));

        return list.id;
      },

      renameList: (listId, title) => {
        const list = requireEntity(get().lists[listId], 'Lista', listId);
        const normalizedTitle = normalizeTitle(title);

        set((state) => ({
          lists: {
            ...state.lists,
            [listId]: { ...list, title: normalizedTitle },
          },
        }));
      },

      deleteList: (boardId, listId) => {
        const board = requireEntity(get().boards[boardId], 'Quadro', boardId);
        const list = requireEntity(get().lists[listId], 'Lista', listId);

        if (!board.listIds.includes(listId)) {
          throw new Error(
            `A lista "${listId}" não pertence ao quadro "${boardId}".`,
          );
        }

        const cardIds = new Set(list.cardIds);

        set((state) => {
          const lists = { ...state.lists };
          const cards = { ...state.cards };

          delete lists[listId];
          cardIds.forEach((cardId) => delete cards[cardId]);

          // Limpa referências residuais para manter a relação lista-cartão íntegra.
          for (const [otherListId, otherList] of Object.entries(lists)) {
            if (otherList.cardIds.some((cardId) => cardIds.has(cardId))) {
              lists[otherListId] = {
                ...otherList,
                cardIds: otherList.cardIds.filter(
                  (cardId) => !cardIds.has(cardId),
                ),
              };
            }
          }

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                listIds: board.listIds.filter((id) => id !== listId),
              },
            },
            lists,
            cards,
          };
        });
      },

      reorderLists: (boardId, activeListId, overListId) => {
        const board = requireEntity(get().boards[boardId], 'Quadro', boardId);
        const oldIndex = board.listIds.indexOf(activeListId);
        const newIndex = board.listIds.indexOf(overListId);

        if (oldIndex < 0 || newIndex < 0) {
          throw new Error('As listas precisam pertencer ao quadro informado.');
        }

        if (oldIndex === newIndex) {
          return;
        }

        // Remove a lista ativa e a insere na posição da lista-alvo.
        const listIds = [...board.listIds];
        listIds.splice(oldIndex, 1);
        listIds.splice(newIndex, 0, activeListId);

        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: { ...board, listIds },
          },
        }));
      },

      createCard: (listId, title) => {
        const list = requireEntity(get().lists[listId], 'Lista', listId);
        const card: Card = {
          id: nanoid(),
          title: normalizeTitle(title),
          labelIds: [],
          checklist: [],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          lists: {
            ...state.lists,
            [listId]: { ...list, cardIds: [...list.cardIds, card.id] },
          },
          cards: { ...state.cards, [card.id]: card },
        }));

        return card.id;
      },

      updateCard: (cardId, updates) => {
        const card = requireEntity(get().cards[cardId], 'Cartão', cardId);
        const normalizedUpdates =
          updates.title !== undefined
            ? { ...updates, title: normalizeTitle(updates.title) }
            : updates;

        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: { ...card, ...normalizedUpdates },
          },
        }));
      },

      toggleCardLabel: (cardId, labelId) => {
        const card = requireEntity(get().cards[cardId], 'Cartão', cardId);
        const labelIsAssigned = card.labelIds.includes(labelId);

        if (
          !labelIsAssigned &&
          !Object.values(get().boards).some((board) =>
            board.labels.some((label) => label.id === labelId),
          )
        ) {
          throw new Error(`A etiqueta "${labelId}" não foi encontrada.`);
        }

        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...card,
              labelIds: labelIsAssigned
                ? card.labelIds.filter((id) => id !== labelId)
                : [...card.labelIds, labelId],
            },
          },
        }));
      },

      addLabelToCard: (boardId, cardId, name, color) => {
        const card = requireEntity(get().cards[cardId], 'Cartão', cardId);
        const labelId = get().createLabel(boardId, name, color);

        if (!card.labelIds.includes(labelId)) {
          set((state) => ({
            cards: {
              ...state.cards,
              [cardId]: { ...card, labelIds: [...card.labelIds, labelId] },
            },
          }));
        }

        return labelId;
      },

      addChecklistItem: (cardId, text) => {
        const card = requireEntity(get().cards[cardId], 'Cartão', cardId);
        const item: ChecklistItem = {
          id: nanoid(),
          text: normalizeTitle(text),
          done: false,
        };

        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: { ...card, checklist: [...card.checklist, item] },
          },
        }));

        return item.id;
      },

      toggleChecklistItem: (cardId, itemId) => {
        const card = requireEntity(get().cards[cardId], 'Cartão', cardId);
        const itemExists = card.checklist.some((item) => item.id === itemId);

        if (!itemExists) {
          throw new Error(
            `O item de checklist "${itemId}" não foi encontrado.`,
          );
        }

        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...card,
              checklist: card.checklist.map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item,
              ),
            },
          },
        }));
      },

      deleteChecklistItem: (cardId, itemId) => {
        const card = requireEntity(get().cards[cardId], 'Cartão', cardId);
        const itemExists = card.checklist.some((item) => item.id === itemId);

        if (!itemExists) {
          throw new Error(
            `O item de checklist "${itemId}" não foi encontrado.`,
          );
        }

        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: {
              ...card,
              checklist: card.checklist.filter((item) => item.id !== itemId),
            },
          },
        }));
      },

      deleteCard: (cardId) => {
        requireEntity(get().cards[cardId], 'Cartão', cardId);

        set((state) => {
          const cards = { ...state.cards };
          const lists = { ...state.lists };
          delete cards[cardId];

          for (const [listId, list] of Object.entries(lists)) {
            if (list.cardIds.includes(cardId)) {
              lists[listId] = {
                ...list,
                cardIds: list.cardIds.filter((id) => id !== cardId),
              };
            }
          }

          return { cards, lists };
        });
      },

      moveCard: (sourceListId, destinationListId, cardId, destinationIndex) => {
        const sourceList = requireEntity(
          get().lists[sourceListId],
          'Lista de origem',
          sourceListId,
        );
        const destinationList = requireEntity(
          get().lists[destinationListId],
          'Lista de destino',
          destinationListId,
        );
        requireEntity(get().cards[cardId], 'Cartão', cardId);

        const sourceIndex = sourceList.cardIds.indexOf(cardId);
        if (sourceIndex < 0) {
          throw new Error(
            `O cartão "${cardId}" não pertence à lista de origem.`,
          );
        }

        // Primeiro remove o cartão da origem; depois insere no índice limitado.
        const sourceCardIds = [...sourceList.cardIds];
        sourceCardIds.splice(sourceIndex, 1);
        const targetCardIds =
          sourceListId === destinationListId
            ? sourceCardIds
            : [...destinationList.cardIds.filter((id) => id !== cardId)];
        const requestedIndex = destinationIndex ?? targetCardIds.length;
        const boundedIndex = Math.max(
          0,
          Math.min(requestedIndex, targetCardIds.length),
        );
        targetCardIds.splice(boundedIndex, 0, cardId);

        set((state) => ({
          lists: {
            ...state.lists,
            [sourceListId]: {
              ...sourceList,
              cardIds:
                sourceListId === destinationListId
                  ? targetCardIds
                  : sourceCardIds,
            },
            ...(sourceListId === destinationListId
              ? {}
              : {
                  [destinationListId]: {
                    ...destinationList,
                    cardIds: targetCardIds,
                  },
                }),
          },
        }));
      },

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
