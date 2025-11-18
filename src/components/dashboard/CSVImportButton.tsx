import { memo } from "react";
import { Button } from "@/components/ui/button";

interface CSVImportButtonProps {
  onCSVUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
}

/**
 * Botões para importar CSV e baixar template
 * Otimizado com React.memo para evitar re-renders desnecessários
 */
export const CSVImportButton = memo(function CSVImportButton({
  onCSVUpload,
  onDownloadTemplate,
}: CSVImportButtonProps) {
  return (
    <div className="flex gap-3 items-center">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <span className="text-gray-600">Importar CSV</span>
        <input
          type="file"
          accept=".csv"
          onChange={onCSVUpload}
          className="text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
        />
      </label>
      <Button variant="outline" onClick={onDownloadTemplate}>
        Baixar modelo CSV
      </Button>
    </div>
  );
});
