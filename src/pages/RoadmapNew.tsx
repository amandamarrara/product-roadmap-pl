import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoadmapBuilder } from "@/components/roadmap/RoadmapBuilder";
import { useSaveRoadmap } from "@/hooks/useRoadmaps";
import { Delivery } from "@/types/roadmap";
const RoadmapNew = () => {
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState<{
    title: string;
    subtitle: string;
    deliveries: Delivery[];
  }>({
    title: "",
    subtitle: "",
    deliveries: []
  });
  const saveRoadmap = useSaveRoadmap();
  const handleSave = async () => {
    console.log("Save button clicked, roadmapData:", roadmapData);
    
    if (!roadmapData.title?.trim()) {
      console.log("Title is empty, not saving");
      return;
    }
    
    try {
      console.log("Attempting to save roadmap...");
      const result = await saveRoadmap.mutateAsync({
        title: roadmapData.title.trim(),
        subtitle: roadmapData.subtitle?.trim() || "",
        description: "",
        deliveries: roadmapData.deliveries || []
      });
      console.log("Roadmap saved successfully:", result);
      navigate(`/roadmap/${result.id}`);
    } catch (error) {
      console.error("Error saving roadmap:", error);
    }
  };
  const canSave = roadmapData.title.trim().length > 0;
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
              <div>
                
                
              </div>
            </div>
            
            <Button onClick={handleSave} disabled={!canSave || saveRoadmap.isPending}>
              {saveRoadmap.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Roadmap
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-6">
        <RoadmapBuilder initialData={roadmapData} onDataChange={setRoadmapData} isEmbedded={true} />
      </div>
    </div>;
};
export default RoadmapNew;