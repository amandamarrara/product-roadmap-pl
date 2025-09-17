import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MapPin, List, Calendar, Filter, Layers } from "lucide-react";
import { DeliveryForm } from "./DeliveryForm";
import { DeliveryCard } from "./DeliveryCard";
import { RoadmapTimeline } from "./RoadmapTimeline";
import { MilestoneManager } from "./MilestoneManager";
import type { Delivery, Team, TeamMember, Milestone } from "@/types/roadmap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock data for teams and members
const mockTeams: Team[] = [{
  id: '1',
  name: 'Frontend',
  color: '#3b82f6',
  members: [{
    id: '1',
    name: 'Ana Silva',
    role: 'Tech Lead',
    avatar: ''
  }, {
    id: '2',
    name: 'Carlos Santos',
    role: 'Developer',
    avatar: ''
  }, {
    id: '3',
    name: 'Lucia Costa',
    role: 'UI/UX Designer',
    avatar: ''
  }]
}, {
  id: '2',
  name: 'Backend',
  color: '#10b981',
  members: [{
    id: '4',
    name: 'Pedro Lima',
    role: 'Tech Lead',
    avatar: ''
  }, {
    id: '5',
    name: 'Marina Oliveira',
    role: 'Developer',
    avatar: ''
  }, {
    id: '6',
    name: 'Roberto Alves',
    role: 'DevOps',
    avatar: ''
  }]
}, {
  id: '3',
  name: 'Mobile',
  color: '#f59e0b',
  members: [{
    id: '7',
    name: 'Julia Ferreira',
    role: 'Tech Lead',
    avatar: ''
  }, {
    id: '8',
    name: 'Miguel Torres',
    role: 'iOS Developer',
    avatar: ''
  }, {
    id: '9',
    name: 'Sofia Rodrigues',
    role: 'Android Developer',
    avatar: ''
  }]
}];

interface RoadmapBuilderProps {
  initialData?: {
    title: string;
    subtitle: string;
    deliveries: Delivery[];
    milestones?: Milestone[];
  };
  onDataChange?: (data: { title: string; subtitle: string; deliveries: Delivery[]; milestones: Milestone[] }) => void;
  readOnly?: boolean;
  isEmbedded?: boolean;
}

