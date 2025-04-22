
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DbCounty {
  id: string;
  name: string;
}

interface SimplePolitician {
  id: string;
  name: string;
  image?: string;
  currentRole: {
    title: string;
  };
}

interface CountyWithPoliticians extends DbCounty {
  politicians: SimplePolitician[];
}

export default function CountiesList() {
  const navigate = useNavigate();
  const { id: countyId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<CountyWithPoliticians | null>(null);

  // Fetch counties with optimized query
  const { data: counties, isLoading, error } = useQuery({
    queryKey: ['counties-optimized'],
    queryFn: async () => {
      // Get all counties
      const { data: countiesData, error: countiesError } = await supabase
        .from('counties')
        .select('id, name')
        .order('name');
      
      if (countiesError) throw countiesError;
      
      // For each county, get a count of politicians
      const countiesWithPoliticians: CountyWithPoliticians[] = await Promise.all(
        countiesData.map(async (county) => {
          const { data: politiciansData } = await supabase
            .from('politicians')
            .select('id, name, image, roles:current_role_id(title)')
            .eq('county_id', county.id)
            .limit(5);
          
          return {
            ...county,
            politicians: politiciansData?.map(p => ({
              id: p.id,
              name: p.name,
              image: p.image,
              currentRole: {
                title: p.roles?.title || 'Unknown Position'
              }
            })) || []
          };
        })
      );
      
      return countiesWithPoliticians;
    }
  });

  // Get county details if ID is provided
  const { data: countyDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['county-details', countyId],
    enabled: !!countyId,
    queryFn: async () => {
      // Get county information
      const { data: countyData, error: countyError } = await supabase
        .from('counties')
        .select('id, name')
        .eq('id', countyId)
        .single();
      
      if (countyError) throw countyError;
      
      // Get politicians for this county
      const { data: politiciansData } = await supabase
        .from('politicians')
        .select(`
          id, name, image, 
          roles:current_role_id(title, organization)
        `)
        .eq('county_id', countyId)
        .order('name');
      
      return {
        ...countyData,
        politicians: politiciansData?.map(p => ({
          id: p.id,
          name: p.name,
          image: p.image,
          currentRole: {
            title: p.roles?.title || 'Unknown Position'
          }
        })) || []
      };
    }
  });

  // Filter counties by search
  const filteredCounties = counties?.filter(
    county => county.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCountySelect = (county: CountyWithPoliticians) => {
    navigate(`/counties/${county.id}`);
  };

  const closeDetails = () => {
    navigate('/counties');
  };

  // When county details are loaded, set selected county
  if (countyDetails && !selectedCounty) {
    setSelectedCounty(countyDetails);
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Counties</h1>
        <p className="text-muted-foreground">Browse politicians by county</p>
      </div>

      {/* Filter section - always visible */}
      <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search counties..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-8">
        <div className={`grid gap-4 sm:grid-cols-2 ${selectedCounty ? 'md:grid-cols-2 flex-1' : 'md:grid-cols-3 w-full'}`}>
          {isLoading ? (
            <>
              {Array(6).fill(0).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded mb-4" />
                    <div className="space-y-2">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-3 bg-muted rounded" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-destructive">Error loading counties</h3>
              <p className="text-muted-foreground mt-2">{(error as Error).message}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : filteredCounties.length > 0 ? (
            <>
              {filteredCounties.map(county => (
                <Card 
                  key={county.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    selectedCounty?.id === county.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleCountySelect(county)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle>{county.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {county.politicians.length} politician{county.politicians.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-2">
                      {county.politicians.slice(0, 3).map(politician => (
                        <div key={politician.id} className="text-sm">
                          <Link 
                            to={`/politicians/${politician.id}`}
                            className="hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {politician.name} - {politician.currentRole.title}
                          </Link>
                        </div>
                      ))}
                      {county.politicians.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{county.politicians.length - 3} more
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <div className="col-span-full py-12 text-center">
              <h3 className="text-lg font-medium">No counties found</h3>
              <p className="text-muted-foreground">Try a different search query</p>
            </div>
          )}
        </div>

        {/* County Details Panel */}
        {selectedCounty && (
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
                  <h2 className="text-xl font-bold">{selectedCounty.name} County</h2>
                  <Button variant="ghost" size="icon" onClick={closeDetails}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Politicians</h3>
                    <p className="text-muted-foreground">{selectedCounty.politicians.length} registered politicians</p>
                  </div>

                  {selectedCounty.politicians.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Key Representatives</h4>
                      <div className="space-y-2">
                        {selectedCounty.politicians.slice(0, 5).map(politician => (
                          <div key={politician.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-md">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center overflow-hidden">
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
                                <Users className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Link to={`/politicians/${politician.id}`} className="font-medium text-sm hover:underline">
                                {politician.name}
                              </Link>
                              <p className="text-xs text-muted-foreground">{politician.currentRole.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button asChild className="w-full mt-4 group">
                    <Link to={`/counties/${selectedCounty.id}`}>
                      View Full County Profile
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
