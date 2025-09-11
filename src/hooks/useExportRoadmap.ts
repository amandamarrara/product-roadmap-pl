import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export type ExportFormat = "png" | "pdf";

export const useExportRoadmap = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportRoadmap = async (
    elementId: string,
    filename: string,
    format: ExportFormat = "pdf"
  ) => {
    setIsExporting(true);
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error("Timeline element not found");
      }

      // Create canvas with high quality settings
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      if (format === "png") {
        // Download as PNG
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("Roadmap exportado como PNG!");
      } else {
        // Export as PDF
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "landscape" : "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${filename}.pdf`);
        toast.success("Roadmap exportado como PDF!");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar roadmap. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportRoadmap,
    isExporting,
  };
};