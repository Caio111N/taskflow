import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ChecklistItem } from '../../types';
import { Checklist } from './Checklist';

const checklistItems: ChecklistItem[] = [
  { id: 'check-1', text: 'Revisar o fluxo', done: false },
];

describe('Checklist', () => {
  afterEach(() => {
    cleanup();
  });

  it('adiciona texto normalizado e delega a conclusão e exclusão', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    render(
      <Checklist
        items={checklistItems}
        onAdd={onAdd}
        onDelete={onDelete}
        onToggle={onToggle}
      />,
    );

    const newItemInput = screen.getByLabelText('Novo item do checklist');
    await user.type(newItemInput, '  Preparar demonstração  ');
    await user.click(
      screen.getByRole('button', { name: 'Adicionar item ao checklist' }),
    );
    expect(onAdd).toHaveBeenCalledExactlyOnceWith('Preparar demonstração');
    expect(newItemInput).toHaveValue('');

    await user.click(screen.getByRole('checkbox', { name: 'Revisar o fluxo' }));
    expect(onToggle).toHaveBeenCalledExactlyOnceWith('check-1');

    await user.click(
      screen.getByRole('button', { name: 'Excluir item Revisar o fluxo' }),
    );
    expect(onDelete).toHaveBeenCalledExactlyOnceWith('check-1');
  });

  it('expõe o progresso e a mensagem quando todos os itens foram concluídos', () => {
    render(
      <Checklist
        items={[{ ...checklistItems[0], done: true }]}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onToggle={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('progressbar', {
        name: 'Progresso do checklist: 1 de 1 concluídos',
      }),
    ).toHaveAttribute('aria-valuenow', '1');
    expect(
      screen.getByText('Todas as tarefas foram concluídas.'),
    ).toBeInTheDocument();
  });
});
