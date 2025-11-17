import { Equipment, Period } from "@/types/dashboard";

interface FilterPanelProps {
  periods: Period[];
  periodId: string;
  setPeriodId: (id: string) => void;
  categories: string[];
  category: string;
  setCategory: (category: string) => void;
  equipmentOptions: Equipment[];
  equipmentId: string;
  setEquipmentId: (id: string) => void;
}

/**
 * Painel de filtros para período, categoria e equipamento
 */
export function FilterPanel({
  periods,
  periodId,
  setPeriodId,
  categories,
  category,
  setCategory,
  equipmentOptions,
  equipmentId,
  setEquipmentId,
}: FilterPanelProps) {
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setEquipmentId(""); // Limpa seleção de equipamento ao mudar categoria
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Filtro de Período */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Período</label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de Categoria */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Categoria de Equipamento
        </label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de Equipamento */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Equipamento</label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={equipmentId}
          onChange={(e) => setEquipmentId(e.target.value)}
        >
          <option value="">Todos</option>
          {equipmentOptions.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
