'use client'

import { useMemo, useState } from "react";
import { MonthData, KPICard, EquipmentWithAvailability } from "@/types/dashboard";
import { EQUIPMENT_DATA, PERIODS, TREND_THRESHOLD } from "@/lib/equipmentData";
import { useCSVImport } from "@/hooks/useCSVImport";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { KPICards } from "@/components/dashboard/KPICards";
import { MaintenanceChart } from "@/components/dashboard/MaintenanceChart";
import { EquipmentTable } from "@/components/dashboard/EquipmentTable";
import { CSVImportButton } from "@/components/dashboard/CSVImportButton";

/**
 * Dashboard principal de manutenção
 * Componente refatorado em partes menores para melhor manutenibilidade
 */
export default function MaintenanceDashboard() {
  const [periodId, setPeriodId] = useState("3m");
  const [category, setCategory] = useState("");
  const [equipmentId, setEquipmentId] = useState("");

  const { csvEquipments, handleCSVUpload, generateCSVTemplate } = useCSVImport();

  const period = useMemo(() => PERIODS.find((p) => p.id === periodId)!, [periodId]);
  const sourceData = csvEquipments ?? EQUIPMENT_DATA;

  const categories = useMemo(
    () => Array.from(new Set(sourceData.map(e => e.category))).sort(),
    [sourceData]
  );

  const equipmentOptions = useMemo(
    () => sourceData.filter(e => !category || e.category === category),
    [sourceData, category]
  );

  const filteredEquipments = useMemo(() => {
    let list = sourceData;
    if (category) list = list.filter(e => e.category === category);
    if (equipmentId) list = list.filter(e => e.id === equipmentId);
    return list;
  }, [sourceData, category, equipmentId]);

  const consolidatedHistory = useMemo(() => {
    if (filteredEquipments.length === 0) return [];

    return period.months.map(month => {
      const monthData = filteredEquipments
        .map(e => e.history.find(h => h.month === month))
        .filter((data): data is MonthData => data !== undefined);

      if (monthData.length === 0) {
        return { month, MTBF: 0, MTTR: 0, Disponibilidade: 0, Custo: 0 };
      }

      const avg = (key: keyof MonthData) =>
        monthData.reduce((acc, cur) => acc + (cur[key] as number), 0) / monthData.length;

      const sum = (key: keyof MonthData) =>
        monthData.reduce((acc, cur) => acc + (cur[key] as number), 0);

      return {
        month,
        MTBF: Math.round(avg("MTBF")),
        MTTR: Number(avg("MTTR").toFixed(2)),
        Disponibilidade: Number(avg("Disponibilidade").toFixed(1)),
        Custo: Number(sum("Custo").toFixed(2)),
      };
    });
  }, [filteredEquipments, period]);

  const kpiCards = useMemo((): KPICard[] => {
    if (consolidatedHistory.length === 0) {
      return [
        { label: "MTBF", value: "0h", trend: "up", change: "0%", status: "warning" },
        { label: "MTTR", value: "0h", trend: "up", change: "0%", status: "warning" },
        { label: "Disponibilidade", value: "0%", trend: "up", change: "0%", status: "warning" },
        { label: "Custo", value: "R$ 0M", trend: "up", change: "0%", status: "warning" },
      ];
    }

    const last = consolidatedHistory[consolidatedHistory.length - 1];
    const prev = consolidatedHistory[consolidatedHistory.length - 2] ?? last;

    const calculateChange = (current: number, previous: number, invertTrend = false) => {
      if (previous === 0) return { change: "0%", trend: "up" as const };

      const delta = ((current - previous) / previous) * 100;
      const change = `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`;
      const trend = invertTrend ?
        (delta <= 0 ? "up" : "down") :
        (delta >= 0 ? "up" : "down");

      return { change, trend } as const;
    };

    const mtbf = calculateChange(last.MTBF, prev.MTBF);
    const mttr = calculateChange(last.MTTR, prev.MTTR, true);
    const availability = calculateChange(last.Disponibilidade, prev.Disponibilidade);
    const cost = calculateChange(last.Custo, prev.Custo, true);

    return [
      {
        label: "MTBF (Mean Time Between Failures)",
        value: `${last.MTBF}h`,
        trend: mtbf.trend,
        change: mtbf.change,
        status: mtbf.trend === "up" ? "good" : "warning"
      },
      {
        label: "MTTR (Mean Time To Repair)",
        value: `${last.MTTR}h`,
        trend: mttr.trend,
        change: mttr.change,
        status: mttr.trend === "up" ? "good" : "warning"
      },
      {
        label: "Disponibilidade",
        value: `${last.Disponibilidade}%`,
        trend: availability.trend,
        change: availability.change,
        status: availability.trend === "up" ? "good" : "warning"
      },
      {
        label: "Custo de Manutenção",
        value: `R$ ${last.Custo.toFixed(2)}M`,
        trend: cost.trend,
        change: cost.change,
        status: cost.trend === "up" ? "good" : "warning"
      },
    ];
  }, [consolidatedHistory]);

  const equipmentsByAvailability = useMemo((): EquipmentWithAvailability[] => {
    const lastMonth = period.months[period.months.length - 1];
    const prevMonth = period.months[period.months.length - 2];

    return filteredEquipments.map(equipment => {
      const lastRecord = equipment.history.find(h => h.month === lastMonth);
      const prevRecord = equipment.history.find(h => h.month === prevMonth);

      const availability = lastRecord?.Disponibilidade ?? 0;
      const prevAvailability = prevRecord?.Disponibilidade ?? availability;
      const difference = availability - prevAvailability;

      let trend: "up" | "down" | "stable";
      if (difference > TREND_THRESHOLD) trend = "up";
      else if (difference < -TREND_THRESHOLD) trend = "down";
      else trend = "stable";

      return {
        ...equipment,
        availability,
        availabilityLabel: `${availability.toFixed(1)}%`,
        trend
      };
    }).sort((a, b) => b.availability - a.availability);
  }, [filteredEquipments, period]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de KPIs - Manutenção
            </h1>
            <p className="text-gray-600 mt-1">
              Monitoramento de performance dos equipamentos
            </p>
          </div>
          <CSVImportButton
            onCSVUpload={handleCSVUpload}
            onDownloadTemplate={generateCSVTemplate}
          />
        </div>

        {/* Filtros */}
        <FilterPanel
          periods={PERIODS}
          periodId={periodId}
          setPeriodId={setPeriodId}
          categories={categories}
          category={category}
          setCategory={setCategory}
          equipmentOptions={equipmentOptions}
          equipmentId={equipmentId}
          setEquipmentId={setEquipmentId}
        />

        {/* KPI Cards */}
        <KPICards kpiCards={kpiCards} />

        {/* Gráfico consolidado */}
        <MaintenanceChart data={consolidatedHistory} />

        {/* Tabela de equipamentos */}
        <EquipmentTable equipments={equipmentsByAvailability} />
      </div>
    </div>
  );
}
