// Organiza os cartões de quadro ou apresenta um estado vazio orientado à ação.
import { LayoutGrid, Plus } from 'lucide-react';
import { BoardCard } from './BoardCard';
import type { Board } from '../../types';

/** Propriedades para renderizar uma coleção de quadros. */
export interface BoardListProps {
  boards: Board[];
  onCreate: () => void;
  onOpen: (board: Board) => void;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
}

/**
 * Renderiza a grade de quadros e um estado vazio quando não há conteúdo.
 *
 * @param props Quadros disponíveis e ações associadas à coleção.
 * @returns Grade responsiva ou estado vazio.
 */
export function BoardList({
  boards,
  onCreate,
  onOpen,
  onEdit,
  onDelete,
}: BoardListProps) {
  if (boards.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <LayoutGrid aria-hidden="true" size={24} />
        </span>
        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Nenhum quadro por aqui ainda
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
          Crie seu primeiro quadro para começar a organizar projetos, ideias e
          tarefas em um só lugar.
        </p>
        <button
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
          onClick={onCreate}
          type="button"
        >
          <Plus aria-hidden="true" size={17} />
          Criar meu primeiro quadro
        </button>
      </section>
    );
  }

  return (
    <section aria-label="Seus quadros">
      <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {boards.map((board) => (
          <li key={board.id}>
            <BoardCard
              board={board}
              onDelete={onDelete}
              onEdit={onEdit}
              onOpen={onOpen}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
