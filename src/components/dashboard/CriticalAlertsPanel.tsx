'use client'

import { memo } from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { CriticalAlert } from "@/types/dashboard";

interface CriticalAlertsPanelProps {
  alerts: CriticalAlert[];
}

/**
 * Painel de Alertas Críticos
 * Exibe equipamentos com problemas de performance ou abaixo das metas
 */
export const CriticalAlertsPanel = memo(function CriticalAlertsPanel({
  alerts,
}: CriticalAlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">
              ✅ Todos os equipamentos dentro das metas
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Nenhum alerta crítico no momento
            </p>
          </div>
        </div>
      </div>
    );
  }

  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            🚨 Alertas Críticos
          </h2>
          <div className="flex items-center gap-4 text-sm">
            {criticalCount > 0 && (
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                {criticalCount} Crítico{criticalCount > 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-yellow-600 font-medium">
                <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                {warningCount} Aviso{warningCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {alerts.map((alert, index) => {
          const Icon = alert.severity === "critical" ? AlertTriangle :
                       alert.severity === "warning" ? AlertCircle : Info;

          const colorClasses = {
            critical: "bg-red-50 border-red-200 text-red-900",
            warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
            info: "bg-blue-50 border-blue-200 text-blue-900"
          };

          const iconColors = {
            critical: "text-red-600",
            warning: "text-yellow-600",
            info: "text-blue-600"
          };

          return (
            <div
              key={`${alert.equipmentId}-${alert.kpi}-${index}`}
              className={`px-6 py-4 flex items-start gap-4 ${
                alert.severity === "critical" ? "bg-red-50/30" :
                alert.severity === "warning" ? "bg-yellow-50/30" : ""
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[alert.severity]}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {alert.equipmentName}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {alert.message}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-gray-900">
                      {alert.kpi}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Atual: <span className="font-semibold">{alert.currentValue}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Meta: <span className="font-semibold">{alert.targetValue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
