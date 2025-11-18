/**
 * Tipos e interfaces para o Dashboard de Manutenção
 */

export interface MonthData {
  month: string;
  MTBF: number;
  MTTR: number;
  Disponibilidade: number;
  Performance: number;  // % - Para cálculo do OEE
  Qualidade: number;    // % - Para cálculo do OEE
  Custo: number;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  criticality: "A" | "B" | "C";  // A=Crítico, B=Importante, C=Normal
  history: MonthData[];
}

export interface KPITarget {
  value: number;
  min: number;      // Mínimo aceitável
  worldClass: number;  // Benchmark classe mundial
}

export interface KPICard {
  label: string;
  value: string;
  numericValue: number;  // Valor numérico para comparação
  trend: "up" | "down";
  change: string;
  status: "excellent" | "good" | "warning" | "critical";
  target?: KPITarget;  // Meta e benchmarks
  unit?: string;  // Unidade de medida
}

export interface CriticalAlert {
  equipmentId: string;
  equipmentName: string;
  message: string;
  severity: "critical" | "warning" | "info";
  kpi: string;
  currentValue: number;
  targetValue: number;
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
