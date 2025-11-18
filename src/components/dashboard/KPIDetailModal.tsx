'use client'

import { memo } from "react";
import { X, TrendingUp, TrendingDown, Target, Award, AlertTriangle } from "lucide-react";
import { KPICard, MonthData } from "@/types/dashboard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface KPIDetailModalProps {
  kpi: KPICard | null;
  history: MonthData[];
  onClose: () => void;
}

/**
 * Modal de Drill-Down para KPIs
 * Mostra detalhes completos do KPI selecionado com histórico e análise
 */
export const KPIDetailModal = memo(function KPIDetailModal({
  kpi,
  history,
  onClose
}: KPIDetailModalProps) {
  if (!kpi) return null;

  // Extrair o KPI name do label (primeira palavra)
  const kpiName = kpi.label.split(' ')[0];

  // Preparar dados do gráfico baseado no KPI
  const getChartData = () => {
    return history.map(month => {
      let value = 0;

      switch (kpiName) {
        case "MTBF":
          value = month.MTBF;
          break;
        case "MTTR":
          value = month.MTTR;
          break;
        case "Disponibilidade":
          value = month.Disponibilidade;
          break;
        case "OEE":
          value = (month.Disponibilidade * month.Performance * month.Qualidade) / 10000;
          break;
        case "Custo":
          value = month.Custo;
          break;
      }

      return {
        month: month.month,
        value: Number(value.toFixed(2))
      };
    });
  };

  const chartData = getChartData();

  // Calcular estatísticas
  const values = chartData.map(d => d.value);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Determinar se maior é melhor ou menor é melhor
  const isHigherBetter = !kpiName.includes("MTTR") && !kpiName.includes("Custo");

  const statusConfig = {
    excellent: { color: "#3B82F6", label: "Excelente", icon: Award },
    good: { color: "#10B981", label: "Bom", icon: TrendingUp },
    warning: { color: "#F59E0B", label: "Atenção", icon: AlertTriangle },
    critical: { color: "#EF4444", label: "Crítico", icon: TrendingDown }
  };

  const currentStatus = statusConfig[kpi.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{kpi.label}</h2>
            <p className="text-sm text-gray-500 mt-1">Análise detalhada do indicador</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Card de Valor Atual */}
          <div className={`p-6 rounded-xl border-2`} style={{ borderColor: currentStatus.color, backgroundColor: `${currentStatus.color}10` }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Valor Atual</div>
                <div className="text-4xl font-bold" style={{ color: currentStatus.color }}>
                  {kpi.value}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-semibold ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {kpi.change}
                  </span>
                  <span className="text-sm text-gray-500">vs período anterior</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: `${currentStatus.color}20` }}>
                  <StatusIcon className="w-5 h-5" style={{ color: currentStatus.color }} />
                  <span className="font-semibold" style={{ color: currentStatus.color }}>
                    {currentStatus.label}
                  </span>
                </div>

                {kpi.target && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Meta</div>
                    <div className="text-lg font-bold text-gray-900">
                      {kpi.target.value}{kpi.unit || ''}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gráfico de Histórico */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">📈 Histórico de Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />

                {/* Linha de Meta */}
                {kpi.target && (
                  <ReferenceLine
                    y={kpi.target.value}
                    stroke="#10B981"
                    strokeDasharray="5 5"
                    label={{ value: "Meta", position: "right", fill: "#10B981", fontSize: 12 }}
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={currentStatus.color}
                  strokeWidth={3}
                  dot={{ fill: currentStatus.color, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Estatísticas */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">📊 Estatísticas do Período</h3>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Média</div>
                <div className="text-xl font-bold text-gray-900">
                  {average.toFixed(2)}{kpi.unit || ''}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">{isHigherBetter ? "Máximo" : "Mínimo"}</div>
                <div className="text-xl font-bold text-green-600">
                  {isHigherBetter ? max.toFixed(2) : min.toFixed(2)}{kpi.unit || ''}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">{isHigherBetter ? "Mínimo" : "Máximo"}</div>
                <div className="text-xl font-bold text-red-600">
                  {isHigherBetter ? min.toFixed(2) : max.toFixed(2)}{kpi.unit || ''}
                </div>
              </div>
            </div>
          </div>

          {/* Informações Adicionais por KPI */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Sobre este Indicador</h3>
            <div className="text-sm text-blue-800 space-y-1">
              {kpiName === "MTBF" && (
                <>
                  <p><strong>Definição:</strong> Mean Time Between Failures - Tempo médio entre falhas</p>
                  <p><strong>Objetivo:</strong> Quanto maior, melhor. Indica confiabilidade do equipamento.</p>
                  <p><strong>Fórmula:</strong> Tempo de operação / Número de falhas</p>
                </>
              )}
              {kpiName === "MTTR" && (
                <>
                  <p><strong>Definição:</strong> Mean Time To Repair - Tempo médio de reparo</p>
                  <p><strong>Objetivo:</strong> Quanto menor, melhor. Indica eficiência de manutenção.</p>
                  <p><strong>Fórmula:</strong> Tempo total de reparo / Número de reparos</p>
                </>
              )}
              {kpiName === "Disponibilidade" && (
                <>
                  <p><strong>Definição:</strong> Percentual de tempo que o equipamento está disponível</p>
                  <p><strong>Objetivo:</strong> Quanto maior, melhor. Meta: &gt;95%</p>
                  <p><strong>Fórmula:</strong> (Tempo operacional / Tempo total) × 100</p>
                </>
              )}
              {kpiName === "OEE" && (
                <>
                  <p><strong>Definição:</strong> Overall Equipment Effectiveness - Eficácia Global do Equipamento</p>
                  <p><strong>Objetivo:</strong> Quanto maior, melhor. World Class: &gt;85%</p>
                  <p><strong>Fórmula:</strong> Disponibilidade × Performance × Qualidade</p>
                </>
              )}
              {kpiName === "Custo" && (
                <>
                  <p><strong>Definição:</strong> Custo total de manutenção no período</p>
                  <p><strong>Objetivo:</strong> Quanto menor, melhor (sem comprometer qualidade)</p>
                  <p><strong>Componentes:</strong> Mão de obra, peças, paradas não planejadas</p>
                </>
              )}
            </div>
          </div>

          {/* Botão de Fechar */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
