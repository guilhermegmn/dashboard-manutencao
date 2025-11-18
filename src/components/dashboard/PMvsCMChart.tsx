'use client'

import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Line,
  ComposedChart
} from "recharts";
import { MonthData } from "@/types/dashboard";

interface PMvsCMChartProps {
  data: MonthData[];
  target?: { value: number; min: number; worldClass: number };
}

/**
 * Gráfico de Manutenção Preventiva vs Corretiva
 * Mostra a proporção de PM/CM ao longo do tempo com linha de meta
 */
export const PMvsCMChart = memo(function PMvsCMChart({ data, target }: PMvsCMChartProps) {
  // Calcular dados do gráfico
  const chartData = data.map(month => {
    const preventive = month.maintenancePreventive || 0;
    const corrective = month.maintenanceCorrective || 0;
    const total = preventive + corrective;
    const pmPercentage = total > 0 ? (preventive / total) * 100 : 0;

    return {
      month: month.month,
      Preventiva: preventive,
      Corretiva: corrective,
      "PM %": Number(pmPercentage.toFixed(1)),
      Meta: target?.value || 80
    };
  });

  // Calcular PM% atual
  const lastMonth = chartData[chartData.length - 1];
  const currentPM = lastMonth?.["PM %"] || 0;

  // Determinar status
  const getStatus = () => {
    if (!target) return "good";
    if (currentPM >= target.worldClass) return "excellent";
    if (currentPM >= target.value) return "good";
    if (currentPM >= target.min) return "warning";
    return "critical";
  };

  const status = getStatus();

  const statusColors = {
    excellent: "#3B82F6",  // azul
    good: "#10B981",       // verde
    warning: "#F59E0B",    // amarelo
    critical: "#EF4444"    // vermelho
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 PM vs CM (Preventiva vs Corretiva)
        </h3>
        <p className="text-sm text-gray-500">Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            📊 PM vs CM (Preventiva vs Corretiva)
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              PM Atual: <span className={`font-bold text-${status}`} style={{ color: statusColors[status] }}>
                {currentPM.toFixed(1)}%
              </span>
            </div>
            {target && (
              <div className="text-sm text-gray-600">
                Meta: <span className="font-semibold">{target.value}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de Status */}
        <div className="mt-2 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[status] }}></div>
            <span className="text-gray-600">
              {status === "excellent" && "🏆 Classe Mundial"}
              {status === "good" && "✅ Atingindo Meta"}
              {status === "warning" && "⚠️ Abaixo da Meta"}
              {status === "critical" && "🔴 Crítico"}
            </span>
          </div>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">
            Target: &gt;{target?.value || 80}% Preventiva (World Class: {target?.worldClass || 90}%)
          </span>
        </div>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              yAxisId="left"
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
              label={{ value: "Quantidade", angle: -90, position: "insideLeft", style: { fontSize: "12px" } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6B7280"
              style={{ fontSize: "12px" }}
              label={{ value: "PM %", angle: 90, position: "insideRight", style: { fontSize: "12px" } }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "12px"
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
            />

            {/* Barras de Preventiva e Corretiva */}
            <Bar yAxisId="left" dataKey="Preventiva" fill="#10B981" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-p-${index}`} fill="#10B981" />
              ))}
            </Bar>
            <Bar yAxisId="left" dataKey="Corretiva" fill="#EF4444" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-c-${index}`} fill="#EF4444" />
              ))}
            </Bar>

            {/* Linha de PM% */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="PM %"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: "#3B82F6", r: 5 }}
              activeDot={{ r: 7 }}
            />

            {/* Linha de Meta */}
            {target && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Meta"
                stroke="#9CA3AF"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legenda detalhada */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700">
              <span className="font-semibold">Preventiva (PM):</span> Planejada e programada
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700">
              <span className="font-semibold">Corretiva (CM):</span> Quebra ou falha
            </span>
          </div>
        </div>

        {/* Indicador de Melhoria */}
        {chartData.length >= 2 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              {chartData[chartData.length - 1]["PM %"] > chartData[0]["PM %"] ? (
                <>
                  <span className="text-2xl">📈</span>
                  <div className="text-sm text-blue-900">
                    <span className="font-semibold">Tendência Positiva:</span> PM% aumentou de {chartData[0]["PM %"].toFixed(1)}%
                    para {chartData[chartData.length - 1]["PM %"].toFixed(1)}% no período (+
                    {(chartData[chartData.length - 1]["PM %"] - chartData[0]["PM %"]).toFixed(1)} pontos percentuais)
                  </div>
                </>
              ) : (
                <>
                  <span className="text-2xl">⚠️</span>
                  <div className="text-sm text-yellow-900">
                    <span className="font-semibold">Atenção:</span> PM% reduziu de {chartData[0]["PM %"].toFixed(1)}%
                    para {chartData[chartData.length - 1]["PM %"].toFixed(1)}% no período
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
