const FUSO_BRASILIA = 'America/Sao_Paulo';

/**
 * Formata uma data de calendário vinda da API ("2026-11-13T00:00:00") como
 * "13/11/2026". Lê direto a parte "YYYY-MM-DD": passar por `new Date()`
 * trataria o valor como meia-noite UTC e mostraria o dia anterior no Brasil.
 */
export function formatarDataCalendario(valor: string | null | undefined): string | null {
  const partes = valor?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!partes) return null;
  const [, ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

// Instantes chegam em UTC com "Z"; se algum vier sem fuso, assume UTC também.
function paraDate(instante: string): Date {
  const temFuso = /(Z|[+-]\d{2}:?\d{2})$/i.test(instante);
  return new Date(temFuso ? instante : `${instante}Z`);
}

/** Instante UTC → "13/11/2026 08:05" no horário de Brasília. */
export function formatarDataHoraBrasilia(instante: string): string {
  return paraDate(instante)
    .toLocaleString('pt-BR', {
      timeZone: FUSO_BRASILIA,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', '');
}

/** Instante UTC → "08:05" no horário de Brasília. */
export function formatarHoraBrasilia(instante: string): string {
  return paraDate(instante).toLocaleTimeString('pt-BR', {
    timeZone: FUSO_BRASILIA,
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Instante UTC → milissegundos, pra calcular intervalos. */
export function instanteEmMs(instante: string): number {
  return paraDate(instante).getTime();
}

/** Dia de hoje em Brasília como "YYYY-MM-DD" (toISOString usaria o dia em UTC). */
export function hojeEmBrasilia(): string {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_BRASILIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const valor = (tipo: Intl.DateTimeFormatPartTypes) => partes.find((p) => p.type === tipo)?.value ?? '';
  return `${valor('year')}-${valor('month')}-${valor('day')}`;
}
