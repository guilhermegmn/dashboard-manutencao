'use client'

import { memo } from "react";
import { Clock, AlertCircle, CheckCircle2, Wrench } from "lucide-react";
import { BacklogData } from "@/types/dashboard";

interface BacklogIndicatorProps {
  backlog: BacklogData;
}

/**
 * Indicador de Backlog de Manutenção
 * Mostra ordens pendentes, atrasadas e tempo médio de espera
 */
export const BacklogIndicator = memo(function BacklogIndicator({ backlog }: BacklogIndicatorProps) {
  const {
    totalOrders,
    pendingOrders,
    overdueOrders,
    avgWaitTime,
    orders
  } = backlog;

  // Calcular percentual de backlog
  const backlogPercentage = totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0;

  // Determinar status
  const getStatus = () => {
    if (overdueOrders > 5) return "critical";
    if (overdueOrders > 2 || backlogPercentage > 60) return "warning";
    if (backlogPercentage > 40) return "attention";
    return "good";
  };

  const status = getStatus();

  const statusColors = {
    critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-900", icon: "text-red-600" },
    warning: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-900", icon: "text-yellow-600" },
    attention: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", icon: "text-blue-600" },
    good: { bg: "bg-green-50", border: "border-green-200", text: "text-green-900", icon: "text-green-600" }
  };

  const colors = statusColors[status];

  // Filtrar ordens atrasadas e pendentes
  const overdueOrdersList = orders.filter(o => {
    const today = new Date();
    const dueDate = new Date(o.dueDate);
    return o.status === "pending" && dueDate < today;
  });

  const pendingOrdersList = orders.filter(o => o.status === "pending").slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            📋 Backlog de Manutenção
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
            {status === "critical" && "🔴 Crítico"}
            {status === "warning" && "⚠️ Atenção"}
            {status === "attention" && "ℹ️ Monitorar"}
            {status === "good" && "✅ OK"}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total de Ordens */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Wrench className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
                <div className="text-xs text-gray-600">Total de Ordens</div>
              </div>
            </div>
          </div>

          {/* Ordens Pendentes */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">{pendingOrders}</div>
                <div className="text-xs text-blue-700">Pendentes</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600 font-semibold">
              {backlogPercentage.toFixed(0)}% do total
            </div>
          </div>

          {/* Ordens Atrasadas */}
          <div className={`p-4 rounded-lg border ${overdueOrders > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${overdueOrders > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                {overdueOrders > 0 ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div>
                <div className={`text-2xl font-bold ${overdueOrders > 0 ? 'text-red-900' : 'text-green-900'}`}>
                  {overdueOrders}
                </div>
                <div className={`text-xs ${overdueOrders > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  Atrasadas
                </div>
              </div>
            </div>
          </div>

          {/* Tempo Médio de Espera */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900">{avgWaitTime.toFixed(1)}</div>
                <div className="text-xs text-purple-700">Dias (média)</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-purple-600">
              Tempo de espera
            </div>
          </div>
        </div>

        {/* Lista de Ordens Atrasadas (se houver) */}
        {overdueOrdersList.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-900">⚠️ Ordens Atrasadas</h4>
            </div>
            <div className="space-y-2">
              {overdueOrdersList.map(order => {
                const dueDate = new Date(order.dueDate);
                const today = new Date();
                const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">{order.equipmentName}</div>
                      <div className="text-xs text-gray-600">{order.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-red-600">
                        {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'} atrasada
                      </div>
                      <div className="text-xs text-gray-500">Prazo: {dueDate.toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de Próximas Ordens Pendentes */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Próximas Ordens Pendentes
          </h4>
          <div className="space-y-2">
            {pendingOrdersList.length > 0 ? (
              pendingOrdersList.map(order => {
                const priorityColors = {
                  high: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
                  medium: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
                  low: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" }
                };

                const typeColors = {
                  preventive: { bg: "bg-green-100", text: "text-green-800" },
                  corrective: { bg: "bg-red-100", text: "text-red-800" }
                };

                const pColors = priorityColors[order.priority];
                const tColors = typeColors[order.type];

                return (
                  <div
                    key={order.id}
                    className={`p-3 border rounded-lg hover:shadow-md transition-shadow ${pColors.border}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">{order.equipmentName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tColors.bg} ${tColors.text}`}>
                            {order.type === "preventive" ? "PM" : "CM"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pColors.bg} ${pColors.text}`}>
                            {order.priority === "high" ? "Alta" : order.priority === "medium" ? "Média" : "Baixa"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">{order.description}</div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-gray-500">Prazo:</div>
                        <div className="font-semibold text-gray-900">
                          {new Date(order.dueDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                ✅ Nenhuma ordem pendente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
