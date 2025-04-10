
export interface Role {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  status: 'planned' | 'in-progress' | 'completed' | 'failed' | 'abandoned';
  outcome?: string;
  location?: string;
}

export interface Scandal {
  id: string;
  title: string;
  description: string;
  date: string;
  resolution?: string;
  impact?: string;
  mediaLinks?: string[];
}

export interface PopularityPoint {
  date: string;
  rating: number; // 0-100
  source?: string;
}

export interface Party {
  id: string;
  name: string;
  joinDate: string;
  leaveDate?: string;
  isCurrent: boolean;
  position?: string;
}

export interface Politician {
  id: string;
  name: string;
  image?: string;
  dateOfBirth?: string;
  education?: string[];
  bio?: string;
  currentRole: Role;
  formerRoles: Role[];
  parties: Party[];
  projects: Project[];
  scandals: Scandal[];
  popularityHistory: PopularityPoint[];
  county?: string;
  constituency?: string;
  ward?: string;
}
