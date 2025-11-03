import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MapPin, Plus, Eye, LogOut, User, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRoadmaps, useSharedRoadmaps } from "@/hooks/useRoadmaps";

const Index = () => {
  const { user, signOut } = useAuth();
  const { data: roadmaps = [], isLoading } = useRoadmaps();
  const { data: sharedRoadmaps = [], isLoading: sharedLoading } = useSharedRoadmaps();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Roadmap Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {user?.email}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Bem-vindo ao Roadmap Manager</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gerencie seus roadmaps de forma segura e organizada. Crie, visualize e acompanhe o progresso dos seus projetos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="shadow-elegant border-0 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Novo Roadmap
              </CardTitle>
              <CardDescription>
                Comece um novo projeto e defina suas entregas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-gradient-primary">
                <Link to="/roadmap/new">
                  Criar Roadmap
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-0 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Ver Meus Roadmaps
              </CardTitle>
              <CardDescription>
                {isLoading ? "Carregando..." : `${roadmaps.length} roadmap(s) criado(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/roadmaps">
                  Ver Roadmaps
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-0 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Compartilhados Comigo
              </CardTitle>
              <CardDescription>
                {sharedLoading ? "Carregando..." : `${sharedRoadmaps.length} roadmap(s) compartilhado(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/roadmaps?tab=shared">
                  Ver Compartilhados
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