export function RoadmapBuilder({ 
  initialData, 
  onDataChange, 
  readOnly = false,
  isEmbedded = false 
}: RoadmapBuilderProps) {
  const [roadmapTitle, setRoadmapTitle] = useState(
    initialData?.title || ''
  );
  const [roadmapSubtitle, setRoadmapSubtitle] = useState(
    initialData?.subtitle || ''
  );
  const [deliveries, setDeliveries] = useState<Delivery[]>(
    initialData?.deliveries || []
  );
  const [milestones, setMilestones] = useState<Milestone[]>(
    initialData?.milestones || []
  );
  const [showForm, setShowForm] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | undefined>();
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [groupByPhase, setGroupByPhase] = useState<boolean>(false);
  
  // Ref for form auto-scroll
  const formRef = useRef<HTMLDivElement>(null);

  // Update parent component when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        title: roadmapTitle,
        subtitle: roadmapSubtitle,
        deliveries: deliveries,
        milestones: milestones,
      });
    }
  }, [roadmapTitle, roadmapSubtitle, deliveries, milestones, onDataChange]);

  // Update local state when initialData changes (only once on mount)
  useEffect(() => {
    if (initialData && roadmapTitle === '' && roadmapSubtitle === '' && deliveries.length === 0) {
      setRoadmapTitle(initialData.title || '');
      setRoadmapSubtitle(initialData.subtitle || '');
      setDeliveries(initialData.deliveries || []);
      setMilestones(initialData.milestones || []);
    }
  }, [initialData]);

  const handleSaveDelivery = (deliveryData: Omit<Delivery, 'id'>) => {
    console.log('💾 RoadmapBuilder: Received delivery data from form:', deliveryData);
    
    if (editingDelivery) {
      console.log('✏️ RoadmapBuilder: Updating existing delivery:', editingDelivery.id);
      setDeliveries(prev => prev.map(d => d.id === editingDelivery.id ? {
        ...deliveryData,
        id: editingDelivery.id
      } : d));
    } else {
      console.log('➕ RoadmapBuilder: Adding new delivery');
      const newDelivery: Delivery = {
        ...deliveryData,
        id: Date.now().toString()
      };
      setDeliveries(prev => [...prev, newDelivery]);
      console.log('✅ RoadmapBuilder: New delivery added:', newDelivery.id);
    }
    setShowForm(false);
    setEditingDelivery(undefined);
  };

  const handleEditDelivery = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setShowForm(true);
    
    // Auto-scroll to form with slight delay to ensure it's rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  const handleDeleteDelivery = (id: string) => {
    setDeliveries(prev => prev.filter(d => d.id !== id));
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDelivery(undefined);
  };

  const handleSaveMilestone = (milestoneData: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestoneData,
      id: Date.now().toString()
    };
    setMilestones(prev => [...prev, newMilestone]);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setMilestones(prev => prev.map(m => m.id === milestone.id ? milestone : m));
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const teamMatch = filterTeam === 'all' || delivery.deliveryPhase === filterTeam;
    const priorityMatch = filterPriority === 'all' || delivery.priority === filterPriority;
    return teamMatch && priorityMatch;
  });

  const getStats = () => {
    const completed = deliveries.filter(d => d.status === 'completed').length;
    const inProgress = deliveries.filter(d => d.status === 'in-progress').length;
    const notStarted = deliveries.filter(d => d.status === 'not-started').length;
    const blocked = deliveries.filter(d => d.status === 'blocked').length;
    return {
      completed,
      inProgress,
      notStarted,
      blocked
    };
  };

  const stats = getStats();

  return (
    <div className={`${isEmbedded ? '' : 'min-h-screen bg-background p-4 md:p-6 lg:p-8'}`}>
      <div className={`${isEmbedded ? '' : 'max-w-7xl mx-auto'} space-y-6`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              
            </div>
            <Input 
              id="roadmap-title" 
              value={roadmapTitle} 
              onChange={e => setRoadmapTitle(e.target.value)} 
              className="text-2xl font-bold border-0 shadow-none p-0 h-auto bg-transparent focus-visible:ring-0" 
              placeholder="Nome do seu roadmap"
              readOnly={readOnly}
            />
            <Input 
              value={roadmapSubtitle} 
              onChange={e => setRoadmapSubtitle(e.target.value)} 
              className="text-lg text-muted-foreground border-0 shadow-none p-0 h-auto bg-transparent focus-visible:ring-0" 
              placeholder="Descrição do roadmap (opcional)"
              readOnly={readOnly}
            />
          </div>
          
          {!readOnly && (
            <Button onClick={() => setShowForm(true)} className="bg-gradient-primary shadow-elegant hover:shadow-lg transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Nova Entrega
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Concluídas</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-info">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">Em Progresso</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-muted-foreground">{stats.notStarted}</div>
              <div className="text-sm text-muted-foreground">Não Iniciadas</div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-destructive">{stats.blocked}</div>
              <div className="text-sm text-muted-foreground">Bloqueadas</div>
            </CardContent>
          </Card>
        </div>


        {/* Form */}
        {showForm && !readOnly && (
          <div ref={formRef}>
            <DeliveryForm 
              delivery={editingDelivery} 
              onSave={handleSaveDelivery} 
              onCancel={handleCancelForm} 
            />
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>

            {/* Filters - Now available in both readOnly and edit modes */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Fase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fases</SelectItem>
                  {Array.from(new Set(deliveries.map(d => d.deliveryPhase).filter(Boolean))).map(phase => (
                    <SelectItem key={phase} value={phase!}>
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={groupByPhase ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupByPhase(!groupByPhase)}
                className="flex items-center gap-2"
              >
                <Layers className="h-4 w-4" />
                Agrupar por Fase
              </Button>
            </div>
          </div>

          <TabsContent value="timeline" className="space-y-6">
            <RoadmapTimeline 
              deliveries={filteredDeliveries} 
              milestones={milestones} 
              groupByPhase={groupByPhase}
              roadmapId={initialData ? '1' : undefined}
            />
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {filteredDeliveries.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Nenhuma entrega encontrada</h3>
                      <p className="text-muted-foreground">
                        {deliveries.length === 0 ? "Comece criando sua primeira entrega!" : "Tente ajustar os filtros para ver mais entregas."}
                      </p>
                    </div>
                    {!readOnly && (
                      <Button onClick={() => setShowForm(true)} className="bg-gradient-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeira Entrega
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDeliveries.map(delivery => (
                  <DeliveryCard 
                    key={delivery.id} 
                    delivery={delivery} 
                    onEdit={readOnly ? undefined : handleEditDelivery} 
                    onDelete={readOnly ? undefined : handleDeleteDelivery} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Milestone Manager - Below Timeline */}
        <div className="mt-6">
          <MilestoneManager 
            milestones={milestones}
            onSave={handleSaveMilestone}
            onEdit={handleEditMilestone}
            onDelete={handleDeleteMilestone}
            readOnly={readOnly}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}