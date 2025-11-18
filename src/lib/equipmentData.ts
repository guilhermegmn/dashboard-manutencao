import { Equipment, Period, KPITarget } from "@/types/dashboard";

/**
 * Dados mockados de equipamentos para demonstração
 * Agora incluindo Performance e Qualidade para cálculo de OEE
 */
export const EQUIPMENT_DATA: Equipment[] = [
  {
    id: "comp-a1",
    name: "Compressor A1",
    category: "Compressão",
    criticality: "A",  // Crítico - para produção
    history: [
      { month: "Mai", MTBF: 280, MTTR: 3.4, Disponibilidade: 90, Performance: 88, Qualidade: 96, Custo: 0.5 },
      { month: "Jun", MTBF: 310, MTTR: 3.1, Disponibilidade: 92, Performance: 90, Qualidade: 97, Custo: 0.45 },
      { month: "Jul", MTBF: 360, MTTR: 2.8, Disponibilidade: 95, Performance: 92, Qualidade: 98, Custo: 0.4 },
      { month: "Ago", MTBF: 390, MTTR: 2.6, Disponibilidade: 96, Performance: 93, Qualidade: 98, Custo: 0.35 },
    ],
    status: "Operacional",
  },
  {
    id: "este-b2",
    name: "Esteira B2",
    category: "Movimentação",
    criticality: "B",  // Importante - impacto moderado
    history: [
      { month: "Mai", MTBF: 330, MTTR: 2.7, Disponibilidade: 93, Performance: 91, Qualidade: 98, Custo: 0.38 },
      { month: "Jun", MTBF: 360, MTTR: 2.6, Disponibilidade: 95, Performance: 93, Qualidade: 98, Custo: 0.36 },
      { month: "Jul", MTBF: 410, MTTR: 2.4, Disponibilidade: 97, Performance: 94, Qualidade: 99, Custo: 0.34 },
      { month: "Ago", MTBF: 440, MTTR: 2.2, Disponibilidade: 98, Performance: 95, Qualidade: 99, Custo: 0.33 },
    ],
    status: "Manutenção Programada",
  },
  {
    id: "motor-c3",
    name: "Motor C3",
    category: "Motorização",
    criticality: "A",  // Crítico - motor principal
    history: [
      { month: "Mai", MTBF: 270, MTTR: 3.2, Disponibilidade: 91, Performance: 85, Qualidade: 95, Custo: 0.62 },
      { month: "Jun", MTBF: 295, MTTR: 3.0, Disponibilidade: 92, Performance: 87, Qualidade: 96, Custo: 0.58 },
      { month: "Jul", MTBF: 330, MTTR: 2.9, Disponibilidade: 94, Performance: 89, Qualidade: 96, Custo: 0.56 },
      { month: "Ago", MTBF: 365, MTTR: 2.7, Disponibilidade: 95, Performance: 90, Qualidade: 97, Custo: 0.52 },
    ],
    status: "Parado",
  },
];

/**
 * Metas e benchmarks para KPIs - baseado em padrões ISO 55000 e TPM
 */
export const KPI_TARGETS = {
  MTBF: {
    value: 400,        // Meta (horas)
    min: 350,          // Mínimo aceitável
    worldClass: 500    // Classe mundial
  } as KPITarget,
  MTTR: {
    value: 2,          // Meta (horas)
    min: 3,            // Máximo aceitável
    worldClass: 1      // Classe mundial
  } as KPITarget,
  Disponibilidade: {
    value: 95,         // Meta (%)
    min: 90,           // Mínimo aceitável
    worldClass: 98     // Classe mundial
  } as KPITarget,
  OEE: {
    value: 85,         // Meta (%) - TPM Standard
    min: 60,           // Mínimo aceitável
    worldClass: 90     // Classe mundial
  } as KPITarget,
  Custo: {
    value: 0.4,        // Meta (R$ Milhões)
    min: 0.6,          // Máximo aceitável
    worldClass: 0.3    // Classe mundial
  } as KPITarget,
};

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
