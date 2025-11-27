import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, MapPin, List, Calendar, Filter, Layers, Eye } from "lucide-react";
import { DeliveryForm } from "./DeliveryForm";
import { DeliveryCard } from "./DeliveryCard";
import { RoadmapTimeline } from "./RoadmapTimeline";
import { ResponsibleFilter } from "./ResponsibleFilter";
import { MilestoneManager } from "./MilestoneManager";
import type { Delivery, Team, TeamMember, Milestone } from "@/types/roadmap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUpdateDelivery, useDeleteDelivery, useCreateDelivery } from "@/hooks/useDeliveryActions";
import { useQueryClient } from "@tanstack/react-query";
import { useSaveMilestone, useUpdateMilestone, useDeleteMilestone, useMilestones } from "@/hooks/useMilestones";

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
  roadmapId?: string;
  userRole?: 'owner' | 'editor' | 'viewer' | 'none';
}

export function RoadmapBuilder({ 
  initialData, 
  onDataChange, 
  readOnly = false,
  isEmbedded = false,
  roadmapId,
  userRole = 'none'
}: RoadmapBuilderProps) {
  const queryClient = useQueryClient();
  const createDelivery = useCreateDelivery();
  const updateDelivery = useUpdateDelivery();
  const deleteDelivery = useDeleteDelivery();
  const saveMilestone = useSaveMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();
  
  // Fetch milestones from DB when roadmapId exists
  const { data: milestonesFromDB } = useMilestones(roadmapId);
  
  const [roadmapTitle, setRoadmapTitle] = useState(
    initialData?.title || ''
  );
  const [roadmapSubtitle, setRoadmapSubtitle] = useState(
    initialData?.subtitle || ''
  );
  const [deliveries, setDeliveries] = useState<Delivery[]>(
    initialData?.deliveries || []
  );
  // Local milestones state - only used when creating a new roadmap (no roadmapId)
  const [localMilestones, setLocalMilestones] = useState<Milestone[]>(
    initialData?.milestones || []
  );
  const [showForm, setShowForm] = useState(false);
  
  // Use milestones from DB when roadmapId exists, otherwise use local state
  const milestones = roadmapId ? (milestonesFromDB || []) : localMilestones;
  const [editingDelivery, setEditingDelivery] = useState<Delivery | undefined>();
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [groupByPhase, setGroupByPhase] = useState<boolean>(false);
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  
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

  // Update local state when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('🔄 RoadmapBuilder: Updating local state from initialData:', {
        deliveriesCount: initialData.deliveries?.length,
        milestonesCount: initialData.milestones?.length
      });
      setRoadmapTitle(initialData.title || '');
      setRoadmapSubtitle(initialData.subtitle || '');
      setDeliveries(initialData.deliveries || []);
      setLocalMilestones(initialData.milestones || []);
    }
  }, [initialData]);

  const handleSaveDelivery = async (deliveryData: Omit<Delivery, 'id'>) => {
    console.log('💾 RoadmapBuilder: Received delivery data from form:', deliveryData);
    
    if (editingDelivery && roadmapId) {
      // Update existing delivery in database
      console.log('✏️ RoadmapBuilder: Updating existing delivery in DB:', editingDelivery.id);
      const fullDelivery: Delivery = {
        ...deliveryData,
        id: editingDelivery.id
      } as Delivery;
      await updateDelivery.mutateAsync({ roadmapId, delivery: fullDelivery });
      
      // ✅ Refetch roadmap data after update to sync UI
      console.log('🔄 Refetching roadmap data after update...');
      await queryClient.refetchQueries({ queryKey: ['roadmap', roadmapId] });
      
    } else if (roadmapId) {
      // CREATE NEW DELIVERY IN DATABASE
      console.log('➕ RoadmapBuilder: Creating new delivery in DB');
      await createDelivery.mutateAsync({ roadmapId, delivery: deliveryData });
      
      // ✅ Refetch roadmap data after creation to sync UI
      console.log('🔄 Refetching roadmap data after creation...');
      await queryClient.refetchQueries({ queryKey: ['roadmap', roadmapId] });
      
    } else {
      // No roadmapId - just update local state (creating new roadmap)
      console.log('➕ RoadmapBuilder: Adding new delivery (no roadmapId)');
      const newDelivery: Delivery = {
        ...deliveryData,
        id: Date.now().toString()
      };
      setDeliveries(prev => [...prev, newDelivery]);
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

  const handleDeleteDelivery = async (id: string) => {
    if (roadmapId) {
      // Delete from database
      console.log('🗑️ RoadmapBuilder: Deleting delivery from DB:', id);
      await deleteDelivery.mutateAsync({ roadmapId, deliveryId: id });
    } else {
      // Just update local state
      setDeliveries(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDelivery(undefined);
  };

  const handleSaveMilestone = async (milestoneData: Omit<Milestone, 'id'>) => {
    if (roadmapId) {
      try {
        console.log('💾 RoadmapBuilder: Saving milestone to DB');
        await saveMilestone.mutateAsync({ roadmapId, milestone: milestoneData });
        console.log('✅ RoadmapBuilder: Milestone saved successfully');
      } catch (error) {
        console.error('❌ RoadmapBuilder: Error saving milestone:', error);
      }
    } else {
      // Just update local state if creating new roadmap
      console.log('➕ RoadmapBuilder: Adding milestone to local state');
      const newMilestone: Milestone = {
        ...milestoneData,
        id: Date.now().toString()
      };
      setLocalMilestones(prev => [...prev, newMilestone]);
    }
  };

  const handleEditMilestone = async (milestone: Milestone) => {
    if (roadmapId) {
      try {
        console.log('✏️ RoadmapBuilder: Updating milestone in DB:', milestone.id);
        await updateMilestone.mutateAsync({ roadmapId, milestone });
        console.log('✅ RoadmapBuilder: Milestone updated successfully');
      } catch (error) {
        console.error('❌ RoadmapBuilder: Error updating milestone:', error);
      }
    } else {
      // Just update local state
      setLocalMilestones(prev => prev.map(m => m.id === milestone.id ? milestone : m));
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (roadmapId) {
      try {
        console.log('🗑️ RoadmapBuilder: Deleting milestone from DB:', id);
        await deleteMilestone.mutateAsync({ roadmapId, milestoneId: id });
        console.log('✅ RoadmapBuilder: Milestone deleted successfully');
      } catch (error) {
        console.error('❌ RoadmapBuilder: Error deleting milestone:', error);
      }
    } else {
      // Just update local state
      setLocalMilestones(prev => prev.filter(m => m.id !== id));
    }
  };

  // Get unique responsibles from deliveries
  const uniqueResponsibles = Array.from(
    new Set(
      deliveries
        .map(d => d.responsible)
        .filter(Boolean)
        .filter(r => r.trim() !== '')
    )
  ).sort();

  const filteredDeliveries = deliveries.filter(delivery => {
    const teamMatch = filterTeam === 'all' || delivery.deliveryPhase === filterTeam;
    const priorityMatch = filterPriority === 'all' || delivery.priority === filterPriority;
    
    // Responsible filter
    let responsibleMatch = true;
    if (selectedResponsibles.length > 0 && selectedResponsibles.length < uniqueResponsibles.length + 1) {
      if (selectedResponsibles.includes('Sem responsável')) {
        responsibleMatch = !delivery.responsible || delivery.responsible.trim() === '' || selectedResponsibles.includes(delivery.responsible);
      } else {
        responsibleMatch = delivery.responsible && selectedResponsibles.includes(delivery.responsible);
      }
    }
    
    return teamMatch && priorityMatch && responsibleMatch;
  });

  const getStats = () => {
    const completed = filteredDeliveries.filter(d => d.status === 'completed').length;
    const inProgress = filteredDeliveries.filter(d => d.status === 'in-progress').length;
    const notStarted = filteredDeliveries.filter(d => d.status === 'not-started').length;
    const blocked = filteredDeliveries.filter(d => d.status === 'blocked').length;
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
        {/* Read-only alert */}
        {readOnly && userRole === 'viewer' && (
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              Você está visualizando este roadmap. Não é possível fazer alterações.
            </AlertDescription>
          </Alert>
        )}
        
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
            <div className="flex items-end gap-4 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground mb-2" />
              
              {/* Filtro de Fase */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Fase</Label>
                <Select value={filterTeam} onValueChange={setFilterTeam}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Todas as fases" />
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
              </div>

              {/* Filtro de Prioridade */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Prioridade</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Responsável */}
              {uniqueResponsibles.length > 0 && (
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Responsável</Label>
                  <ResponsibleFilter
                    responsibles={uniqueResponsibles}
                    selectedResponsibles={selectedResponsibles}
                    onSelectionChange={setSelectedResponsibles}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Visualização</Label>
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
          </div>

          <TabsContent value="timeline" className="space-y-6">
            <RoadmapTimeline 
              deliveries={filteredDeliveries} 
              milestones={milestones} 
              groupByPhase={groupByPhase}
              roadmapId={roadmapId}
              onEditDelivery={readOnly ? undefined : handleEditDelivery}
              readOnly={readOnly}
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