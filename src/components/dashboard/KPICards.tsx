import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, CheckCircle, AlertTriangle, AlertCircle, Trophy } from "lucide-react";
import { KPICard } from "@/types/dashboard";

interface KPICardsProps {
  kpiCards: KPICard[];
}

/**
 * Grid de cards de KPIs com tendências, metas e progresso
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

  const getStatusIcon = (status: KPICard["status"]) => {
    switch (status) {
      case "excellent":
        return <Trophy className="w-5 h-5 text-blue-500" />;
      case "good":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: KPICard["status"]) => {
    switch (status) {
      case "excellent":
        return "border-l-4 border-l-blue-500 bg-blue-50/30";
      case "good":
        return "border-l-4 border-l-green-500 bg-green-50/30";
      case "warning":
        return "border-l-4 border-l-yellow-500 bg-yellow-50/30";
      case "critical":
        return "border-l-4 border-l-red-500 bg-red-50/30";
    }
  };

  const getProgressBarColor = (status: KPICard["status"]) => {
    switch (status) {
      case "excellent":
        return "bg-blue-500";
      case "good":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
    }
  };

  const calculateProgress = (kpi: KPICard): number => {
    if (!kpi.target) return 0;

    // Para MTTR e Custo, menor é melhor (inverter lógica)
    const isLowerBetter = kpi.label.includes("MTTR") || kpi.label.includes("Custo");

    if (isLowerBetter) {
      // Para "menor é melhor", calcular % de redução da meta
      const progress = (kpi.target.value / kpi.numericValue) * 100;
      return Math.min(Math.max(progress, 0), 150); // Cap em 150%
    } else {
      // Para "maior é melhor", calcular % da meta
      const progress = (kpi.numericValue / kpi.target.value) * 100;
      return Math.min(Math.max(progress, 0), 150); // Cap em 150%
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {kpiCards.map((kpi, i) => {
        const progress = calculateProgress(kpi);

        return (
          <Card
            key={i}
            className={`bg-white shadow-lg border-0 rounded-xl overflow-hidden ${getStatusColor(kpi.status)}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {kpi.label.split(' ')[0]}
                </span>
                {getStatusIcon(kpi.status)}
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-2">
                {kpi.value}
              </div>

              {/* Progress Bar com Meta */}
              {kpi.target && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Meta: {kpi.target.value}{kpi.unit || ''}</span>
                    <span className="font-semibold">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressBarColor(kpi.status)}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tendência */}
              <div className="flex items-center space-x-2">
                {renderTrendIcon(kpi.trend)}
                <span
                  className={`text-sm font-medium ${
                    kpi.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {kpi.change}
                </span>
                <span className="text-xs text-gray-500">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
