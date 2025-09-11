import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExportRoadmap, ExportFormat } from "@/hooks/useExportRoadmap";

interface ExportButtonProps {
  roadmapTitle: string;
  timelineElementId: string;
}

export const ExportButton = ({ roadmapTitle, timelineElementId }: ExportButtonProps) => {
  const { exportRoadmap, isExporting } = useExportRoadmap();

  const handleExport = (format: ExportFormat) => {
    const filename = roadmapTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    exportRoadmap(timelineElementId, filename, format);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("png")}>
          <FileImage className="h-4 w-4 mr-2" />
          Exportar como PNG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};