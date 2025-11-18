'use client'

import { useMemo, useState } from "react";
import { MonthData, KPICard, EquipmentWithAvailability, CriticalAlert } from "@/types/dashboard";
import { EQUIPMENT_DATA, PERIODS, TREND_THRESHOLD, KPI_TARGETS, PM_CM_TARGET, MOCK_BACKLOG } from "@/lib/equipmentData";
import { useCSVImport } from "@/hooks/useCSVImport";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { KPICards } from "@/components/dashboard/KPICards";
import { MaintenanceChart } from "@/components/dashboard/MaintenanceChart";
import { EquipmentTable } from "@/components/dashboard/EquipmentTable";
import { CSVImportButton } from "@/components/dashboard/CSVImportButton";
import { CriticalAlertsPanel } from "@/components/dashboard/CriticalAlertsPanel";
import { PMvsCMChart } from "@/components/dashboard/PMvsCMChart";
import { BacklogIndicator } from "@/components/dashboard/BacklogIndicator";
import { KPIDetailModal } from "@/components/dashboard/KPIDetailModal";

/**
 * Dashboard principal de manutenção
 * Componente refatorado em partes menores para melhor manutenibilidade
 */
export default function MaintenanceDashboard() {
  const [periodId, setPeriodId] = useState("3m");
  const [category, setCategory] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [selectedKPI, setSelectedKPI] = useState<KPICard | null>(null);

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
        return {
          month,
          MTBF: 0,
          MTTR: 0,
          Disponibilidade: 0,
          Performance: 0,
          Qualidade: 0,
          Custo: 0
        };
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
        Performance: Number(avg("Performance").toFixed(1)),
        Qualidade: Number(avg("Qualidade").toFixed(1)),
        Custo: Number(sum("Custo").toFixed(2)),
      };
    });
  }, [filteredEquipments, period]);

  const kpiCards = useMemo((): KPICard[] => {
    if (consolidatedHistory.length === 0) {
      return [
        {
          label: "MTBF",
          value: "0h",
          numericValue: 0,
          trend: "up",
          change: "0%",
          status: "warning",
          target: KPI_TARGETS.MTBF,
          unit: "h"
        },
        {
          label: "MTTR",
          value: "0h",
          numericValue: 0,
          trend: "up",
          change: "0%",
          status: "warning",
          target: KPI_TARGETS.MTTR,
          unit: "h"
        },
        {
          label: "Disponibilidade",
          value: "0%",
          numericValue: 0,
          trend: "up",
          change: "0%",
          status: "warning",
          target: KPI_TARGETS.Disponibilidade,
          unit: "%"
        },
        {
          label: "OEE",
          value: "0%",
          numericValue: 0,
          trend: "up",
          change: "0%",
          status: "warning",
          target: KPI_TARGETS.OEE,
          unit: "%"
        },
        {
          label: "Custo",
          value: "R$ 0M",
          numericValue: 0,
          trend: "up",
          change: "0%",
          status: "warning",
          target: KPI_TARGETS.Custo,
          unit: "M"
        },
      ];
    }

    const last = consolidatedHistory[consolidatedHistory.length - 1];
    const prev = consolidatedHistory[consolidatedHistory.length - 2] ?? last;

    // Calcular OEE = Disponibilidade × Performance × Qualidade
    const lastOEE = (last.Disponibilidade * last.Performance * last.Qualidade) / 10000;
    const prevOEE = (prev.Disponibilidade * prev.Performance * prev.Qualidade) / 10000;

    const calculateChange = (current: number, previous: number, invertTrend = false) => {
      if (previous === 0) return { change: "0%", trend: "up" as const };

      const delta = ((current - previous) / previous) * 100;
      const change = `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`;
      const trend = invertTrend ?
        (delta <= 0 ? "up" : "down") :
        (delta >= 0 ? "up" : "down");

      return { change, trend } as const;
    };

    // Função para calcular status baseado na meta
    const calculateStatus = (
      value: number,
      target: { value: number },
      isLowerBetter = false
    ): KPICard["status"] => {
      if (isLowerBetter) {
        // Para MTTR e Custo, menor é melhor
        return value <= target.value ? "good" : "warning";
      } else {
        // Para MTBF, Disponibilidade, OEE, maior é melhor
        return value >= target.value ? "good" : "warning";
      }
    };

    const mtbf = calculateChange(last.MTBF, prev.MTBF);
    const mttr = calculateChange(last.MTTR, prev.MTTR, true);
    const availability = calculateChange(last.Disponibilidade, prev.Disponibilidade);
    const oee = calculateChange(lastOEE, prevOEE);
    const cost = calculateChange(last.Custo, prev.Custo, true);

    return [
      {
        label: "MTBF (Mean Time Between Failures)",
        value: `${last.MTBF}h`,
        numericValue: last.MTBF,
        trend: mtbf.trend,
        change: mtbf.change,
        status: calculateStatus(last.MTBF, KPI_TARGETS.MTBF),
        target: KPI_TARGETS.MTBF,
        unit: "h"
      },
      {
        label: "MTTR (Mean Time To Repair)",
        value: `${last.MTTR}h`,
        numericValue: last.MTTR,
        trend: mttr.trend,
        change: mttr.change,
        status: calculateStatus(last.MTTR, KPI_TARGETS.MTTR, true),
        target: KPI_TARGETS.MTTR,
        unit: "h"
      },
      {
        label: "Disponibilidade",
        value: `${last.Disponibilidade}%`,
        numericValue: last.Disponibilidade,
        trend: availability.trend,
        change: availability.change,
        status: calculateStatus(last.Disponibilidade, KPI_TARGETS.Disponibilidade),
        target: KPI_TARGETS.Disponibilidade,
        unit: "%"
      },
      {
        label: "OEE (Overall Equipment Effectiveness)",
        value: `${lastOEE.toFixed(1)}%`,
        numericValue: lastOEE,
        trend: oee.trend,
        change: oee.change,
        status: calculateStatus(lastOEE, KPI_TARGETS.OEE),
        target: KPI_TARGETS.OEE,
        unit: "%"
      },
      {
        label: "Custo de Manutenção",
        value: `R$ ${last.Custo.toFixed(2)}M`,
        numericValue: last.Custo,
        trend: cost.trend,
        change: cost.change,
        status: calculateStatus(last.Custo, KPI_TARGETS.Custo, true),
        target: KPI_TARGETS.Custo,
        unit: "M"
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

  // Gerar alertas críticos baseados nos KPIs e metas
  const criticalAlerts = useMemo((): CriticalAlert[] => {
    const alerts: CriticalAlert[] = [];
    const lastMonth = period.months[period.months.length - 1];

    filteredEquipments.forEach(equipment => {
      const lastRecord = equipment.history.find(h => h.month === lastMonth);
      if (!lastRecord) return;

      // Alerta de Disponibilidade
      if (lastRecord.Disponibilidade < KPI_TARGETS.Disponibilidade.min) {
        alerts.push({
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          message: `Disponibilidade crítica: ${lastRecord.Disponibilidade.toFixed(1)}% está abaixo do mínimo aceitável de ${KPI_TARGETS.Disponibilidade.min}%`,
          severity: "critical",
          kpi: "Disponibilidade",
          currentValue: lastRecord.Disponibilidade,
          targetValue: KPI_TARGETS.Disponibilidade.value
        });
      } else if (lastRecord.Disponibilidade < KPI_TARGETS.Disponibilidade.value) {
        alerts.push({
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          message: `Disponibilidade abaixo da meta: ${lastRecord.Disponibilidade.toFixed(1)}% (meta: ${KPI_TARGETS.Disponibilidade.value}%)`,
          severity: "warning",
          kpi: "Disponibilidade",
          currentValue: lastRecord.Disponibilidade,
          targetValue: KPI_TARGETS.Disponibilidade.value
        });
      }

      // Alerta de MTBF
      if (lastRecord.MTBF < KPI_TARGETS.MTBF.min) {
        alerts.push({
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          message: `MTBF crítico: ${lastRecord.MTBF}h está abaixo do mínimo de ${KPI_TARGETS.MTBF.min}h`,
          severity: "critical",
          kpi: "MTBF",
          currentValue: lastRecord.MTBF,
          targetValue: KPI_TARGETS.MTBF.value
        });
      }

      // Alerta de MTTR
      if (lastRecord.MTTR > KPI_TARGETS.MTTR.min) {
        alerts.push({
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          message: `MTTR crítico: ${lastRecord.MTTR}h está acima do máximo aceitável de ${KPI_TARGETS.MTTR.min}h`,
          severity: "critical",
          kpi: "MTTR",
          currentValue: lastRecord.MTTR,
          targetValue: KPI_TARGETS.MTTR.value
        });
      }

      // Alerta de OEE
      const oee = (lastRecord.Disponibilidade * lastRecord.Performance * lastRecord.Qualidade) / 10000;
      if (oee < KPI_TARGETS.OEE.min) {
        alerts.push({
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          message: `OEE crítico: ${oee.toFixed(1)}% está abaixo do mínimo de ${KPI_TARGETS.OEE.min}%`,
          severity: "critical",
          kpi: "OEE",
          currentValue: oee,
          targetValue: KPI_TARGETS.OEE.value
        });
      }

      // Alerta de equipamentos críticos parados
      if (equipment.criticality === "A" && equipment.status === "Parado") {
        alerts.push({
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          message: `Equipamento CRÍTICO parado - Impacto direto na produção`,
          severity: "critical",
          kpi: "Status",
          currentValue: 0,
          targetValue: 100
        });
      }
    });

    // Ordenar por severidade (critical primeiro)
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
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

        {/* Alertas Críticos */}
        <CriticalAlertsPanel alerts={criticalAlerts} />

        {/* KPI Cards */}
        <KPICards kpiCards={kpiCards} onKPIClick={setSelectedKPI} />

        {/* Gráfico consolidado */}
        <MaintenanceChart data={consolidatedHistory} />

        {/* PM vs CM Chart */}
        <PMvsCMChart data={consolidatedHistory} target={PM_CM_TARGET} />

        {/* Backlog Indicator */}
        <BacklogIndicator backlog={MOCK_BACKLOG} />

        {/* Tabela de equipamentos */}
        <EquipmentTable equipments={equipmentsByAvailability} />
      </div>

      {/* Modal de Drill-Down */}
      <KPIDetailModal
        kpi={selectedKPI}
        history={consolidatedHistory}
        onClose={() => setSelectedKPI(null)}
      />
    </div>
  );
}
