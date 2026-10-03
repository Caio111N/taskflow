// Apresenta os quadros e coordena os fluxos de criação, edição e exclusão.
import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BoardList } from '../components/board/BoardList';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useBoardStore } from '../store/boardStore';
import type { Board } from '../types';

type DialogMode = 'create' | 'edit' | 'delete' | null;

/**
 * Lista os quadros do usuário e oferece operações de gerenciamento.
 *
 * @returns A página inicial com os diálogos de gerenciamento de quadro.
 */
export function HomePage() {
  const navigate = useNavigate();
  const boardRecords = useBoardStore((state) => state.boards);
  const createBoard = useBoardStore((state) => state.createBoard);
  const renameBoard = useBoardStore((state) => state.renameBoard);
  const updateBoardBackground = useBoardStore(
    (state) => state.updateBoardBackground,
  );
  const deleteBoard = useBoardStore((state) => state.deleteBoard);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState('#6366f1');
  const [formError, setFormError] = useState('');

  const boards = useMemo(
    () =>
      Object.values(boardRecords).sort((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      ),
    [boardRecords],
  );

  const closeDialog = useCallback(() => {
    setDialogMode(null);
    setSelectedBoard(null);
    setFormError('');
  }, []);

  const openCreateDialog = useCallback(() => {
    setTitle('');
    setBackground('#6366f1');
    setFormError('');
    setSelectedBoard(null);
    setDialogMode('create');
  }, []);

  const openEditDialog = useCallback((board: Board) => {
    setTitle(board.title);
    setBackground(board.background);
    setFormError('');
    setSelectedBoard(board);
    setDialogMode('edit');
  }, []);

  const handleOpenBoard = useCallback(
    (board: Board) => navigate(`/boards/${board.id}`),
    [navigate],
  );

  const openDeleteDialog = useCallback((board: Board) => {
    setSelectedBoard(board);
    setDialogMode('delete');
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const normalizedTitle = title.trim();

      if (!normalizedTitle) {
        setFormError('Informe um nome para o quadro.');
        return;
      }

      if (dialogMode === 'create') {
        createBoard(normalizedTitle, background);
      } else if (dialogMode === 'edit' && selectedBoard) {
        renameBoard(selectedBoard.id, normalizedTitle);
        updateBoardBackground(selectedBoard.id, background);
      }

      closeDialog();
    },
    [
      background,
      closeDialog,
      createBoard,
      dialogMode,
      renameBoard,
      selectedBoard,
      title,
      updateBoardBackground,
    ],
  );

  const handleDelete = useCallback(() => {
    if (!selectedBoard) {
      return;
    }

    deleteBoard(selectedBoard.id);
    closeDialog();
  }, [closeDialog, deleteBoard, selectedBoard]);

  const formDialogOpen = dialogMode === 'create' || dialogMode === 'edit';
  const isDeleteDialogOpen = dialogMode === 'delete';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a
            aria-label="TaskFlow, página inicial"
            className="inline-flex items-center gap-2.5 rounded-lg text-lg font-extrabold tracking-tight text-slate-900"
            href="/"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <LayoutGrid aria-hidden="true" size={19} />
            </span>
            TaskFlow
          </a>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={openCreateDialog}>
              <Plus aria-hidden="true" size={17} />
              <span className="hidden sm:inline">Criar quadro</span>
              <span className="sm:hidden">Criar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <section
          aria-labelledby="home-title"
          className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-sm font-semibold text-indigo-700">
              Seu espaço de trabalho
            </p>
            <h1
              className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
              id="home-title"
            >
              Seus quadros
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Um lugar claro para organizar o que precisa acontecer e acompanhar
              cada passo.
            </p>
          </div>
          {boards.length > 0 ? (
            <p className="text-sm text-slate-500" aria-live="polite">
              {boards.length}{' '}
              {boards.length === 1 ? 'quadro criado' : 'quadros criados'}
            </p>
          ) : null}
        </section>

        <BoardList
          boards={boards}
          onCreate={openCreateDialog}
          onDelete={openDeleteDialog}
          onEdit={openEditDialog}
          onOpen={handleOpenBoard}
        />
      </div>

      <Modal
        description={
          dialogMode === 'edit'
            ? 'Altere o nome ou a cor de identificação deste quadro.'
            : 'Escolha um nome e uma cor para identificar seu novo espaço de trabalho.'
        }
        isOpen={formDialogOpen}
        onClose={closeDialog}
        title={dialogMode === 'edit' ? 'Editar quadro' : 'Criar quadro'}
      >
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <Input
            autoComplete="off"
            autoFocus
            error={formError}
            id="board-title"
            label="Nome do quadro"
            maxLength={60}
            onChange={(event) => {
              setTitle(event.target.value);
              if (formError) {
                setFormError('');
              }
            }}
            placeholder="Ex.: Planejamento do time"
            value={title}
          />
          <div className="flex items-center justify-between gap-4">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="board-background"
            >
              Cor do quadro
            </label>
            <input
              aria-label="Cor do quadro"
              className="h-11 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
              id="board-background"
              onChange={(event) => setBackground(event.target.value)}
              type="color"
              value={background}
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button onClick={closeDialog} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">
              {dialogMode === 'edit' ? 'Salvar alterações' : 'Criar quadro'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        description="As listas e cartões deste quadro também serão removidos. Esta ação não pode ser desfeita."
        isOpen={isDeleteDialogOpen}
        onClose={closeDialog}
        title="Excluir quadro?"
      >
        <div className="grid gap-6">
          <p className="text-sm leading-6 text-slate-700">
            Você está prestes a excluir{' '}
            <strong className="text-slate-950">{selectedBoard?.title}</strong>.
          </p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button onClick={closeDialog} variant="secondary">
              Manter quadro
            </Button>
            <Button onClick={handleDelete} variant="danger">
              Excluir quadro
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
