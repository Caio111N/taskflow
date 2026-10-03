// Define os contratos compartilhados e mantém relações por identificadores.

/** Etiqueta reutilizável dentro de um quadro. */
export interface Label {
  id: string;
  name: string;
  color: string;
}

/** Item individual de uma lista de verificação de cartão. */
export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

/** Cartão normalizado; sua lista é determinada por List.cardIds. */
export interface Card {
  id: string;
  title: string;
  description?: string;
  labelIds: string[];
  dueDate?: string;
  checklist: ChecklistItem[];
  createdAt: string;
}

/** Lista normalizada; seus cartões são referenciados por identificador. */
export interface List {
  id: string;
  title: string;
  cardIds: string[];
}

/** Quadro normalizado com listas e etiquetas referenciadas por identificador. */
export interface Board {
  id: string;
  title: string;
  background: string;
  listIds: string[];
  labels: Label[];
  createdAt: string;
}

/** Tema visual selecionado para a aplicação. */
export type Theme = 'light' | 'dark';

/**
 * Estado persistido da aplicação.
 *
 * @remarks
 * Os registros ficam indexados por ID e as relações são armazenadas em arrays
 * de IDs para evitar cópias aninhadas e facilitar atualizações pontuais.
 */
export interface State {
  boards: Record<string, Board>;
  lists: Record<string, List>;
  cards: Record<string, Card>;
  theme: Theme;
}

/** Campos editáveis de um cartão, sem alterar identidade ou data de criação. */
export type UpdateCardInput = Partial<
  Pick<Card, 'title' | 'description' | 'labelIds' | 'dueDate' | 'checklist'>
>;
