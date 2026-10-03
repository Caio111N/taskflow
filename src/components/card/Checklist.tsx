// Gerencia itens e progresso de checklist no contexto do cartão.
import { useMemo, useState, type FormEvent } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import type { ChecklistItem } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';

/** Propriedades para exibir e alterar a lista de verificação do cartão. */
export interface ChecklistProps {
  items: ChecklistItem[];
  onAdd: (text: string) => void;
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

/**
 * Renderiza progresso e controles para criar, concluir e excluir itens.
 *
 * @param props Itens de checklist e callback para salvar a próxima versão.
 * @returns O checklist com progresso acessível e controles por teclado.
 */
export function Checklist({
  items,
  onAdd,
  onToggle,
  onDelete,
}: ChecklistProps) {
  const [newItemText, setNewItemText] = useState('');
  const completedCount = useMemo(
    () => items.filter((item) => item.done).length,
    [items],
  );

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = newItemText.trim();
    if (!text) {
      return;
    }

    onAdd(text);
    setNewItemText('');
  }

  return (
    <section aria-labelledby="checklist-title" className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3
          className="text-sm font-semibold text-slate-800"
          id="checklist-title"
        >
          Checklist
        </h3>
        <span className="text-xs tabular-nums text-slate-500">
          {completedCount}/{items.length}
        </span>
      </div>
      <ProgressBar
        label={`Progresso do checklist: ${completedCount} de ${items.length} concluídos`}
        max={items.length}
        value={completedCount}
      />
      {items.length ? (
        <ul className="grid list-none gap-1 p-0">
          {items.map((item) => (
            <li
              className="group flex items-center gap-2 rounded-lg px-1 py-1"
              key={item.id}
            >
              <input
                checked={item.done}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                id={`checklist-${item.id}`}
                onChange={() => onToggle(item.id)}
                type="checkbox"
              />
              <label
                className={`min-w-0 flex-1 break-words text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                htmlFor={`checklist-${item.id}`}
              >
                {item.text}
              </label>
              <button
                aria-label={`Excluir item ${item.text}`}
                className="rounded-md p-1.5 text-slate-400 opacity-100 transition hover:bg-rose-50 hover:text-rose-700 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                onClick={() => onDelete(item.id)}
                type="button"
              >
                <Trash2 aria-hidden="true" size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">Nenhum item no checklist.</p>
      )}
      <form className="flex gap-2" onSubmit={handleAdd}>
        <label className="sr-only" htmlFor="new-checklist-item">
          Novo item do checklist
        </label>
        <input
          className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400"
          id="new-checklist-item"
          maxLength={120}
          onChange={(event) => setNewItemText(event.target.value)}
          placeholder="Adicionar item..."
          value={newItemText}
        />
        <button
          aria-label="Adicionar item ao checklist"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!newItemText.trim()}
          type="submit"
        >
          <Plus aria-hidden="true" size={18} />
        </button>
      </form>
      {items.length > 0 && completedCount === items.length ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <Check aria-hidden="true" size={14} />
          Todas as tarefas foram concluídas.
        </p>
      ) : null}
    </section>
  );
}
