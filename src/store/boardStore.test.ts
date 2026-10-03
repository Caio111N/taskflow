import { beforeEach, describe, expect, it } from 'vitest';

import { useBoardStore } from './boardStore';

beforeEach(() => {
  useBoardStore.setState({
    boards: {},
    lists: {},
    cards: {},
    theme: 'light',
  });
});

describe('boardStore', () => {
  it('cria um quadro com listas e cartões normalizados', () => {
    const { createBoard, createList, createCard } = useBoardStore.getState();

    const boardId = createBoard('Sprint 01');
    const listId = createList(boardId, 'A fazer');
    const cardId = createCard(listId, 'Configurar projeto');

    expect(useBoardStore.getState().boards[boardId]).toMatchObject({
      title: 'Sprint 01',
      listIds: [listId],
    });
    expect(useBoardStore.getState().lists[listId]).toMatchObject({
      title: 'A fazer',
      cardIds: [cardId],
    });
    expect(useBoardStore.getState().cards[cardId]).toMatchObject({
      title: 'Configurar projeto',
      checklist: [],
      labelIds: [],
    });
  });

  it('valida títulos vazios e mantém checklist e etiquetas em sincronia', () => {
    const {
      createBoard,
      createList,
      createCard,
      addChecklistItem,
      toggleChecklistItem,
      createLabel,
      toggleCardLabel,
      updateCard,
    } = useBoardStore.getState();

    const boardId = createBoard('Quadro principal');
    const listId = createList(boardId, 'Resumo');
    const cardId = createCard(listId, 'Revisar PR');
    const labelId = createLabel(boardId, 'Alta prioridade', '#ef4444');
    const itemId = addChecklistItem(cardId, 'Validar testes');

    updateCard(cardId, { description: 'Atualizar descrição antes do merge.' });
    toggleChecklistItem(cardId, itemId);
    toggleCardLabel(cardId, labelId);

    expect(() => createList(boardId, '   ')).toThrow(
      'O título não pode ficar vazio.',
    );

    const { cards } = useBoardStore.getState();
    expect(cards[cardId]).toMatchObject({
      description: 'Atualizar descrição antes do merge.',
      labelIds: [labelId],
    });
    expect(cards[cardId].checklist).toHaveLength(1);
    expect(cards[cardId].checklist[0]).toMatchObject({
      text: 'Validar testes',
      done: true,
    });
  });

  it('move e reordena cartões dentro da mesma lista sem quebrar as relações', () => {
    const { createBoard, createList, createCard, moveCard, reorderLists } =
      useBoardStore.getState();

    const boardId = createBoard('Kanban');
    const todoListId = createList(boardId, 'To do');
    const doingListId = createList(boardId, 'Doing');
    const firstCardId = createCard(todoListId, 'Implementar layout');
    const secondCardId = createCard(todoListId, 'Adicionar testes');

    moveCard(todoListId, doingListId, firstCardId);
    moveCard(todoListId, todoListId, secondCardId, 0);
    reorderLists(boardId, doingListId, todoListId);

    expect(useBoardStore.getState().lists[todoListId].cardIds).toEqual([
      secondCardId,
    ]);
    expect(useBoardStore.getState().lists[doingListId].cardIds).toEqual([
      firstCardId,
    ]);
    expect(useBoardStore.getState().boards[boardId].listIds).toEqual([
      doingListId,
      todoListId,
    ]);
  });

  it('reordena listas em qualquer direção e rejeita uma lista de outro quadro', () => {
    const { createBoard, createList, reorderLists } = useBoardStore.getState();

    const boardId = createBoard('Planejamento');
    const firstListId = createList(boardId, 'A fazer');
    const secondListId = createList(boardId, 'Em andamento');
    const thirdListId = createList(boardId, 'Concluído');
    const otherBoardId = createBoard('Outro quadro');
    const foreignListId = createList(otherBoardId, 'Lista externa');

    reorderLists(boardId, thirdListId, firstListId);
    expect(useBoardStore.getState().boards[boardId].listIds).toEqual([
      thirdListId,
      firstListId,
      secondListId,
    ]);

    reorderLists(boardId, thirdListId, secondListId);
    expect(useBoardStore.getState().boards[boardId].listIds).toEqual([
      firstListId,
      secondListId,
      thirdListId,
    ]);

    expect(() => reorderLists(boardId, firstListId, foreignListId)).toThrow(
      'As listas precisam pertencer ao quadro informado.',
    );
  });

  it('remove uma lista e seus cartões sem afetar outros quadros', () => {
    const { createBoard, createList, createCard, deleteList } =
      useBoardStore.getState();

    const boardId = createBoard('Quadro principal');
    const listId = createList(boardId, 'Lista removida');
    const cardId = createCard(listId, 'Cartão removido');
    const otherBoardId = createBoard('Outro quadro');
    const otherListId = createList(otherBoardId, 'Lista preservada');
    const otherCardId = createCard(otherListId, 'Cartão preservado');

    deleteList(boardId, listId);

    const state = useBoardStore.getState();
    expect(state.boards[boardId].listIds).toEqual([]);
    expect(state.lists[listId]).toBeUndefined();
    expect(state.cards[cardId]).toBeUndefined();
    expect(state.boards[otherBoardId].listIds).toEqual([otherListId]);
    expect(state.lists[otherListId].cardIds).toEqual([otherCardId]);
    expect(state.cards[otherCardId]).toBeDefined();
  });
});
