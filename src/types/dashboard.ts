/**
 * Tipos e interfaces para o Dashboard de Manutenção
 */

export interface MonthData {
  month: string;
  MTBF: number;
  MTTR: number;
  Disponibilidade: number;
  Custo: number;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  history: MonthData[];
}

export interface KPICard {
  label: string;
  value: string;
  trend: "up" | "down";
  change: string;
  status: "good" | "warning";
}

export interface Period {
  id: string;
  label: string;
  months: string[];
}

export interface EquipmentWithAvailability extends Equipment {
  availability: number;
  availabilityLabel: string;
  trend: "up" | "down" | "stable";
}

export type TrendType = "up" | "down" | "stable";
