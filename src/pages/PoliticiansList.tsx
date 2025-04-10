
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Politician } from '@/types';
import { getAllPoliticians, searchPoliticians } from '@/lib/mock-data';
import { Filter, Plus, Search, Users } from 'lucide-react';

export default function PoliticiansList() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPoliticians();
        setPoliticians(data);
        setFilteredPoliticians(data);
      } catch (err) {
        setError('Failed to fetch politicians');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!politicians.length) return;

    let filtered = [...politicians];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.currentRole.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.county && p.county.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply role filter
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(p => 
        p.currentRole.title.toLowerCase() === roleFilter.toLowerCase()
      );
    }
    
    // Apply party filter
    if (partyFilter && partyFilter !== 'all') {
      filtered = filtered.filter(p => 
        p.parties.some(party => 
          party.name.toLowerCase() === partyFilter.toLowerCase() && party.isCurrent
        )
      );
    }
    
    setFilteredPoliticians(filtered);
  }, [searchQuery, roleFilter, partyFilter, politicians]);

  // Extract unique roles for the filter
  const uniqueRoles = Array.from(new Set(
    politicians.map(p => p.currentRole.title)
  )).sort();
  
  // Extract unique parties for the filter
  const uniqueParties = Array.from(new Set(
    politicians.flatMap(p => 
      p.parties.filter(party => party.isCurrent).map(party => party.name)
    )
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

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading politicians...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-primary text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Politicians</h1>
        <Link 
          to="/politicians/new" 
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Politician
        </Link>
      </div>
      
      {/* Filters */}
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
            {uniqueParties.map(party => (
              <SelectItem key={party} value={party}>{party}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Results info and clear filters */}
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
      
      {/* Politicians grid */}
      {filteredPoliticians.length > 0 ? (
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
        <div className="py-12 text-center">
          <h3 className="text-lg font-medium">No politicians found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

