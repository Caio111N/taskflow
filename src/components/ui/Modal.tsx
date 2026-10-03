// Fornece uma superfície de diálogo acessível e reutilizável para fluxos curtos.
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/** Propriedades do diálogo modal genérico. */
export interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
}

/**
 * Renderiza um diálogo modal, fecha com Escape e restaura o foco ao fechar.
 *
 * @param props Estado, conteúdo, identificação acessível e callback de fechamento.
 * @returns O diálogo aberto ou null quando está fechado.
 */
export function Modal({
  isOpen,
  title,
  description,
  onClose,
  children,
  labelledBy,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = labelledBy ?? 'taskflow-dialog-title';
  const descriptionId = description ? `${titleId}-description` : undefined;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusableElements = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    getFocusableElements()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        dialogRef.current?.focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-lg animate-[modal-in_180ms_ease-out] rounded-2xl bg-white p-6 shadow-2xl"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p
                className="mt-1 text-sm leading-6 text-slate-600"
                id={descriptionId}
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="Fechar diálogo"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
