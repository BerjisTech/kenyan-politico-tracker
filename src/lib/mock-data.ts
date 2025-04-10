
import { Politician, Role, Party, Project, Scandal, PopularityPoint } from '../types';

// Generate unique IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Sample data
export const mockPoliticians: Politician[] = [
  {
    id: generateId(),
    name: "William Ruto",
    image: "/politicians/ruto.png",
    dateOfBirth: "1966-12-21",
    education: ["University of Nairobi", "Kenyatta University"],
    bio: "William Samoei Arap Ruto is the 5th and current President of Kenya since 13 September 2022.",
    currentRole: {
      id: generateId(),
      title: "President",
      organization: "Republic of Kenya",
      startDate: "2022-09-13",
      isCurrent: true,
      description: "Head of State and Government of Kenya"
    },
    formerRoles: [
      {
        id: generateId(),
        title: "Deputy President",
        organization: "Republic of Kenya",
        startDate: "2013-04-09",
        endDate: "2022-09-13",
        isCurrent: false,
        description: "Served as Deputy President under Uhuru Kenyatta"
      },
      {
        id: generateId(),
        title: "Minister of Agriculture",
        organization: "Government of Kenya",
        startDate: "2008-04-17",
        endDate: "2010-04-21",
        isCurrent: false,
      }
    ],
    parties: [
      {
        id: generateId(),
        name: "United Democratic Alliance (UDA)",
        joinDate: "2021-01-15",
        isCurrent: true,
        position: "Party Leader"
      },
      {
        id: generateId(),
        name: "Jubilee Party",
        joinDate: "2016-09-10",
        leaveDate: "2021-01-15",
        isCurrent: false,
        position: "Deputy Party Leader"
      }
    ],
    projects: [
      {
        id: generateId(),
        name: "Bottom-up Economic Model",
        description: "Economic transformation agenda focused on empowering low income earners.",
        startDate: "2022-09-13",
        status: "in-progress",
        location: "Nationwide"
      },
      {
        id: generateId(),
        name: "Affordable Housing Program",
        description: "Initiative to build 200,000 affordable housing units per year.",
        startDate: "2022-10-01",
        status: "in-progress",
        budget: 250000000,
        location: "Nationwide"
      }
    ],
    scandals: [
      {
        id: generateId(),
        title: "Land Grabbing Allegations",
        description: "Accusations regarding illegal acquisition of land in Eldoret.",
        date: "2004-06-15",
        resolution: "Case was dismissed due to lack of evidence",
        impact: "Temporary political setback"
      }
    ],
    popularityHistory: [
      { date: "2020-01-01", rating: 65 },
      { date: "2020-06-01", rating: 62 },
      { date: "2021-01-01", rating: 68 },
      { date: "2021-06-01", rating: 72 },
      { date: "2022-01-01", rating: 75 },
      { date: "2022-06-01", rating: 78 },
      { date: "2023-01-01", rating: 60 },
      { date: "2023-06-01", rating: 55 },
      { date: "2024-01-01", rating: 52 }
    ],
    county: "Uasin Gishu"
  },
  {
    id: generateId(),
    name: "Raila Odinga",
    image: "/politicians/raila.png",
    dateOfBirth: "1945-01-07",
    education: ["Otto von Guericke University Magdeburg", "East German Vocational School"],
    bio: "Raila Amolo Odinga is a Kenyan politician who served as the Prime Minister of Kenya from 2008 to 2013.",
    currentRole: {
      id: generateId(),
      title: "Party Leader",
      organization: "Orange Democratic Movement (ODM)",
      startDate: "2005-09-01",
      isCurrent: true,
      description: "Leader of one of Kenya's major political parties"
    },
    formerRoles: [
      {
        id: generateId(),
        title: "Prime Minister",
        organization: "Republic of Kenya",
        startDate: "2008-04-17",
        endDate: "2013-04-09",
        isCurrent: false,
        description: "Served as Prime Minister in the coalition government"
      },
      {
        id: generateId(),
        title: "Member of Parliament",
        organization: "Langata Constituency",
        startDate: "1992-01-01",
        endDate: "2013-01-01",
        isCurrent: false,
      }
    ],
    parties: [
      {
        id: generateId(),
        name: "Orange Democratic Movement (ODM)",
        joinDate: "2005-09-01",
        isCurrent: true,
        position: "Party Leader"
      },
      {
        id: generateId(),
        name: "National Development Party (NDP)",
        joinDate: "1997-01-01",
        leaveDate: "2002-01-01",
        isCurrent: false,
        position: "Party Leader"
      }
    ],
    projects: [
      {
        id: generateId(),
        name: "Kibera Slum Upgrading Project",
        description: "Initiative to improve housing and infrastructure in Kibera slum.",
        startDate: "2003-06-15",
        endDate: "2007-12-20",
        status: "completed",
        location: "Kibera, Nairobi"
      }
    ],
    scandals: [
      {
        id: generateId(),
        title: "Maize Scandal",
        description: "Allegations of involvement in maize import corruption scandal.",
        date: "2009-02-13",
        resolution: "No charges were filed",
        impact: "Affected public trust in the coalition government"
      }
    ],
    popularityHistory: [
      { date: "2020-01-01", rating: 70 },
      { date: "2020-06-01", rating: 68 },
      { date: "2021-01-01", rating: 72 },
      { date: "2021-06-01", rating: 75 },
      { date: "2022-01-01", rating: 76 },
      { date: "2022-06-01", rating: 74 },
      { date: "2023-01-01", rating: 65 },
      { date: "2023-06-01", rating: 62 },
      { date: "2024-01-01", rating: 60 }
    ],
    county: "Siaya",
    constituency: "Kisumu Rural"
  },
  {
    id: generateId(),
    name: "Martha Karua",
    image: "/politicians/karua.png",
    dateOfBirth: "1957-09-22",
    education: ["University of Nairobi"],
    bio: "Martha Wangari Karua is a Kenyan politician and advocate who was formerly the Minister of Justice.",
    currentRole: {
      id: generateId(),
      title: "Party Leader",
      organization: "NARC-Kenya",
      startDate: "2008-01-15",
      isCurrent: true,
      description: "Leader of the NARC-Kenya political party"
    },
    formerRoles: [
      {
        id: generateId(),
        title: "Minister of Justice",
        organization: "Government of Kenya",
        startDate: "2005-01-01",
        endDate: "2009-04-06",
        isCurrent: false,
        description: "Served as Minister of Justice and Constitutional Affairs"
      },
      {
        id: generateId(),
        title: "Member of Parliament",
        organization: "Gichugu Constituency",
        startDate: "1992-01-01",
        endDate: "2013-01-01",
        isCurrent: false,
      }
    ],
    parties: [
      {
        id: generateId(),
        name: "NARC-Kenya",
        joinDate: "2008-01-15",
        isCurrent: true,
        position: "Party Leader"
      },
      {
        id: generateId(),
        name: "Democratic Party",
        joinDate: "1992-01-01",
        leaveDate: "2002-01-01",
        isCurrent: false,
        position: "Member"
      }
    ],
    projects: [
      {
        id: generateId(),
        name: "Constitutional Reform",
        description: "Worked on Kenya's constitutional reform process",
        startDate: "2005-01-01",
        endDate: "2010-08-27",
        status: "completed",
        location: "Nationwide"
      }
    ],
    scandals: [],
    popularityHistory: [
      { date: "2020-01-01", rating: 55 },
      { date: "2020-06-01", rating: 56 },
      { date: "2021-01-01", rating: 58 },
      { date: "2021-06-01", rating: 60 },
      { date: "2022-01-01", rating: 65 },
      { date: "2022-06-01", rating: 70 },
      { date: "2023-01-01", rating: 65 },
      { date: "2023-06-01", rating: 63 },
      { date: "2024-01-01", rating: 62 }
    ],
    county: "Kirinyaga",
    constituency: "Gichugu"
  }
];

