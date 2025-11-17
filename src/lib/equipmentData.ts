import { Equipment, Period } from "@/types/dashboard";

/**
 * Dados mockados de equipamentos para demonstração
 */
export const EQUIPMENT_DATA: Equipment[] = [
  {
    id: "comp-a1",
    name: "Compressor A1",
    category: "Compressão",
    history: [
      { month: "Mai", MTBF: 280, MTTR: 3.4, Disponibilidade: 90, Custo: 0.5 },
      { month: "Jun", MTBF: 310, MTTR: 3.1, Disponibilidade: 92, Custo: 0.45 },
      { month: "Jul", MTBF: 360, MTTR: 2.8, Disponibilidade: 95, Custo: 0.4 },
      { month: "Ago", MTBF: 390, MTTR: 2.6, Disponibilidade: 96, Custo: 0.35 },
    ],
    status: "Operacional",
  },
  {
    id: "este-b2",
    name: "Esteira B2",
    category: "Movimentação",
    history: [
      { month: "Mai", MTBF: 330, MTTR: 2.7, Disponibilidade: 93, Custo: 0.38 },
      { month: "Jun", MTBF: 360, MTTR: 2.6, Disponibilidade: 95, Custo: 0.36 },
      { month: "Jul", MTBF: 410, MTTR: 2.4, Disponibilidade: 97, Custo: 0.34 },
      { month: "Ago", MTBF: 440, MTTR: 2.2, Disponibilidade: 98, Custo: 0.33 },
    ],
    status: "Manutenção Programada",
  },
  {
    id: "motor-c3",
    name: "Motor C3",
    category: "Motorização",
    history: [
      { month: "Mai", MTBF: 270, MTTR: 3.2, Disponibilidade: 91, Custo: 0.62 },
      { month: "Jun", MTBF: 295, MTTR: 3.0, Disponibilidade: 92, Custo: 0.58 },
      { month: "Jul", MTBF: 330, MTTR: 2.9, Disponibilidade: 94, Custo: 0.56 },
      { month: "Ago", MTBF: 365, MTTR: 2.7, Disponibilidade: 95, Custo: 0.52 },
    ],
    status: "Parado",
  },
];

/**
 * Períodos disponíveis para filtro
 */
export const PERIODS: Period[] = [
  { id: "2m", label: "Últimos 2 meses", months: ["Jul", "Ago"] },
  { id: "3m", label: "Últimos 3 meses", months: ["Jun", "Jul", "Ago"] },
  { id: "4m", label: "Últimos 4 meses", months: ["Mai", "Jun", "Jul", "Ago"] },
];

/**
 * Ordem dos meses para ordenação correta
 */
export const MONTH_ORDER = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

/**
 * Threshold para determinar se a tendência é estável
 */
export const TREND_THRESHOLD = 0.5;
