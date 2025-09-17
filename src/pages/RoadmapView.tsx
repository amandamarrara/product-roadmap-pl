import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoadmap, useSaveRoadmap } from "@/hooks/useRoadmaps";
import { RoadmapBuilder } from "@/components/roadmap/RoadmapBuilder";
import { ExportButton } from "@/components/roadmap/ExportButton";
import { useState } from "react";
import { Delivery } from "@/types/roadmap";
const RoadmapView = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<{
    title: string;
    subtitle: string;
    deliveries: Delivery[];
    milestones: any[];
  } | null>(null);
  const {
    data: roadmap,
    isLoading,
    error
  } = useRoadmap(id!);
  const saveRoadmap = useSaveRoadmap();
  const handleSave = async () => {
    if (!editingData || !roadmap) return;
    try {
      await saveRoadmap.mutateAsync({
        id: roadmap.id,
        title: editingData.title,
        subtitle: editingData.subtitle,
        description: roadmap.description,
        deliveries: editingData.deliveries,
        milestones: editingData.milestones || roadmap.milestones || []
      });
      setIsEditing(false);
      setEditingData(null);
    } catch (error) {
      console.error("Error saving roadmap:", error);
    }
  };
  if (isLoading) {
    return <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando roadmap...</span>
        </div>
      </div>;
  }
  if (error || !roadmap) {
    return <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Roadmap não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O roadmap que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Roadmaps
            </Link>
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditing && <ExportButton roadmapTitle={roadmap.title} timelineElementId="roadmap-timeline" />}
              {isEditing ? <>
                  <Button variant="outline" size="sm" onClick={() => {
                setIsEditing(false);
                setEditingData(null);
              }}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saveRoadmap.isPending}>
                    {saveRoadmap.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar
                  </Button>
                </> : <Button size="sm" onClick={() => {
              setIsEditing(true);
              setEditingData({
                title: roadmap.title,
                subtitle: roadmap.subtitle || "",
                deliveries: roadmap.deliveries,
                milestones: roadmap.milestones || []
              });
            }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-6" id="roadmap-timeline">
        {isEditing && editingData ? <RoadmapBuilder initialData={editingData} onDataChange={setEditingData} isEmbedded={true} /> : <RoadmapBuilder initialData={{
        title: roadmap.title,
        subtitle: roadmap.subtitle || "",
        deliveries: roadmap.deliveries,
        milestones: roadmap.milestones || []
      }} readOnly={true} isEmbedded={true} />}
      </div>
    </div>;
};
export default RoadmapView;