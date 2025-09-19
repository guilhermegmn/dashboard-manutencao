'use client'

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, CheckCircle, AlertTriangle, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Tipos para melhor type safety
interface MonthData {
  month: string;
  MTBF: number;
  MTTR: number;
  Disponibilidade: number;
  Custo: number;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: string;
  history: MonthData[];
}

interface EquipmentData {
  id: string;
  name: string;
  category: string;
  status: string;
  history: Array<{
    month: string;
    MTBF: number;
    MTTR: number;
    Disponibilidade: number;
    Custo: number;
  }>;
}

interface KPICard {
  label: string;
  value: string;
  trend: "up" | "down";
  change: string;
  status: "good" | "warning";
}

// Dataset mock corrigido
const EQUIPMENT_DATA: Equipment[] = [
  {
    id: "comp-a1",
    name: "Compressor A1",
    category: "Compressão",
    history: [
      { month: "Mai", MTBF: 280, MTTR: 3.4, Disponibilidade: 90, Custo: 0.5 },
      { month: "Jun", MTBF: 310, MTTR: 3.1, Disponibilidade: 92, Custo: 0.45 },
      { month: "Jul", MTBF: 360, MTTR: 2.8, Disponibilidade: 95, Custo: 0.4 },
      { month: "Ago", MTBF: 390, MTTR: 2.6, Disponibilidade: 96, Custo: 0.35 },
    ],
    status: "Operacional",
  },
  {
    id: "este-b2",
    name: "Esteira B2",
    category: "Movimentação",
    history: [
      { month: "Mai", MTBF: 330, MTTR: 2.7, Disponibilidade: 93, Custo: 0.38 },
      { month: "Jun", MTBF: 360, MTTR: 2.6, Disponibilidade: 95, Custo: 0.36 },
      { month: "Jul", MTBF: 410, MTTR: 2.4, Disponibilidade: 97, Custo: 0.34 },
      { month: "Ago", MTBF: 440, MTTR: 2.2, Disponibilidade: 98, Custo: 0.33 },
    ],
    status: "Manutenção Programada",
  },
  {
    id: "motor-c3",
    name: "Motor C3",
    category: "Motorização",
    history: [
      { month: "Mai", MTBF: 270, MTTR: 3.2, Disponibilidade: 91, Custo: 0.62 },
      { month: "Jun", MTBF: 295, MTTR: 3.0, Disponibilidade: 92, Custo: 0.58 },
      { month: "Jul", MTBF: 330, MTTR: 2.9, Disponibilidade: 94, Custo: 0.56 },
      { month: "Ago", MTBF: 365, MTTR: 2.7, Disponibilidade: 95, Custo: 0.52 },
    ],
    status: "Parado",
  },
];

const PERIODS = [
  { id: "2m", label: "Últimos 2 meses", months: ["Jul", "Ago"] },
  { id: "3m", label: "Últimos 3 meses", months: ["Jun", "Jul", "Ago"] },
  { id: "4m", label: "Últimos 4 meses", months: ["Mai", "Jun", "Jul", "Ago"] },
];

