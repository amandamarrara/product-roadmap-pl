export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Complexity = 'simple' | 'medium' | 'complex' | 'very-complex';

export interface Comment {
  id: string;
  deliveryId?: string;
  subDeliveryId?: string;
  userId: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  comments?: Comment[];
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
  responsible?: string;
  jiraLink?: string;
  subDeliveries: SubDelivery[];
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  comments?: Comment[];
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  date: Date;
  color?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  deliveries: Delivery[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}