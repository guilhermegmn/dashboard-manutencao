import { useState } from "react";
import { Equipment } from "@/types/dashboard";
import { MONTH_ORDER } from "@/lib/equipmentData";

/**
 * Hook customizado para gerenciar importação de arquivos CSV
 */
export function useCSVImport() {
  const [csvEquipments, setCsvEquipments] = useState<Equipment[] | null>(null);

  const parseCSV = async (file: File): Promise<Equipment[]> => {
    const Papa = (await import("papaparse")).default;

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results: { data: unknown[] }) => {
          try {
            const equipmentMap = new Map<string, Equipment>();

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

            const equipmentList = Array.from(equipmentMap.values()).map(equipment => ({
              ...equipment,
              history: equipment.history.sort((a, b) =>
                MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)
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

  return {
    csvEquipments,
    handleCSVUpload,
    generateCSVTemplate,
  };
}