export default function MaintenanceDashboard() {
  const [csvEquipments, setCsvEquipments] = useState<Equipment[] | null>(null);
  const [periodId, setPeriodId] = useState("3m");
  const [category, setCategory] = useState("");
  const [equipmentId, setEquipmentId] = useState("");

  const period = useMemo(() => PERIODS.find((p) => p.id === periodId)!, [periodId]);
  const sourceData = csvEquipments ?? EQUIPMENT_DATA;
  
  const categories = useMemo(() => 
    Array.from(new Set(sourceData.map(e => e.category))).sort(), 
    [sourceData]
  );
  
  const equipmentOptions = useMemo(() => 
    sourceData.filter(e => !category || e.category === category), 
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
        return { month, MTBF: 0, MTTR: 0, Disponibilidade: 0, Custo: 0 };
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
        Custo: Number(sum("Custo").toFixed(2)),
      };
    });
  }, [filteredEquipments, period]);

  const kpiCards = useMemo((): KPICard[] => {
    if (consolidatedHistory.length === 0) {
      return [
        { label: "MTBF", value: "0h", trend: "up", change: "0%", status: "warning" },
        { label: "MTTR", value: "0h", trend: "up", change: "0%", status: "warning" },
        { label: "Disponibilidade", value: "0%", trend: "up", change: "0%", status: "warning" },
        { label: "Custo", value: "R$ 0M", trend: "up", change: "0%", status: "warning" },
      ];
    }

    const last = consolidatedHistory[consolidatedHistory.length - 1];
    const prev = consolidatedHistory[consolidatedHistory.length - 2] ?? last;
    
    const calculateChange = (current: number, previous: number, invertTrend = false) => {
      if (previous === 0) return { change: "0%", trend: "up" as const };
      
      const delta = ((current - previous) / previous) * 100;
      const change = `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`;
      const trend = invertTrend ? 
        (delta <= 0 ? "up" : "down") : 
        (delta >= 0 ? "up" : "down");
      
      return { change, trend } as const;
    };

    const mtbf = calculateChange(last.MTBF, prev.MTBF);
    const mttr = calculateChange(last.MTTR, prev.MTTR, true);
    const availability = calculateChange(last.Disponibilidade, prev.Disponibilidade);
    const cost = calculateChange(last.Custo, prev.Custo, true);

    return [
      {
        label: "MTBF (Mean Time Between Failures)",
        value: `${last.MTBF}h`,
        trend: mtbf.trend,
        change: mtbf.change,
        status: mtbf.trend === "up" ? "good" : "warning"
      },
      {
        label: "MTTR (Mean Time To Repair)",
        value: `${last.MTTR}h`,
        trend: mttr.trend,
        change: mttr.change,
        status: mttr.trend === "up" ? "good" : "warning"
      },
      {
        label: "Disponibilidade",
        value: `${last.Disponibilidade}%`,
        trend: availability.trend,
        change: availability.change,
        status: availability.trend === "up" ? "good" : "warning"
      },
      {
        label: "Custo de Manutenção",
        value: `R$ ${last.Custo.toFixed(2)}M`,
        trend: cost.trend,
        change: cost.change,
        status: cost.trend === "up" ? "good" : "warning"
      },
    ];
  }, [consolidatedHistory]);

  const parseCSV = async (file: File): Promise<EquipmentData[]> => {
    const Papa = (await import("papaparse")).default;
    
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results: { data: unknown[] }) => {
          try {
            const equipmentMap = new Map<string, EquipmentData>();
            
            results.data.forEach((row: unknown) => {
              const rowData = row as Record<string, unknown>;
              const id = String(rowData.id || "").trim();
              if (!id) return;
              
              if (!equipmentMap.has(id)) {
                equipmentMap.set(id, {
                  id,
                  name: String(rowData.name || "").trim(),
                  category: String(rowData.category || "").trim(),
                  status: String(rowData.Status || rowData.status || "").trim() || "Operacional",
                  history: [],
                });
              }
              
              const equipment = equipmentMap.get(id)!;
              const month = String(rowData.month || "").trim();
              
              if (month) {
                equipment.history.push({
                  month,
                  MTBF: Number(rowData.MTBF) || 0,
                  MTTR: Number(rowData.MTTR) || 0,
                  Disponibilidade: Number(rowData.Disponibilidade) || 0,
                  Custo: Number(rowData.Custo) || 0,
                });
              }
            });
            
            const monthOrder = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
            
            const equipmentList = Array.from(equipmentMap.values()).map(equipment => ({
              ...equipment,
              history: equipment.history.sort((a, b) => 
                monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
              ),
            }));
            
            resolve(equipmentList);
          } catch (err) {
            reject(new Error(`Erro ao processar CSV: ${err instanceof Error ? err.message : 'Erro desconhecido'}`));
          }
        },
        error: (error: { message: string }) => reject(new Error(`Erro ao ler arquivo: ${error.message}`))
      });
    });
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const equipmentList = await parseCSV(file);
      setCsvEquipments(equipmentList);
    } catch (err) {
      console.error(err);
      alert(`Falha ao processar CSV: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const equipmentsByAvailability = useMemo(() => {
    const lastMonth = period.months[period.months.length - 1];
    const prevMonth = period.months[period.months.length - 2];

    return filteredEquipments.map(equipment => {
      const lastRecord = equipment.history.find(h => h.month === lastMonth);
      const prevRecord = equipment.history.find(h => h.month === prevMonth);
      
      const availability = lastRecord?.Disponibilidade ?? 0;
      const prevAvailability = prevRecord?.Disponibilidade ?? availability;
      const difference = availability - prevAvailability;
      
      let trend: "up" | "down" | "stable";
      if (difference > 0.5) trend = "up";
      else if (difference < -0.5) trend = "down";
      else trend = "stable";
      
      return {
        ...equipment,
        availability,
        availabilityLabel: `${availability.toFixed(1)}%`,
        trend
      };
    }).sort((a, b) => b.availability - a.availability);
  }, [filteredEquipments, period]);

  const generateCSVTemplate = () => {
    const template = `id,name,category,month,MTBF,MTTR,Disponibilidade,Custo,Status
comp-a1,Compressor A1,Compressão,Mai,280,3.4,90,0.5,Operacional
comp-a1,Compressor A1,Compressão,Jun,310,3.1,92,0.45,Operacional
comp-a1,Compressor A1,Compressão,Jul,360,2.8,95,0.4,Operacional
comp-a1,Compressor A1,Compressão,Ago,390,2.6,96,0.35,Operacional
este-b2,Esteira B2,Movimentação,Mai,330,2.7,93,0.38,Manutenção Programada
este-b2,Esteira B2,Movimentação,Jun,360,2.6,95,0.36,Manutenção Programada
este-b2,Esteira B2,Movimentação,Jul,410,2.4,97,0.34,Manutenção Programada
este-b2,Esteira B2,Movimentação,Ago,440,2.2,98,0.33,Manutenção Programada
motor-c3,Motor C3,Motorização,Mai,270,3.2,91,0.62,Parado
motor-c3,Motor C3,Motorização,Jun,295,3.0,92,0.58,Parado
motor-c3,Motor C3,Motorização,Jul,330,2.9,94,0.56,Parado
motor-c3,Motor C3,Motorização,Ago,365,2.7,95,0.52,Parado`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo-dashboard-manutencao.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Operacional":
        return "bg-green-100 text-green-800";
      case "Parado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const renderTrendIcon = (trend: "up" | "down" | "stable") => {
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de KPIs - Manutenção</h1>
            <p className="text-gray-600 mt-1">Monitoramento de performance dos equipamentos</p>
          </div>
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <span className="text-gray-600">Importar CSV</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleCSVUpload} 
                className="text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer" 
              />
            </label>
            <Button variant="outline" onClick={generateCSVTemplate}>
              Baixar modelo CSV
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Período</label>
            <select 
              className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              value={periodId} 
              onChange={(e) => setPeriodId(e.target.value)}
            >
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Categoria de Equipamento</label>
            <select 
              className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              value={category} 
              onChange={(e) => { setCategory(e.target.value); setEquipmentId(""); }}
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Equipamento</label>
            <select 
              className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              value={equipmentId} 
              onChange={(e) => setEquipmentId(e.target.value)}
            >
              <option value="">Todos</option>
              {equipmentOptions.map((e: EquipmentData) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, i) => (
            <Card key={i} className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">{kpi.label}</span>
                  {kpi.status === "good" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-2">{kpi.value}</div>
                
                <div className="flex items-center space-x-2">
                  {renderTrendIcon(kpi.trend)}
                  <span className={`text-sm font-medium ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {kpi.change}
                  </span>
                  <span className="text-sm text-gray-500">vs período anterior</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico consolidado */}
        <Card className="bg-white shadow-lg border-0 rounded-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tendência Consolidada dos KPIs</h2>
            {consolidatedHistory.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={consolidatedHistory}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="MTBF" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      name="MTBF (h)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="MTTR" 
                      stroke="#EF4444" 
                      strokeWidth={3} 
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      name="MTTR (h)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Disponibilidade" 
                      stroke="#3B82F6" 
                      strokeWidth={3} 
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      name="Disponibilidade (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Custo" 
                      stroke="#F59E0B" 
                      strokeWidth={3} 
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
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

        {/* Tabela de equipamentos */}
        <Card className="bg-white shadow-lg border-0 rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Ranking de Disponibilidade por Equipamento</h2>
            </div>
            <div className="overflow-x-auto">
              {equipmentsByAvailability.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Máquina</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tendência</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {equipmentsByAvailability.map((equipment) => (
                      <tr key={equipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{equipment.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{equipment.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(equipment.status)}`}>
                            {equipment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{equipment.availabilityLabel}</div>
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
      </div>
    </div>
  );
}