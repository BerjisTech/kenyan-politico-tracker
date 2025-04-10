
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Politician } from '@/types';
import { searchPoliticians } from '@/lib/mock-data';
import { Search, Users } from 'lucide-react';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const results = await searchPoliticians(query);
        setPoliticians(results);
      } catch (err) {
        setError('Failed to search politicians');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setPoliticians([]);
      setLoading(false);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">
          {query ? `Showing results for "${query}"` : 'Enter a search term'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex w-full max-w-lg items-center space-x-2">
        <Input
          type="search"
          placeholder="Search politicians..."
          className="flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg">Loading results...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-lg text-destructive">{error}</p>
        </div>
      ) : politicians.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {politicians.map((politician) => (
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
      ) : query ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      ) : null}
    </div>
  );
}
