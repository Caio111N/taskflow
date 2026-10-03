// Oferece o formulário inline para criar uma lista no quadro atual.
import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';

/** Propriedades da ação inline para adicionar uma lista. */
export interface AddListFormProps {
  onAdd: (title: string) => void;
}

/**
 * Renderiza um botão de criação e um formulário compacto para nova lista.
 *
 * @param props Callback de criação fornecido pela página do quadro.
 * @returns A ação de adicionar lista, expandida em formulário quando solicitada.
 */
export function AddListForm({ onAdd }: AddListFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setError('Digite um nome para a lista.');
      return;
    }

    onAdd(normalizedTitle);
    setTitle('');
    setError('');
    setIsExpanded(false);
  }

  if (!isExpanded) {
    return (
      <Button
        className="h-fit min-w-64 justify-start border border-slate-200 bg-white/90 text-slate-700 shadow-sm hover:bg-white"
        onClick={() => setIsExpanded(true)}
        variant="secondary"
      >
        <Plus aria-hidden="true" size={18} />
        Adicionar outra lista
      </Button>
    );
  }

  return (
    <form
      className="h-fit min-w-64 rounded-2xl bg-slate-100 p-3 shadow-lg"
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="new-list-title">
        Nome da lista
      </label>
      <input
        autoFocus
        className="min-h-11 w-full rounded-xl border border-indigo-400 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        id="new-list-title"
        maxLength={60}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) {
            setError('');
          }
        }}
        placeholder="Nome da lista"
        value={title}
      />
      {error ? (
        <p className="mt-2 text-xs text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex items-center gap-2">
        <Button type="submit">Adicionar lista</Button>
        <button
          aria-label="Cancelar criação de lista"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-200"
          onClick={() => {
            setTitle('');
            setError('');
            setIsExpanded(false);
          }}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>
    </form>
  );
}
