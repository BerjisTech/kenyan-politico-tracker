
import { supabase } from "@/integrations/supabase/client";
import { Politician, Role, Party, Project, Scandal, PopularityPoint } from "@/types";

// Types that match the database schema
export interface DbPolitician {
  id: string;
  name: string;
  image?: string;
  date_of_birth?: string;
  education?: string[];
  bio?: string;
  county_id?: string;
  constituency?: string;
  ward?: string;
  current_role_id?: string;
  created_at: string;
}

export interface DbRole {
  id: string;
  title: string;
  organization: string;
  politician_id: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  created_at: string;
}

export interface DbPartyAffiliation {
  id: string;
  party_id: string;
  politician_id: string;
  position?: string;
  join_date: string;
  leave_date?: string;
  is_current: boolean;
  created_at: string;
}

export interface DbParty {
  id: string;
  name: string;
  created_at: string;
}

export interface DbProject {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
  budget?: number;
  status: 'planned' | 'in-progress' | 'completed' | 'failed' | 'abandoned';
  outcome?: string;
  created_at: string;
}

export interface DbProjectPolitician {
  id: string;
  project_id: string;
  politician_id: string;
  role?: string;
  created_at: string;
}

export interface DbScandal {
  id: string;
  title: string;
  description: string;
  date: string;
  resolution?: string;
  impact?: string;
  politician_id: string;
  created_at: string;
}

export interface DbMediaLink {
  id: string;
  url: string;
  scandal_id: string;
  created_at: string;
}

export interface DbPopularityRating {
  id: string;
  politician_id: string;
  rating: number;
  date: string;
  source?: string;
  created_at: string;
}

export interface DbCounty {
  id: string;
  name: string;
  created_at: string;
}

export interface DbSubCounty {
  id: string;
  name: string;
  county_id: string;
  created_at: string;
}

export interface DbWard {
  id: string;
  name: string;
  sub_county_id: string;
  created_at: string;
}

export interface DbProjectLocation {
  id: string;
  project_id: string;
  county_id: string;
  sub_county_id?: string;
  ward_id?: string;
  created_at: string;
}

