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
  responsible: TeamMember;
  completed: boolean;
  progress: number;
}

export interface Delivery {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  team: string; // Changed to string for free text input
  complexity: Complexity;
  priority: Priority;
  responsible: string; // Changed to string for free text input
  subDeliveries: SubDelivery[];
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  linkedDeliveries: string[]; // Array of delivery IDs that are linked to this delivery
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  deliveries: Delivery[];
  createdAt: Date;
  updatedAt: Date;
}