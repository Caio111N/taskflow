// Define as rotas da aplicação e sincroniza o tema visual com o documento.
import { useLayoutEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { BoardPage } from '../pages/BoardPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { useBoardStore } from '../store/boardStore';

/**
 * Renderiza as rotas e sincroniza o tema selecionado com o documento.
 *
 * @returns O roteador da aplicação com suas páginas.
 */
export default function App() {
  const theme = useBoardStore((state) => state.theme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<BoardPage />} path="/boards/:boardId" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
