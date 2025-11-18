import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { MonthData } from "@/types/dashboard";

interface MaintenanceChartProps {
  data: MonthData[];
}

/**
 * Gráfico de linha mostrando tendência consolidada dos KPIs
 * Otimizado com React.memo para evitar re-renders desnecessários
 */
export const MaintenanceChart = memo(function MaintenanceChart({ data }: MaintenanceChartProps) {
  return (
    <Card className="bg-white shadow-lg border-0 rounded-xl">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Tendência Consolidada dos KPIs
        </h2>
        {data.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="MTBF"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  name="MTBF (h)"
                />
                <Line
                  type="monotone"
                  dataKey="MTTR"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                  name="MTTR (h)"
                />
                <Line
                  type="monotone"
                  dataKey="Disponibilidade"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  name="Disponibilidade (%)"
                />
                <Line
                  type="monotone"
                  dataKey="Custo"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                  name="Custo (R$ M)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Nenhum dado disponível para o período selecionado
          </div>
        )}
      </CardContent>
    </Card>
  );
});
