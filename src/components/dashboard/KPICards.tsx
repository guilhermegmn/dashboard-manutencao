import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, CheckCircle, AlertTriangle } from "lucide-react";
import { KPICard } from "@/types/dashboard";

interface KPICardsProps {
  kpiCards: KPICard[];
}

/**
 * Grid de cards de KPIs com tendências
 * Otimizado com React.memo para evitar re-renders desnecessários
 */
export const KPICards = memo(function KPICards({ kpiCards }: KPICardsProps) {
  const renderTrendIcon = (trend: "up" | "down") => {
    return trend === "up" ? (
      <ArrowUp className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((kpi, i) => (
        <Card
          key={i}
          className="bg-white shadow-lg border-0 rounded-xl overflow-hidden"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                {kpi.label}
              </span>
              {kpi.status === "good" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-2">
              {kpi.value}
            </div>

            <div className="flex items-center space-x-2">
              {renderTrendIcon(kpi.trend)}
              <span
                className={`text-sm font-medium ${
                  kpi.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {kpi.change}
              </span>
              <span className="text-sm text-gray-500">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