// Data service functions
export const getAllPoliticians = (): Promise<Politician[]> => {
  return Promise.resolve([...mockPoliticians]);
};

export const getPoliticianById = (id: string): Promise<Politician | undefined> => {
  const politician = mockPoliticians.find(p => p.id === id);
  return Promise.resolve(politician ? { ...politician } : undefined);
};

export const createPolitician = (politician: Omit<Politician, 'id'>): Promise<Politician> => {
  const newPolitician = {
    ...politician,
    id: generateId()
  };
  mockPoliticians.push(newPolitician);
  return Promise.resolve({ ...newPolitician });
};

export const updatePolitician = (id: string, politician: Partial<Politician>): Promise<Politician | undefined> => {
  const index = mockPoliticians.findIndex(p => p.id === id);
  if (index === -1) {
    return Promise.resolve(undefined);
  }
  
  mockPoliticians[index] = {
    ...mockPoliticians[index],
    ...politician
  };
  
  return Promise.resolve({ ...mockPoliticians[index] });
};

export const deletePolitician = (id: string): Promise<boolean> => {
  const index = mockPoliticians.findIndex(p => p.id === id);
  if (index === -1) {
    return Promise.resolve(false);
  }
  
  mockPoliticians.splice(index, 1);
  return Promise.resolve(true);
};

export const searchPoliticians = (query: string): Promise<Politician[]> => {
  const results = mockPoliticians.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.currentRole.title.toLowerCase().includes(query.toLowerCase()) ||
    (p.county && p.county.toLowerCase().includes(query.toLowerCase()))
  );
  
  return Promise.resolve([...results]);
};

// Additional filter functions
export const filterPoliticiansByRole = (role: string): Promise<Politician[]> => {
  const results = mockPoliticians.filter(p => 
    p.currentRole.title.toLowerCase().includes(role.toLowerCase()) || 
    p.formerRoles.some(r => r.title.toLowerCase().includes(role.toLowerCase()))
  );
  
  return Promise.resolve([...results]);
};

export const filterPoliticiansByParty = (party: string): Promise<Politician[]> => {
  const results = mockPoliticians.filter(p => 
    p.parties.some(party => party.name.toLowerCase().includes(party.toLowerCase()))
  );
  
  return Promise.resolve([...results]);
};

export const filterPoliticiansByCounty = (county: string): Promise<Politician[]> => {
  const results = mockPoliticians.filter(p => 
    p.county && p.county.toLowerCase() === county.toLowerCase()
  );
  
  return Promise.resolve([...results]);
};
