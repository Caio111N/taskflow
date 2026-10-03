// Permite selecionar etiquetas do quadro sem acoplar lógica de domínio à UI.
import { useState, type FormEvent } from 'react';
import { Check, Plus } from 'lucide-react';
import type { Label } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

/** Propriedades para seleção de etiquetas dentro do quadro atual. */
export interface LabelPickerProps {
  labels: Label[];
  selectedLabelIds: string[];
  onToggle: (labelId: string) => void;
  onCreateLabel: (name: string, color: string) => void;
}

const LABEL_COLORS = [
  { name: 'Verde', value: '#bbf7d0' },
  { name: 'Amarelo', value: '#fef08a' },
  { name: 'Laranja', value: '#fed7aa' },
  { name: 'Vermelho', value: '#fecaca' },
  { name: 'Roxo', value: '#ddd6fe' },
  { name: 'Azul', value: '#bfdbfe' },
];

/**
 * Renderiza seleção de etiquetas e criação simples de uma nova etiqueta.
 *
 * @param props Etiquetas do quadro, IDs selecionados e callbacks de alteração.
 * @returns A lista de etiquetas selecionáveis e controles de criação.
 */
export function LabelPicker({
  labels,
  selectedLabelIds,
  onToggle,
  onCreateLabel,
}: LabelPickerProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(LABEL_COLORS[0].value);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();

    if (!normalizedName) {
      return;
    }

    onCreateLabel(normalizedName, color);
    setName('');
  }

  return (
    <section className="grid gap-3">
      <h3 className="text-sm font-semibold text-slate-800">Etiquetas</h3>
      {labels.length ? (
        <ul className="grid list-none gap-2 p-0 sm:grid-cols-2">
          {labels.map((label) => {
            const isSelected = selectedLabelIds.includes(label.id);

            return (
              <li key={label.id}>
                <button
                  aria-pressed={isSelected}
                  className="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 px-2.5 py-1.5 text-left transition hover:border-indigo-300"
                  onClick={() => onToggle(label.id)}
                  type="button"
                >
                  <Badge className="max-w-full truncate" color={label.color}>
                    {label.name}
                  </Badge>
                  {isSelected ? (
                    <Check
                      aria-label="Selecionada"
                      className="shrink-0 text-indigo-700"
                      size={16}
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">
          Ainda não há etiquetas neste quadro.
        </p>
      )}
      <form
        className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_auto]"
        onSubmit={handleCreate}
      >
        <label className="sr-only" htmlFor="new-label-name">
          Nome da nova etiqueta
        </label>
        <input
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
          id="new-label-name"
          maxLength={32}
          onChange={(event) => setName(event.target.value)}
          placeholder="Criar etiqueta..."
          value={name}
        />
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="new-label-color">
            Cor da nova etiqueta
          </label>
          <select
            className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700"
            id="new-label-color"
            onChange={(event) => setColor(event.target.value)}
            value={color}
          >
            {LABEL_COLORS.map((labelColor) => (
              <option key={labelColor.value} value={labelColor.value}>
                {labelColor.name}
              </option>
            ))}
          </select>
          <Button
            aria-label="Criar etiqueta"
            className="px-3"
            disabled={!name.trim()}
            type="submit"
          >
            <Plus aria-hidden="true" size={16} />
          </Button>
        </div>
      </form>
    </section>
  );
}
