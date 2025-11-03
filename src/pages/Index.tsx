import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MapPin, Plus, Eye, LogOut, User, AlertTriangle, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRoadmaps } from "@/hooks/useRoadmaps";
import { useDateAlerts } from "@/hooks/useDateAlerts";
import { DateAlertBadge } from "@/components/roadmap/DateAlertBadge";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const { user, signOut } = useAuth();
  const { data: roadmaps = [], isLoading } = useRoadmaps();

  // Calculate alerts from all roadmaps
  const allDeliveries = roadmaps.flatMap(r => r.deliveries);
  const allMilestones = roadmaps.flatMap(r => r.milestones);
  const dateAlerts = useDateAlerts(allDeliveries, allMilestones);
  
  // Get top 5 most urgent alerts
  const topUrgentAlerts = dateAlerts.alerts.slice(0, 5);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Alerts Card */}
          {dateAlerts.totalCount > 0 && (
            <Card className="shadow-elegant border-0 hover:shadow-lg transition-all duration-300 md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alertas Próximos
                  <Badge variant={dateAlerts.criticalCount > 0 ? "destructive" : "secondary"}>
                    {dateAlerts.totalCount}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Marcos e entregas se aproximando dos prazos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topUrgentAlerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum alerta urgente no momento
                    </p>
                  ) : (
                    topUrgentAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {alert.type === 'milestone' ? 'Marco' : alert.type === 'delivery' ? 'Entrega' : 'Sub-entrega'}
                            </Badge>
                          </div>
                          <p className="font-medium text-sm mt-1 truncate">{alert.title}</p>
                          {alert.parentDelivery && (
                            <p className="text-xs text-muted-foreground truncate">
                              {alert.parentDelivery}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(alert.date, "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                        <DateAlertBadge 
                          daysUntil={alert.daysUntil} 
                          urgency={alert.urgency}
                        />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
        </div>
      </div>
    </div>
  );
};

export default Index;
