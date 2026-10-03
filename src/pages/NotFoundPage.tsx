// Informa que a rota solicitada não existe e oferece retorno aos quadros.
import { Link } from 'react-router-dom';
/**
 * Renderiza uma página acessível para URLs que não correspondem a um quadro.
 *
 * @returns A mensagem de rota não encontrada com navegação de retorno.
 */
export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center text-slate-900">
      <section aria-labelledby="not-found-title" className="max-w-md">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
          TaskFlow
        </p>
        <h1
          className="mt-4 text-3xl font-bold tracking-tight"
          id="not-found-title"
        >
          Quadro não encontrado
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Este endereço não corresponde a um quadro disponível. Volte à página
          inicial para escolher outro.
        </p>
        <Link
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to="/"
        >
          Voltar aos quadros
        </Link>
      </section>
    </main>
  );
}
