import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Users, Search, MoreVertical, Trash2, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRoadmaps, useDeleteRoadmap, useSaveRoadmap } from "@/hooks/useRoadmaps";
import { Roadmap } from "@/types/roadmap";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UpdateColorsButton } from "@/components/roadmap/UpdateColorsButton";

const RoadmapsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: roadmaps = [], isLoading } = useRoadmaps();
  const deleteRoadmap = useDeleteRoadmap();
  const saveRoadmap = useSaveRoadmap();

  const filteredRoadmaps = roadmaps.filter(roadmap =>
    roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    roadmap.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDuplicate = async (roadmap: Roadmap) => {
    const duplicatedRoadmap = {
      ...roadmap,
      id: undefined,
      title: `${roadmap.title} (Cópia)`,
      deliveries: roadmap.deliveries.map(delivery => ({
        ...delivery,
        id: Math.random().toString(36).substr(2, 9),
        subDeliveries: delivery.subDeliveries.map(sub => ({
          ...sub,
          id: Math.random().toString(36).substr(2, 9),
        }))
      }))
    };
    
    await saveRoadmap.mutateAsync(duplicatedRoadmap);
  };

  const getStatusBadgeColor = (deliveries: any[]) => {
    if (!deliveries.length) return "secondary";
    const completed = deliveries.filter(d => d.status === "completed").length;
    const total = deliveries.length;
    const percentage = (completed / total) * 100;
    
    if (percentage === 100) return "default";
    if (percentage >= 50) return "secondary";
    return "outline";
  };

  const getStatusText = (deliveries: any[]) => {
    if (!deliveries.length) return "Sem entregas";
    const completed = deliveries.filter(d => d.status === "completed").length;
    const total = deliveries.length;
    return `${completed}/${total} concluídas`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meus Roadmaps</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus roadmaps de produto
          </p>
        </div>
        <div className="flex gap-2">
          <UpdateColorsButton />
          <Button asChild>
            <Link to="/roadmap/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Roadmap
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar roadmaps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Empty State */}
      {filteredRoadmaps.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? "Nenhum roadmap encontrado" : "Nenhum roadmap criado ainda"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? "Tente ajustar os termos de busca"
              : "Comece criando seu primeiro roadmap de produto"
            }
          </p>
          {!searchTerm && (
            <Button asChild>
              <Link to="/roadmap/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Roadmap
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Roadmaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoadmaps.map((roadmap) => (
          <Card key={roadmap.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{roadmap.title}</CardTitle>
                  {roadmap.subtitle && (
                    <CardDescription className="line-clamp-1">{roadmap.subtitle}</CardDescription>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/roadmap/${roadmap.id}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(roadmap)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o roadmap "{roadmap.title}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteRoadmap.mutate(roadmap.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {roadmap.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {roadmap.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{roadmap.deliveries.length} entregas</span>
                  </div>
                  <Badge variant={getStatusBadgeColor(roadmap.deliveries)}>
                    {getStatusText(roadmap.deliveries)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Criado em {format(roadmap.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>

                <Button asChild className="w-full mt-4">
                  <Link to={`/roadmap/${roadmap.id}`}>
                    Abrir Roadmap
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoadmapsList;