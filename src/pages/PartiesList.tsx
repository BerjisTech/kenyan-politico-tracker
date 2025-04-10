
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Politician } from '@/types';
import { getAllPoliticians } from '@/lib/mock-data';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PartiesList() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPoliticians();
        setPoliticians(data);
      } catch (err) {
        setError('Failed to fetch politicians');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique parties with counts
  const partiesMap = new Map<string, { count: number, current: number, politicians: Politician[] }>();
  
  politicians.forEach(politician => {
    politician.parties.forEach(party => {
      const name = party.name;
      const current = partiesMap.get(name) || { count: 0, current: 0, politicians: [] };
      
      current.count += 1;
      if (party.isCurrent) {
        current.current += 1;
        current.politicians.push(politician);
      }
      
      partiesMap.set(name, current);
    });
  });
  
  // Convert to array and sort
  const parties = Array.from(partiesMap.entries())
    .map(([name, data]) => ({ 
      name, 
      count: data.count, 
      current: data.current,
      politicians: data.politicians
    }))
    .sort((a, b) => b.current - a.current || a.name.localeCompare(b.name));
  
  // Filter parties by search
  const filteredParties = parties.filter(
    party => party.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading parties...</h2>
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
        <h1 className="text-3xl font-bold tracking-tight">Political Parties</h1>
        <p className="text-muted-foreground">Browse politicians by party affiliation</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search parties..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredParties.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredParties.map(party => (
            <Card key={party.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{party.name}</CardTitle>
                  <Badge variant="outline">
                    {party.current} current member{party.current !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {party.count} total affiliation{party.count !== 1 ? 's' : ''} over time
                </p>
                <div className="space-y-2">
                  {party.politicians.slice(0, 3).map(politician => (
                    <div key={politician.id} className="text-sm">
                      <Link 
                        to={`/politicians/${politician.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {politician.name} - {politician.currentRole.title}
                      </Link>
                    </div>
                  ))}
                  {party.politicians.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{party.politicians.length - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <h3 className="text-lg font-medium">No parties found</h3>
          <p className="text-muted-foreground">Try a different search query</p>
        </div>
      )}
    </div>
  );
}