// Convert database schema to app schema
const convertToPolitician = async (dbPolitician: DbPolitician): Promise<Politician> => {
  // Get county
  const { data: county } = await supabase
    .from('counties')
    .select('name')
    .eq('id', dbPolitician.county_id || '')
    .single();
  
  // Get current role
  const { data: currentRoleData } = await supabase
    .from('roles')
    .select()
    .eq('id', dbPolitician.current_role_id || '')
    .single();
  
  // Get other roles
  const { data: otherRolesData } = await supabase
    .from('roles')
    .select()
    .eq('politician_id', dbPolitician.id)
    .neq('id', dbPolitician.current_role_id || '')
    .order('start_date', { ascending: false });
  
  // Get party affiliations
  const { data: partyAffiliationsData } = await supabase
    .from('party_affiliations')
    .select(`
      id,
      party_id,
      position,
      join_date,
      leave_date,
      is_current,
      parties:party_id (id, name)
    `)
    .eq('politician_id', dbPolitician.id);
  
  // Get projects
  const { data: projectsData } = await supabase
    .from('project_politicians')
    .select(`
      id,
      projects:project_id (id, name, description, start_date, end_date, budget, status, outcome)
    `)
    .eq('politician_id', dbPolitician.id);
  
  // Get scandals
  const { data: scandalsData } = await supabase
    .from('scandals')
    .select()
    .eq('politician_id', dbPolitician.id);
  
  // Get media links for each scandal
  const scandals: Scandal[] = [];
  if (scandalsData) {
    for (const scandal of scandalsData) {
      const { data: mediaLinksData } = await supabase
        .from('media_links')
        .select('url')
        .eq('scandal_id', scandal.id);
        
      scandals.push({
        id: scandal.id,
        title: scandal.title,
        description: scandal.description,
        date: scandal.date,
        resolution: scandal.resolution,
        impact: scandal.impact,
        mediaLinks: mediaLinksData ? mediaLinksData.map(link => link.url) : undefined
      });
    }
  }
  
  // Get popularity ratings
  const { data: popularityHistoryData } = await supabase
    .from('popularity_ratings')
    .select()
    .eq('politician_id', dbPolitician.id)
    .order('date', { ascending: true });
  
  // Convert roles
  const currentRole: Role = currentRoleData ? {
    id: currentRoleData.id,
    title: currentRoleData.title,
    organization: currentRoleData.organization,
    startDate: currentRoleData.start_date,
    endDate: currentRoleData.end_date,
    isCurrent: true,
    description: currentRoleData.description
  } : {
    id: "default",
    title: "Unknown",
    organization: "Unknown",
    startDate: new Date().toISOString().split('T')[0],
    isCurrent: true
  };
  
  const formerRoles: Role[] = otherRolesData ? otherRolesData.map(role => ({
    id: role.id,
    title: role.title,
    organization: role.organization,
    startDate: role.start_date,
    endDate: role.end_date,
    isCurrent: false,
    description: role.description
  })) : [];
  
  // Convert parties
  const parties: Party[] = [];
  if (partyAffiliationsData) {
    for (const affiliation of partyAffiliationsData) {
      if (affiliation.parties) {
        parties.push({
          id: affiliation.id,
          name: affiliation.parties.name,
          joinDate: affiliation.join_date,
          leaveDate: affiliation.leave_date,
          isCurrent: affiliation.is_current,
          position: affiliation.position
        });
      }
    }
  }
  
  // Convert projects
  const projects: Project[] = [];
  if (projectsData) {
    for (const projectRel of projectsData) {
      if (projectRel.projects) {
        projects.push({
          id: projectRel.projects.id,
          name: projectRel.projects.name,
          description: projectRel.projects.description,
          startDate: projectRel.projects.start_date,
          endDate: projectRel.projects.end_date,
          budget: projectRel.projects.budget,
          status: projectRel.projects.status as any,
          outcome: projectRel.projects.outcome,
          location: "" // We'll update this later if needed
        });
      }
    }
  }
  
  // Convert popularity history
  const popularityHistory: PopularityPoint[] = popularityHistoryData ? popularityHistoryData.map(point => ({
    date: point.date,
    rating: point.rating,
    source: point.source
  })) : [];
  
  return {
    id: dbPolitician.id,
    name: dbPolitician.name,
    image: dbPolitician.image,
    dateOfBirth: dbPolitician.date_of_birth,
    education: dbPolitician.education || [],
    bio: dbPolitician.bio || "",
    currentRole,
    formerRoles,
    parties,
    projects,
    scandals,
    popularityHistory,
    county: county ? county.name : undefined,
    constituency: dbPolitician.constituency,
    ward: dbPolitician.ward
  };
};

// Get all counties
export const getCounties = async () => {
  const { data, error } = await supabase
    .from('counties')
    .select();

  if (error) {
    console.error("Error fetching counties:", error);
    throw error;
  }

  return data || [];
};

// Get sub counties by county
export const getSubCountiesByCounty = async (countyId: string) => {
  const { data, error } = await supabase
    .from('sub_counties')
    .select()
    .eq('county_id', countyId)
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching sub counties:", error);
    throw error;
  }

  return data || [];
};

// Get all parties
export const getParties = async () => {
  const { data, error } = await supabase
    .from('parties')
    .select();

  if (error) {
    console.error("Error fetching parties:", error);
    throw error;
  }

  return data || [];
};

// Database service functions
export const getAllPoliticians = async (): Promise<Politician[]> => {
  const { data, error } = await supabase
    .from('politicians')
    .select();

  if (error) {
    console.error("Error fetching politicians:", error);
    throw error;
  }

  const politicians: Politician[] = [];
  for (const dbPolitician of data || []) {
    try {
      const politician = await convertToPolitician(dbPolitician);
      politicians.push(politician);
    } catch (e) {
      console.error(`Error converting politician ${dbPolitician.id}:`, e);
    }
  }

  return politicians;
};

export const getPoliticianById = async (id: string): Promise<Politician | undefined> => {
  const { data, error } = await supabase
    .from('politicians')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return undefined;
    }
    console.error("Error fetching politician by id:", error);
    throw error;
  }

  if (!data) {
    return undefined;
  }

  return convertToPolitician(data);
};

