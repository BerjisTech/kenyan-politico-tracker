
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Politician } from '@/types';
import { getCounties, getAllPoliticians, filterPoliticiansByCounty } from '@/services/database';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DbCounty } from '@/services/database';

export default function CountiesList() {
  const [counties, setCounties] = useState<DbCounty[]>([]);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countiesData, politiciansData] = await Promise.all([
          getCounties(),
          getAllPoliticians()
        ]);
        
        setCounties(countiesData);
        setPoliticians(politiciansData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter counties by search
  const filteredCounties = counties.filter(
    county => county.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get politicians by county
  const getPoliticiansByCounty = (countyName: string) => {
    return politicians.filter(p => p.county === countyName);
  };

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading counties...</h2>
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
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Counties</h1>
        <p className="text-muted-foreground">Browse politicians by county</p>
      </div>

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

      {filteredCounties.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredCounties.map(county => {
            const countyPoliticians = getPoliticiansByCounty(county.name);
            return (
              <Card key={county.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle>{county.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {countyPoliticians.length} politician{countyPoliticians.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2">
                    {countyPoliticians.slice(0, 3).map(politician => (
                      <div key={politician.id} className="text-sm">
                        <Link 
                          to={`/politicians/${politician.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {politician.name} - {politician.currentRole.title}
                        </Link>
                      </div>
                    ))}
                    {countyPoliticians.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{countyPoliticians.length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <h3 className="text-lg font-medium">No counties found</h3>
          <p className="text-muted-foreground">Try a different search query</p>
        </div>
      )}
    </div>
  );
}
