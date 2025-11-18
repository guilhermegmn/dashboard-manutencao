import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { EquipmentWithAvailability, TrendType } from "@/types/dashboard";

interface EquipmentTableProps {
  equipments: EquipmentWithAvailability[];
}

/**
 * Tabela com ranking de disponibilidade por equipamento
 * Otimizada com React.memo para evitar re-renders desnecessários
 */
export const EquipmentTable = memo(function EquipmentTable({ equipments }: EquipmentTableProps) {
  const renderTrendIcon = (trend: TrendType) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
      <CardContent className="p-0">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Ranking de Disponibilidade por Equipamento
          </h2>
        </div>
        <div className="overflow-x-auto">
          {equipments.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Máquina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponibilidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tendência
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipments.map((equipment) => (
                  <tr key={equipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {equipment.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {equipment.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {equipment.availabilityLabel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderTrendIcon(equipment.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              Nenhum equipamento encontrado para os filtros selecionados
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