export const searchPoliticians = async (query: string): Promise<Politician[]> => {
  if (!query) return [];
  
  // Search by name, role title, or county
  const { data, error } = await supabase
    .from('politicians')
    .select()
    .or(`name.ilike.%${query}%,bio.ilike.%${query}%`)
    .order('name', { ascending: true });
  
  if (error) {
    console.error("Error searching politicians:", error);
    throw error;
  }
  
  const politicians: Politician[] = [];
  for (const dbPolitician of data || []) {
    try {
      const politician = await convertToPolitician(dbPolitician);
      politicians.push(politician);
    } catch (e) {
      console.error(`Error converting politician ${dbPolitician.id}:`, e);
    }
  }
  
  return politicians;
};

export const filterPoliticiansByRole = async (role: string): Promise<Politician[]> => {
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('politician_id')
    .ilike('title', `%${role}%`);
  
  if (roleError) {
    console.error("Error filtering by role:", roleError);
    throw roleError;
  }
  
  if (!roleData || roleData.length === 0) {
    return [];
  }
  
  const politicianIds = roleData.map(r => r.politician_id);
  const { data, error } = await supabase
    .from('politicians')
    .select()
    .in('id', politicianIds);
  
  if (error) {
    console.error("Error fetching politicians by role:", error);
    throw error;
  }
  
  const politicians: Politician[] = [];
  for (const dbPolitician of data || []) {
    try {
      const politician = await convertToPolitician(dbPolitician);
      politicians.push(politician);
    } catch (e) {
      console.error(`Error converting politician ${dbPolitician.id}:`, e);
    }
  }
  
  return politicians;
};

export const filterPoliticiansByParty = async (partyName: string): Promise<Politician[]> => {
  // First, find the party by name
  const { data: partyData, error: partyError } = await supabase
    .from('parties')
    .select('id')
    .ilike('name', `%${partyName}%`);
  
  if (partyError) {
    console.error("Error finding party:", partyError);
    throw partyError;
  }
  
  if (!partyData || partyData.length === 0) {
    return [];
  }
  
  const partyIds = partyData.map(p => p.id);
  
  // Find party affiliations for those parties
  const { data: affiliationData, error: affiliationError } = await supabase
    .from('party_affiliations')
    .select('politician_id')
    .in('party_id', partyIds);
  
  if (affiliationError) {
    console.error("Error finding affiliations:", affiliationError);
    throw affiliationError;
  }
  
  if (!affiliationData || affiliationData.length === 0) {
    return [];
  }
  
  const politicianIds = affiliationData.map(a => a.politician_id);
  
  // Get the politicians
  const { data, error } = await supabase
    .from('politicians')
    .select()
    .in('id', politicianIds);
  
  if (error) {
    console.error("Error fetching politicians by party:", error);
    throw error;
  }
  
  const politicians: Politician[] = [];
  for (const dbPolitician of data || []) {
    try {
      const politician = await convertToPolitician(dbPolitician);
      politicians.push(politician);
    } catch (e) {
      console.error(`Error converting politician ${dbPolitician.id}:`, e);
    }
  }
  
  return politicians;
};

export const filterPoliticiansByCounty = async (countyName: string): Promise<Politician[]> => {
  // First, find the county by name
  const { data: countyData, error: countyError } = await supabase
    .from('counties')
    .select('id')
    .ilike('name', `%${countyName}%`);
  
  if (countyError) {
    console.error("Error finding county:", countyError);
    throw countyError;
  }
  
  if (!countyData || countyData.length === 0) {
    return [];
  }
  
  const countyIds = countyData.map(c => c.id);
  
  // Get politicians in those counties
  const { data, error } = await supabase
    .from('politicians')
    .select()
    .in('county_id', countyIds);
  
  if (error) {
    console.error("Error fetching politicians by county:", error);
    throw error;
  }
  
  const politicians: Politician[] = [];
  for (const dbPolitician of data || []) {
    try {
      const politician = await convertToPolitician(dbPolitician);
      politicians.push(politician);
    } catch (e) {
      console.error(`Error converting politician ${dbPolitician.id}:`, e);
    }
  }
  
  return politicians;
};

