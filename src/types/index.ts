
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

export interface County {
  id: string;
  name: string;
  created_at?: string;
}

export interface SubCounty {
  id: string;
  name: string;
  county_id: string;
  created_at?: string;
}

export interface Ward {
  id: string;
  name: string;
  sub_county_id: string;
  created_at?: string;
}

export interface Location {
  id: string;
  name: string;
  ward_id: string;
  created_at?: string;
}

export interface SubLocation {
  id: string;
  name: string;
  location_id: string;
  created_at?: string;
}

export interface Village {
  id: string;
  name: string;
  sub_location_id: string;
  created_at?: string;
}
