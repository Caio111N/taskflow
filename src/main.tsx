// Inicializa a aplicação React no elemento raiz definido em index.html.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Não foi possível encontrar o elemento raiz da aplicação.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