// Populate some sample politicians in the database
export const populateSampleData = async () => {
  // Import the mock data
  const { mockPoliticians } = await import('../lib/mock-data');
  
  for (const politician of mockPoliticians) {
    try {
      // Add county if not exists
      let countyId = null;
      if (politician.county) {
        const { data: countyData } = await supabase
          .from('counties')
          .select('id')
          .eq('name', politician.county)
          .single();
        
        if (countyData) {
          countyId = countyData.id;
        }
      }
      
      // Insert politician
      const { data: politicianData, error: politicianError } = await supabase
        .from('politicians')
        .insert({
          name: politician.name,
          image: politician.image,
          date_of_birth: politician.dateOfBirth,
          education: politician.education,
          bio: politician.bio,
          county_id: countyId,
          constituency: politician.constituency,
          ward: politician.ward
        })
        .select('id')
        .single();
      
      if (politicianError || !politicianData) {
        console.error(`Error inserting politician ${politician.name}:`, politicianError);
        continue;
      }
      
      const politicianId = politicianData.id;
      
      // Add current role
      const { data: currentRoleData, error: currentRoleError } = await supabase
        .from('roles')
        .insert({
          title: politician.currentRole.title,
          organization: politician.currentRole.organization,
          politician_id: politicianId,
          start_date: politician.currentRole.startDate,
          end_date: politician.currentRole.endDate,
          is_current: true,
          description: politician.currentRole.description
        })
        .select('id')
        .single();
      
      if (currentRoleError) {
        console.error(`Error inserting role for ${politician.name}:`, currentRoleError);
      } else if (currentRoleData) {
        // Update politician with current role ID
        await supabase
          .from('politicians')
          .update({ current_role_id: currentRoleData.id })
          .eq('id', politicianId);
      }
      
      // Add former roles
      for (const role of politician.formerRoles) {
        await supabase
          .from('roles')
          .insert({
            title: role.title,
            organization: role.organization,
            politician_id: politicianId,
            start_date: role.startDate,
            end_date: role.endDate,
            is_current: false,
            description: role.description
          });
      }
      
      // Add parties
      for (const party of politician.parties) {
        // Find or create party
        let partyId = null;
        const { data: partyData } = await supabase
          .from('parties')
          .select('id')
          .eq('name', party.name)
          .single();
        
        if (partyData) {
          partyId = partyData.id;
        } else {
          const { data: newParty } = await supabase
            .from('parties')
            .insert({ name: party.name })
            .select('id')
            .single();
          
          if (newParty) {
            partyId = newParty.id;
          }
        }
        
        if (partyId) {
          // Add party affiliation
          await supabase
            .from('party_affiliations')
            .insert({
              party_id: partyId,
              politician_id: politicianId,
              position: party.position,
              join_date: party.joinDate,
              leave_date: party.leaveDate,
              is_current: party.isCurrent
            });
        }
      }
      
      // Add projects
      for (const project of politician.projects) {
        // Create project
        const { data: projectData } = await supabase
          .from('projects')
          .insert({
            name: project.name,
            description: project.description,
            start_date: project.startDate,
            end_date: project.endDate,
            budget: project.budget,
            status: project.status,
            outcome: project.outcome
          })
          .select('id')
          .single();
        
        if (projectData) {
          // Add project politician relationship
          await supabase
            .from('project_politicians')
            .insert({
              project_id: projectData.id,
              politician_id: politicianId
            });
          
          // Handle project location if available
          if (project.location) {
            const countyName = project.location.split(',')[0].trim();
            const { data: countyData } = await supabase
              .from('counties')
              .select('id')
              .ilike('name', `%${countyName}%`)
              .single();
            
            if (countyData) {
              await supabase
                .from('project_locations')
                .insert({
                  project_id: projectData.id,
                  county_id: countyData.id
                });
            }
          }
        }
      }
      
      // Add scandals
      for (const scandal of politician.scandals) {
        const { data: scandalData } = await supabase
          .from('scandals')
          .insert({
            title: scandal.title,
            description: scandal.description,
            date: scandal.date,
            resolution: scandal.resolution,
            impact: scandal.impact,
            politician_id: politicianId
          })
          .select('id')
          .single();
        
        if (scandalData && scandal.mediaLinks) {
          // Add media links
          for (const url of scandal.mediaLinks) {
            await supabase
              .from('media_links')
              .insert({
                url,
                scandal_id: scandalData.id
              });
          }
        }
      }
      
      // Add popularity history
      for (const point of politician.popularityHistory) {
        await supabase
          .from('popularity_ratings')
          .insert({
            politician_id: politicianId,
            rating: point.rating,
            date: point.date,
            source: point.source
          });
      }
      
      console.log(`Successfully added politician ${politician.name}`);
    } catch (e) {
      console.error(`Error adding politician ${politician.name}:`, e);
    }
  }
};
