export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Complexity = 'simple' | 'medium' | 'complex' | 'very-complex';

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  members: TeamMember[];
}

export interface SubDelivery {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  team: string;
  responsible: string;
  completed: boolean;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  jiraLink?: string;
}

export interface Delivery {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  complexity: Complexity;
  priority: Priority;
  deliveryColor?: string;
  deliveryPhase?: string;
  jiraLink?: string;
  subDeliveries: SubDelivery[];
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  deliveries: Delivery[];
  createdAt: Date;
  updatedAt: Date;
}