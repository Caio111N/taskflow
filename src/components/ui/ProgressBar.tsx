// Apresenta progresso numérico em uma barra compatível com tecnologias assistivas.

/** Propriedades necessárias para representar um progresso limitado. */
export interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  className?: string;
}

/**
 * Renderiza o progresso dentro do intervalo entre zero e o valor máximo.
 *
 * @param props Valor atual, máximo, nome acessível e classes adicionais.
 * @returns Uma barra de progresso com atributos ARIA.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  className = '',
}: ProgressBarProps) {
  const safeMax = Math.max(max, 0);
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = safeMax === 0 ? 0 : (safeValue / safeMax) * 100;

  return (
    <div
      aria-label={label}
      aria-valuemax={safeMax}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={`h-2 overflow-hidden rounded-full bg-slate-200 ${className}`}
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-indigo-600 transition-[width] duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
