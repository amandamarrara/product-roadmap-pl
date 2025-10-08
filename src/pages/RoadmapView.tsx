import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoadmap } from "@/hooks/useRoadmaps";
import { RoadmapBuilder } from "@/components/roadmap/RoadmapBuilder";
import { ExportButton } from "@/components/roadmap/ExportButton";
const RoadmapView = () => {
  const { id } = useParams<{ id: string }>();
  const { data: roadmap, isLoading, error } = useRoadmap(id!);
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <span>Carregando roadmap...</span>
        </div>
      </div>
    );
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
              <ExportButton roadmapTitle={roadmap.title} timelineElementId="roadmap-timeline" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-6" id="roadmap-timeline">
        <RoadmapBuilder 
          key={`roadmap-${roadmap.deliveries.map(d => `${d.id}-${d.startDate}-${d.endDate}`).join('|')}`}
          initialData={{
            title: roadmap.title,
            subtitle: roadmap.subtitle || "",
            deliveries: roadmap.deliveries,
            milestones: roadmap.milestones || []
          }} 
          isEmbedded={true}
          roadmapId={roadmap.id}
        />
      </div>
    </div>;
};
export default RoadmapView;