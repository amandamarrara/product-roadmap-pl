import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoadmap } from "@/hooks/useRoadmaps";
import { RoadmapBuilder } from "@/components/roadmap/RoadmapBuilder";
import { ExportButton } from "@/components/roadmap/ExportButton";
import { ShareDialog } from "@/components/roadmap/ShareDialog";
import { useRoadmapRole, useProcessInviteToken } from "@/hooks/useRoadmapSharing";
const RoadmapView = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteToken = searchParams.get('invite');
  const [isProcessingInvite, setIsProcessingInvite] = useState(!!inviteToken);
  
  const { data: roadmap, isLoading, error, refetch: refetchRoadmap } = useRoadmap(id!);
  const { data: userRole, isLoading: roleLoading, refetch: refetchRole } = useRoadmapRole(id!);
  const processInvite = useProcessInviteToken();

  // Process invitation token if present and not already processing
  useEffect(() => {
    if (inviteToken && id && !processInvite.isPending) {
      setIsProcessingInvite(true);
      processInvite.mutate(
        { token: inviteToken, roadmapId: id },
        {
          onSuccess: () => {
            setSearchParams(params => {
              params.delete('invite');
              return params;
            }, { replace: true });
            refetchRole();
            refetchRoadmap();
            setIsProcessingInvite(false);
          },
          onError: (error) => {
            console.error('Failed to process invite token:', error);
            setIsProcessingInvite(false);
          },
        }
      );
    }
  }, [inviteToken, id]);

  if (isProcessingInvite) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Processando convite...</span>
        </div>
      </div>
    );
  }

  if (isLoading || roleLoading) {
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

  const isReadOnly = userRole === 'viewer';
  const isOwner = userRole === 'owner';
  
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
              {userRole === 'viewer' && (
                <Badge variant="secondary" className="mr-2">
                  <Eye className="h-3 w-3 mr-1" />
                  Visualização
                </Badge>
              )}
              {userRole === 'editor' && (
                <Badge variant="secondary" className="mr-2">
                  <Edit className="h-3 w-3 mr-1" />
                  Editor
                </Badge>
              )}
              {isOwner && (
                <ShareDialog roadmapId={roadmap.id} roadmapTitle={roadmap.title} />
              )}
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
          readOnly={isReadOnly}
          userRole={userRole}
        />
      </div>
    </div>;
};
export default RoadmapView;