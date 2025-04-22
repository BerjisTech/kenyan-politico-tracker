
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Activity, BarChart3, PieChart, TrendingUp, FileBarChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsePieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { Politician, Project } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

// Sample data for charts
const activityData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 700 },
  { name: 'May', value: 600 },
  { name: 'Jun', value: 800 },
  { name: 'Jul', value: 1000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [countyStats, setCountyStats] = useState<{name: string, count: number}[]>([]);
  const [partyStats, setPartyStats] = useState<{name: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPoliticians: 0,
    totalProjects: 0,
    totalCounties: 0,
    totalParties: 0,
  });
  
  const isAdmin = userRole === 'superadmin' || userRole === 'admin';
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch politicians
        const { data: politiciansData, error: politiciansError } = await supabase
          .from('politicians')
          .select(`
            id, name, bio, county_id, counties(name),
            roles!roles_politician_id_fkey(id, title, organization)
          `)
          .order('name');
          
        if (politiciansError) throw politiciansError;
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .limit(20);
          
        if (projectsError) throw projectsError;
        
        // Fetch county stats
        const { data: countyData, error: countyError } = await supabase
          .from('counties')
          .select('id, name, politicians(count)');
          
        if (countyError) throw countyError;
        
        // Fetch party stats
        const { data: partyData, error: partyError } = await supabase
          .from('parties')
          .select('id, name, party_affiliations(count)');
        
        if (partyError) throw partyError;
        
        // Calculate stats
        const countyStats = countyData
          .filter(county => county.politicians_count > 0)
          .map(county => ({
            name: county.name,
            count: county.politicians_count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
          
        const partyStats = partyData
          .filter(party => party.party_affiliations_count > 0)
          .map(party => ({
            name: party.name,
            count: party.party_affiliations_count
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setStats({
          totalPoliticians: politiciansData?.length || 0,
          totalProjects: projectsData?.length || 0,
          totalCounties: countyData?.length || 0,
          totalParties: partyData?.length || 0,
        });
        
        setPoliticians(politiciansData as Politician[] || []);
        setProjects(projectsData as Project[] || []);
        setCountyStats(countyStats);
        setPartyStats(partyStats);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to fetch dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to access the admin dashboard.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="mt-4"
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          System overview and key performance metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Politicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPoliticians}</div>
            <p className="text-xs text-muted-foreground">Total politicians tracked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <FileBarChart className="mr-2 h-5 w-5 text-primary" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Total projects tracked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-primary" />
              Counties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCounties}</div>
            <p className="text-xs text-muted-foreground">Counties represented</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Parties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalParties}</div>
            <p className="text-xs text-muted-foreground">Political parties</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Chart */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              System Activity
            </CardTitle>
            <CardDescription>Weekly activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activityData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* County Distribution Chart */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Politicians by County
            </CardTitle>
            <CardDescription>Top 5 counties by representation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={countyStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {countyStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userRole === 'superadmin' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-center py-4">
                <Users className="h-12 w-12 text-primary/80" />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Politicians</CardTitle>
            <CardDescription>Manage politician data</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-center py-4">
              <Shield className="h-12 w-12 text-primary/80" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => navigate('/admin/politicians')}
            >
              Manage Politicians
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Projects</CardTitle>
            <CardDescription>Manage projects data</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-center py-4">
              <Activity className="h-12 w-12 text-primary/80" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => navigate('/admin/projects')}
            >
              Manage Projects
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
