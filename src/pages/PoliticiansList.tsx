import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Politician } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Filter, Search, Users, X, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface DbParty {
  id: string;
  name: string;
}

export default function PoliticiansList() {
  const navigate = useNavigate();
  const { id: politicianId } = useParams();
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>([]);
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  const [uniqueRoles, setUniqueRoles] = useState<string[]>([]);
  
  const { data: politiciansData, isLoading: isLoadingPoliticians, error: politiciansError } = useQuery({
    queryKey: ['politicians-optimized'],
    queryFn: async () => {
      const { data: politicians, error } = await supabase
        .from('politicians')
        .select(`
          id, name, image, bio, constituency, ward, county_id,
          counties:county_id(name),
          roles:current_role_id(id, title, organization, start_date)
        `);
      
      if (error) throw error;
      
      return politicians.map(politician => ({
        id: politician.id,
        name: politician.name,
        image: politician.image,
        bio: politician.bio || '',
        county: politician.counties?.name || 'N/A',
        constituency: politician.constituency,
        ward: politician.ward,
        currentRole: {
          id: politician.roles?.id || 'unknown',
          title: politician.roles?.title || 'Unknown Position',
          organization: politician.roles?.organization || 'Unknown Organization',
          startDate: politician.roles?.start_date,
          isCurrent: true
        },
        formerRoles: [],
        parties: [],
        projects: [],
        scandals: [],
        popularityHistory: [],
        dateOfBirth: null,
        education: []
      }));
    }
  });
  
  const { data: parties } = useQuery({
    queryKey: ['parties-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('parties').select('*');
      if (error) throw error;
      return data || [];
    }
  });
  
  const { data: politicianDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['politician-details', politicianId],
    enabled: !!politicianId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('politicians')
        .select(`
          id, name, image, bio, county_id, constituency, ward, date_of_birth, education,
          counties:county_id(name),
          roles:current_role_id(id, title, organization, start_date)
        `)
        .eq('id', politicianId)
        .single();
      
      if (error) throw error;
      
      const { data: partyAffiliations } = await supabase
        .from('party_affiliations')
        .select('*, parties:party_id(id, name)')
        .eq('politician_id', politicianId)
        .order('is_current', { ascending: false });
      
      const { count: projectsCount } = await supabase
        .from('project_politicians')
        .select('*', { count: 'exact', head: true })
        .eq('politician_id', politicianId);
      
      return {
        id: data.id,
        name: data.name,
        image: data.image,
        bio: data.bio || '',
        county: data.counties?.name || 'N/A',
        constituency: data.constituency,
        ward: data.ward,
        dateOfBirth: data.date_of_birth,
        education: data.education || [],
        currentRole: {
          id: data.roles?.id || 'unknown',
          title: data.roles?.title || 'Unknown Position',
          organization: data.roles?.organization || 'Unknown Organization',
          startDate: data.roles?.start_date,
          isCurrent: true
        },
        formerRoles: [],
        parties: partyAffiliations?.map(pa => ({
          id: pa.id,
          name: pa.parties?.name || 'Unknown Party',
          joinDate: pa.join_date,
          leaveDate: pa.leave_date,
          isCurrent: pa.is_current,
          position: pa.position || undefined
        })) || [],
        projects: Array(projectsCount || 0).fill({ id: 'placeholder' }),
        scandals: [],
        popularityHistory: []
      };
    }
  });
  
  useEffect(() => {
    if (politicianDetails) {
      setSelectedPolitician(politicianDetails);
    } else {
      setSelectedPolitician(null);
    }
  }, [politicianDetails]);
  
  useEffect(() => {
    if (politiciansData) {
      const roles = Array.from(new Set(
        politiciansData
          .map(p => p.currentRole.title)
          .filter(Boolean)
      )).sort();
      
      setUniqueRoles(roles);
      
      let filtered = [...politiciansData];
      
      if (searchQuery) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.bio.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (roleFilter && roleFilter !== 'all') {
        filtered = filtered.filter(p => 
          p.currentRole.title?.toLowerCase() === roleFilter.toLowerCase()
        );
      }
      
      setFilteredPoliticians(filtered);
    }
  }, [politiciansData, searchQuery, roleFilter, partyFilter]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
  };

  const handlePartyFilterChange = (value: string) => {
    setPartyFilter(value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setPartyFilter('all');
  };

  const closeDetails = () => {
    navigate('/politicians');
  };

  const handleSelectPolitician = (id: string) => {
    navigate(`/politicians/${id}`);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Politicians</h1>
      </div>
      
      <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search politicians..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={partyFilter} onValueChange={handlePartyFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by party" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parties</SelectItem>
              {parties?.map((party: DbParty) => (
                <SelectItem key={party.id} value={party.name}>{party.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <p>
            Showing <strong>{filteredPoliticians.length}</strong> politicians
            {(searchQuery || roleFilter !== 'all' || partyFilter !== 'all') && " with applied filters"}
          </p>
          {(searchQuery || roleFilter !== 'all' || partyFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex gap-8">
        <div className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3 ${selectedPolitician ? 'lg:grid-cols-2 flex-1' : 'lg:grid-cols-4 w-full'}`}>
          {isLoadingPoliticians ? (
            <>
              {Array(8).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : politiciansError ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-destructive">Error loading politicians</h3>
              <p className="text-muted-foreground mt-2">{(politiciansError as Error).message}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : filteredPoliticians.length > 0 ? (
            <>
              {filteredPoliticians.map((politician) => (
                <Card 
                  key={politician.id} 
                  className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                    selectedPolitician?.id === politician.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectPolitician(politician.id)}
                >
                  <div className="aspect-[4/3] w-full bg-muted/30 flex items-center justify-center">
                    {politician.image ? (
                      <img 
                        src={politician.image} 
                        alt={politician.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <Users className="h-10 w-10 text-muted" />
                    )}
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-lg">{politician.name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {politician.currentRole.title} - {politician.currentRole.organization}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 py-2 text-sm">
                    <div className="flex justify-between">
                      <span>
                        <strong>County:</strong> {politician.county || 'N/A'}
                      </span>
                      <span>
                        <strong>Projects:</strong> {politician.projects.length}
                      </span>
                    </div>
                    {politician.parties.find(p => p.isCurrent) && (
                      <div className="mt-1">
                        <strong>Party:</strong> {politician.parties.find(p => p.isCurrent)?.name}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium">No politicians found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {selectedPolitician && (
          <div className="w-1/2 border rounded-lg bg-white shadow-sm sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
            {detailsLoading ? (
              <div className="p-8 animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-24 bg-muted rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start p-4 border-b">
                  <h2 className="text-xl font-bold">{selectedPolitician.name}</h2>
                  <Button variant="ghost" size="icon" onClick={closeDetails}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 space-y-4">
                  {selectedPolitician.image && (
                    <div className="aspect-video max-h-[240px] overflow-hidden rounded-md">
                      <img 
                        src={selectedPolitician.image} 
                        alt={selectedPolitician.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Current Position</h3>
                    <p>
                      {selectedPolitician.currentRole.title} at {selectedPolitician.currentRole.organization}
                      {selectedPolitician.currentRole.startDate && ` since ${new Date(selectedPolitician.currentRole.startDate).getFullYear()}`}
                    </p>
                  </div>

                  {selectedPolitician.county && (
                    <div className="space-y-2">
                      <h3 className="font-medium">County</h3>
                      <p>{selectedPolitician.county}</p>
                    </div>
                  )}

                  {selectedPolitician.parties.some(p => p.isCurrent) && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Political Party</h3>
                      <p>{selectedPolitician.parties.find(p => p.isCurrent)?.name}</p>
                    </div>
                  )}

                  {selectedPolitician.bio && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Bio</h3>
                      <p className="line-clamp-4 text-sm text-muted-foreground">{selectedPolitician.bio}</p>
                    </div>
                  )}

                  {selectedPolitician.projects.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Projects</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPolitician.projects.length} projects in total
                      </p>
                    </div>
                  )}

                  <Button asChild className="w-full mt-4 group">
                    <Link to={`/politicians/${selectedPolitician.id}`}>
                      View Full Profile
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
