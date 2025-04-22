import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Politician } from '@/types';
import { getAllPoliticians, filterPoliticiansByRole, filterPoliticiansByParty, searchPoliticians, getParties } from '@/services/database';
import { Filter, Search, Users } from 'lucide-react';
import { DbParty } from '@/services/database';

export default function PoliticiansList() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  const [parties, setParties] = useState<DbParty[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllPoliticians();
        setPoliticians(data);
        setFilteredPoliticians(data);
        
        const partiesData = await getParties();
        setParties(partiesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to fetch politicians');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true);
        let result: Politician[] = [];
        
        if (searchQuery) {
          result = await searchPoliticians(searchQuery);
        } else {
          result = [...politicians];
        }
        
        if (roleFilter && roleFilter !== 'all') {
          result = await filterPoliticiansByRole(roleFilter);
        }
        
        if (partyFilter && partyFilter !== 'all') {
          result = await filterPoliticiansByParty(partyFilter);
        }
        
        setFilteredPoliticians(result);
      } catch (err) {
        console.error("Error applying filters:", err);
        setError('Failed to apply filters');
      } finally {
        setLoading(false);
      }
    };
    
    if (politicians.length > 0) {
      applyFilters();
    }
  }, [searchQuery, roleFilter, partyFilter]);

  const uniqueRoles = Array.from(new Set(
    politicians.map(p => p.currentRole.title)
  )).sort();

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
              {parties.map(party => (
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
      
      <div className="min-h-[200px]">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-destructive">Error loading politicians</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        ) : filteredPoliticians.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPoliticians.map((politician) => (
              <Card key={politician.id} className="overflow-hidden">
                <div className="aspect-[4/3] w-full bg-muted/30 flex items-center justify-center">
                  {politician.image ? (
                    <img 
                      src={politician.image} 
                      alt={politician.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
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
                <CardFooter className="p-4 pt-0">
                  <Link 
                    to={`/politicians/${politician.id}`}
                    className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm text-center hover:bg-secondary/90 transition-colors"
                  >
                    View Profile
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No politicians found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
