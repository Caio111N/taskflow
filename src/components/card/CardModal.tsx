// Apresenta e salva todos os detalhes editáveis de um cartão.
import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, FileText } from 'lucide-react';
import type { Card, Label, UpdateCardInput } from '../../types';
import { Checklist } from './Checklist';
import { LabelPicker } from './LabelPicker';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

/** Propriedades do editor de detalhes do cartão. */
export interface CardModalProps {
  card: Card | null;
  labels: Label[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: UpdateCardInput) => void;
  onCreateLabel: (name: string, color: string) => void;
  onToggleLabel: (labelId: string) => void;
  onAddChecklistItem: (text: string) => void;
  onToggleChecklistItem: (itemId: string) => void;
  onDeleteChecklistItem: (itemId: string) => void;
}

/**
 * Renderiza título, descrição, etiquetas, vencimento e checklist do cartão.
 *
 * @param props Cartão atual, etiquetas do quadro e ações para salvar alterações.
 * @returns Modal de detalhes aberto ou null.
 */
export function CardModal({
  card,
  labels,
  isOpen,
  onClose,
  onUpdate,
  onCreateLabel,
  onToggleLabel,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
}: CardModalProps) {
  const [descriptionDraft, setDescriptionDraft] = useState(
    card?.description ?? '',
  );

  useEffect(() => {
    setDescriptionDraft(card?.description ?? '');
  }, [card?.description, card?.id]);

  const handleTitleChange = useCallback(
    (title: string) => {
      if (title.trim() && card) {
        onUpdate({ title });
      }
    },
    [card, onUpdate],
  );

  if (!card) {
    return null;
  }

  return (
    <Modal
      description="Edite os detalhes e acompanhe o progresso deste cartão."
      isOpen={isOpen}
      onClose={onClose}
      title={card.title}
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        <CardTitleEditor
          key={card.id}
          onSave={handleTitleChange}
          title={card.title}
        />

        <section
          aria-labelledby="card-description-title"
          className="grid gap-2"
        >
          <h3
            className="flex items-center gap-2 text-sm font-semibold text-slate-800"
            id="card-description-title"
          >
            <FileText aria-hidden="true" size={16} />
            Descrição
          </h3>
          <label className="sr-only" htmlFor="card-description">
            Descrição do cartão
          </label>
          <textarea
            className="min-h-28 resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-6 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            id="card-description"
            onChange={(event) => {
              const description = event.target.value;
              setDescriptionDraft(description);
              onUpdate({ description: description || undefined });
            }}
            placeholder="Adicione uma descrição mais detalhada..."
            value={descriptionDraft}
          />
        </section>

        <section aria-labelledby="card-due-date-title" className="grid gap-2">
          <h3
            className="flex items-center gap-2 text-sm font-semibold text-slate-800"
            id="card-due-date-title"
          >
            <CalendarClock aria-hidden="true" size={16} />
            Data de vencimento
          </h3>
          <Input
            id="card-due-date"
            label="Data de vencimento"
            onChange={(event) =>
              onUpdate({
                dueDate: event.target.value
                  ? new Date(
                      `${event.target.value}T00:00:00.000Z`,
                    ).toISOString()
                  : undefined,
              })
            }
            type="date"
            value={card.dueDate ? card.dueDate.slice(0, 10) : ''}
          />
        </section>

        <LabelPicker
          labels={labels}
          onCreateLabel={onCreateLabel}
          onToggle={onToggleLabel}
          selectedLabelIds={card.labelIds}
        />

        <Checklist
          items={card.checklist}
          onAdd={onAddChecklistItem}
          onDelete={onDeleteChecklistItem}
          onToggle={onToggleChecklistItem}
        />
      </div>
    </Modal>
  );
}

interface CardTitleEditorProps {
  title: string;
  onSave: (title: string) => void;
}

/**
 * Mantém o rascunho do título localmente e salva ao sair do campo.
 *
 * @param props Título atual e ação de gravação.
 * @returns Campo de título acessível para o cartão.
 */
function CardTitleEditor({ title, onSave }: CardTitleEditorProps) {
  const [draft, setDraft] = useState(title);

  function handleBlur() {
    const normalizedTitle = draft.trim();
    if (normalizedTitle && normalizedTitle !== title) {
      onSave(normalizedTitle);
    } else if (!normalizedTitle) {
      setDraft(title);
    }
  }

  return (
    <Input
      id="card-modal-title"
      label="Título do cartão"
      maxLength={100}
      onBlur={handleBlur}
      onChange={(event) => setDraft(event.target.value)}
      value={draft}
    />
  );
}
