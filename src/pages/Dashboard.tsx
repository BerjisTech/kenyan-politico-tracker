
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Politician, PopularityPoint } from '@/types';
import { getAllPoliticians } from '@/lib/mock-data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertTriangle, Award, BarChart2, Flag, Users } from 'lucide-react';

export default function Dashboard() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPoliticians();
        setPoliticians(data);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const totalPoliticians = politicians.length;
  const totalScandals = politicians.reduce((acc, politician) => acc + politician.scandals.length, 0);
  const totalProjects = politicians.reduce((acc, politician) => acc + politician.projects.length, 0);
  const completedProjects = politicians.reduce(
    (acc, politician) => acc + politician.projects.filter(p => p.status === 'completed').length, 
    0
  );
  
  // Get top politicians by popularity
  const topPoliticians = [...politicians]
    .sort((a, b) => {
      const aLatest = a.popularityHistory[a.popularityHistory.length - 1]?.rating || 0;
      const bLatest = b.popularityHistory[b.popularityHistory.length - 1]?.rating || 0;
      return bLatest - aLatest;
    })
    .slice(0, 5);
  
  // Prepare data for charts
  const popularityData = topPoliticians.map(politician => {
    const latestPopularity = politician.popularityHistory[politician.popularityHistory.length - 1];
    return {
      name: politician.name,
      popularity: latestPopularity?.rating || 0
    };
  });
  
  // Get trend data for a featured politician (first in the list)
  const trendData = politicians[0]?.popularityHistory.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { year: '2-digit', month: 'short' }),
    popularity: point.rating
  })) || [];

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading dashboard data...</h2>
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link to="/politicians/new" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Add Politician
        </Link>
      </div>
      
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Politicians</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoliticians}</div>
            <p className="text-xs text-muted-foreground">Tracked in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {completedProjects} completed ({Math.round((completedProjects / totalProjects) * 100)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recorded Scandals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScandals}</div>
            <p className="text-xs text-muted-foreground">
              {(totalScandals / totalPoliticians).toFixed(1)} avg per politician
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Political Parties</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(politicians.flatMap(p => p.parties.map(party => party.name))).size}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Popular Politicians</CardTitle>
            <CardDescription>Latest popularity ratings</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={popularityData}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="popularity" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Popularity Trend</CardTitle>
            <CardDescription>
              {politicians[0]?.name || "Featured Politician"}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="popularity" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent politicians */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Featured Politicians</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {politicians.slice(0, 3).map((politician) => (
            <Card key={politician.id} className="overflow-hidden">
              <div className="aspect-video w-full bg-muted/30 flex items-center justify-center">
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
              <CardHeader>
                <CardTitle>{politician.name}</CardTitle>
                <CardDescription>
                  {politician.currentRole.title} - {politician.currentRole.organization}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {politician.bio || 'No biography available'}
                </div>
                <div className="mt-4 flex justify-between">
                  <span className="text-sm">
                    <strong>County:</strong> {politician.county || 'N/A'}
                  </span>
                  <span className="text-sm">
                    <strong>Projects:</strong> {politician.projects.length}
                  </span>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Link 
                  to={`/politicians/${politician.id}`}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm inline-block hover:bg-secondary/90 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
