import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddListForm } from './AddListForm';

describe('AddListForm', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expande o formulário e envia o título sem espaços excedentes', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddListForm onAdd={onAdd} />);

    await user.click(
      screen.getByRole('button', { name: 'Adicionar outra lista' }),
    );
    await user.type(screen.getByLabelText('Nome da lista'), '  Em revisão  ');
    await user.click(screen.getByRole('button', { name: 'Adicionar lista' }));

    expect(onAdd).toHaveBeenCalledExactlyOnceWith('Em revisão');
    expect(
      screen.getByRole('button', { name: 'Adicionar outra lista' }),
    ).toBeInTheDocument();
  });

  it('mostra erro e não cria uma lista quando o título está vazio', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<AddListForm onAdd={onAdd} />);

    await user.click(
      screen.getByRole('button', { name: 'Adicionar outra lista' }),
    );
    await user.click(screen.getByRole('button', { name: 'Adicionar lista' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Digite um nome para a lista.',
    );
    expect(onAdd).not.toHaveBeenCalled();
  });
});
