# 🗂️ TaskFlow

Aplicação Kanban inspirada no Trello para organizar quadros, listas e cartões.

![Status](https://img.shields.io/badge/status-MVP-blue)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-green)

<!-- Adicione uma captura de tela do quadro em docs/screenshots/board.png. -->

![Prévia do quadro TaskFlow](docs/screenshots/board.png)

**Demo:** [Preencher após o deploy](https://SEU-DOMINIO-AQUI)

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como rodar](#como-rodar)
- [Scripts disponíveis](#scripts-disponíveis)
- [Atalhos de teclado](#atalhos-de-teclado)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Decisões de arquitetura](#decisões-de-arquitetura)
- [Testes](#testes)
- [Roadmap](#roadmap)
- [Autor](#autor)
- [Licença](#licença)

## Funcionalidades

- Criar, renomear, personalizar a cor e excluir quadros.
- Criar, renomear e excluir listas e cartões.
- Reordenar listas e mover cartões dentro ou entre listas com `@dnd-kit`.
- Editar o título, a descrição e a data de vencimento de cartões.
- Criar etiquetas no quadro e associá-las aos cartões.
- Adicionar, concluir e remover itens de checklist.
- Buscar cartões por título ou descrição, sem diferenciar acentos ou caixa.
- Filtrar cartões por etiqueta e por vencimento: atrasados, hoje ou futuros,
  sem vencimento.
- Alternar entre tema claro e escuro.
- Persistir o estado no `localStorage` do navegador.
- Usar drag-and-drop por ponteiro, toque e teclado.
- Desativar arraste de cartões durante uma busca ou filtro para preservar a
  semântica de reordenação dos resultados.
- Respeitar a preferência do sistema por movimento reduzido.

## Tecnologias

| Categoria               | Ferramenta                                                  |
| ----------------------- | ----------------------------------------------------------- |
| Interface               | React 18                                                    |
| Linguagem               | TypeScript                                                  |
| Desenvolvimento e build | Vite                                                        |
| Estilização             | Tailwind CSS                                                |
| Estado e persistência   | Zustand                                                     |
| Drag-and-drop           | `@dnd-kit/core`, `@dnd-kit/sortable` e `@dnd-kit/utilities` |
| Ícones                  | Lucide React                                                |
| Testes                  | Vitest, Testing Library e jest-dom                          |
| Qualidade de código     | ESLint e Prettier                                           |

## Como rodar

### Pré-requisitos

- Node.js 20.19.0 ou superior.
- npm.
- Git.

### Instalação

Clone o repositório, entre na pasta, instale as dependências e inicie o servidor
de desenvolvimento:

```sh
git clone https://github.com/Caio111N/taskflow.git
cd taskflow
npm install
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir no navegador.

## Scripts disponíveis

| Script         | Comando                | Descrição                                                   |
| -------------- | ---------------------- | ----------------------------------------------------------- |
| `dev`          | `npm run dev`          | Inicia o servidor de desenvolvimento do Vite.               |
| `build`        | `npm run build`        | Verifica os projetos TypeScript e gera o build de produção. |
| `preview`      | `npm run preview`      | Pré-visualiza localmente o build de produção.               |
| `lint`         | `npm run lint`         | Executa ESLint sem aceitar warnings.                        |
| `test`         | `npm test`             | Executa a suíte uma vez com Vitest.                         |
| `test:watch`   | `npm run test:watch`   | Executa Vitest em modo de observação.                       |
| `format`       | `npm run format`       | Formata os arquivos com Prettier.                           |
| `format:check` | `npm run format:check` | Verifica a formatação sem alterar os arquivos.              |

## Atalhos de teclado

- `/`: foca a busca do quadro quando o foco atual não está em um campo editável.
- `Esc` na busca: limpa o texto e todos os filtros ativos.
- `Esc` em um diálogo: fecha o diálogo.
- Nas alças de listas e cartões, `Space` inicia ou conclui o arraste; as setas
  movem o item durante o arraste.

## Estrutura de pastas

```text
src/
├── app/                         # Rotas e sincronização do tema com o documento
│   └── App.tsx
├── components/                  # Componentes de interface
│   ├── board/                   # Cartão e listagem de quadros
│   │   ├── .gitkeep
│   │   ├── BoardCard.tsx
│   │   └── BoardList.tsx
│   ├── card/                    # Cartão, modal, etiquetas e checklist
│   │   ├── .gitkeep
│   │   ├── CardModal.tsx
│   │   ├── Checklist.test.tsx
│   │   ├── Checklist.tsx
│   │   ├── LabelPicker.tsx
│   │   └── TaskCard.tsx
│   ├── list/                    # Colunas, cabeçalho e formulário de listas
│   │   ├── .gitkeep
│   │   ├── AddListForm.test.tsx
│   │   ├── AddListForm.tsx
│   │   ├── ListColumn.tsx
│   │   └── ListHeader.tsx
│   └── ui/                      # Controles genéricos sem regras do domínio
│       ├── .gitkeep
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── ProgressBar.tsx
│       └── ThemeToggle.tsx
├── hooks/                       # Reservado para hooks compartilhados
│   └── .gitkeep
├── pages/                       # Páginas inicial, quadro e rota não encontrada
│   ├── .gitkeep
│   ├── BoardPage.tsx
│   ├── HomePage.tsx
│   └── NotFoundPage.tsx
├── store/                       # Estado, ações de domínio e testes da store
│   ├── .gitkeep
│   ├── boardStore.test.ts
│   └── boardStore.ts
├── tests/                       # Configuração compartilhada do Vitest
│   └── setup.ts
├── types/                       # Contratos tipados do domínio
│   └── index.ts
├── utils/                       # Reservado para utilitários compartilhados
│   └── .gitkeep
├── index.css                    # Tailwind e estilos globais/tema
└── main.tsx                     # Inicialização do React
```

## Decisões de arquitetura

- **Estado normalizado:** quadros, listas e cartões ficam em registros
  indexados por ID; as relações guardam arrays de IDs. Isso evita duplicar
  objetos relacionados e mantém atualizações localizadas.
- **Lógica de domínio fora da interface:** validações e operações CRUD,
  movimentação e reordenação ficam em `store/boardStore.ts`. Assim, as regras
  podem ser testadas sem renderizar a interface e os componentes apenas
  coordenam ações e apresentação.
- **Componentes `ui/` sem conhecimento do domínio:** `Button`, `Input`, `Modal`,
  `Badge` e `ProgressBar` recebem propriedades e conteúdo genéricos. Isso
  permite reutilizá-los sem acoplá-los a quadros, listas ou cartões.
- **Seletores Zustand:** páginas e componentes selecionam somente os dados e
  ações de que precisam. Isso reduz assinaturas a mudanças irrelevantes e deixa
  explícita a dependência de cada parte da interface.
- **Reordenação imutável:** `reorderLists` e `moveCard` copiam os arrays de IDs
  antes de reorganizá-los, em vez de modificar as relações existentes no
  estado. Isso preserva as referências anteriores usadas pelo Zustand e React.
- **Persistência com `persist`:** o middleware Zustand salva a store normalizada
  em `localStorage`, mantendo os quadros após recarregar sem exigir servidor.
  Por isso, os dados são locais ao navegador e não sincronizam entre
  dispositivos.

## Testes

Execute a suíte com:

```sh
npm test
```

Para acompanhar alterações durante o desenvolvimento:

```sh
npm run test:watch
```

Os testes cobrem criação de quadros, listas e cartões; validação e atualização
de cartões; checklist e etiquetas; movimentação e reordenação, incluindo
validação de pertencimento; exclusão e integridade das relações; e interações
dos componentes `AddListForm` e `Checklist`.

## Roadmap

- [x] Aplicação Kanban no navegador com quadros, listas e cartões.
- [x] Reordenação e movimentação por drag-and-drop.
- [x] Detalhes de cartão, etiquetas e checklist.
- [x] Busca, filtros e atalhos de teclado.
- [x] Tema claro/escuro, responsividade e acessibilidade.
- [x] Testes da store e de componentes.
- [x] Documentação do projeto.
- [ ] Backend e persistência remota.
- [ ] Autenticação de usuários.
- [ ] Colaboração em tempo real.
- [ ] Anexos em cartões.
- [ ] Exportar e importar dados em JSON.

## Autor

**Caio Nicollas**

- GitHub: [@Caio111N](https://github.com/Caio111N)
- LinkedIn: [Adicionar link do LinkedIn](https://www.linkedin.com/)

## Licença

Distribuído sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE).
