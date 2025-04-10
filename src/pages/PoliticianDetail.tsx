
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Politician, Role, Party, Project, Scandal } from '@/types';
import { getPoliticianById } from '@/services/database';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, AlertTriangle, Calendar, Edit, Plus, Trash2, Trophy, Users } from 'lucide-react';
import { toast } from 'sonner';
import { FormDialog } from '@/pages/forms/FormDialogs';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PoliticianDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [politician, setPolitician] = useState<Politician | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const fetchPoliticianData = async () => {
    if (!id) {
      setError('Politician ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getPoliticianById(id);
      if (!data) {
        setError('Politician not found');
      } else {
        setPolitician(data);
      }
    } catch (err) {
      setError('Failed to fetch politician data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoliticianData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    
    try {
      // Delete scandals and their media links
      const { data: scandals } = await supabase
        .from('scandals')
        .select('id')
        .eq('politician_id', id);
      
      if (scandals && scandals.length > 0) {
        const scandalIds = scandals.map(s => s.id);
        await supabase
          .from('media_links')
          .delete()
          .in('scandal_id', scandalIds);
        
        await supabase
          .from('scandals')
          .delete()
          .eq('politician_id', id);
      }
      
      // Delete party affiliations
      await supabase
        .from('party_affiliations')
        .delete()
        .eq('politician_id', id);
      
      // Delete roles
      await supabase
        .from('roles')
        .delete()
        .eq('politician_id', id);
      
      // Delete project relationships
      await supabase
        .from('project_politicians')
        .delete()
        .eq('politician_id', id);
      
      // Delete popularity ratings
      await supabase
        .from('popularity_ratings')
        .delete()
        .eq('politician_id', id);
      
      // Finally delete the politician
      const { error } = await supabase
        .from('politicians')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Politician deleted successfully');
      navigate('/politicians');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete politician');
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const handleRoleUpdate = (role: Role) => {
    if (!politician) return;

    if (role.isCurrent) {
      setPolitician({
        ...politician,
        currentRole: role,
        formerRoles: politician.formerRoles.filter(r => r.id !== role.id)
      });
    } else {
      // If it's a new role
      if (!politician.formerRoles.find(r => r.id === role.id)) {
        setPolitician({
          ...politician,
          formerRoles: [...politician.formerRoles, role]
        });
      } else {
        // If it's an update to an existing role
        setPolitician({
          ...politician,
          formerRoles: politician.formerRoles.map(r => 
            r.id === role.id ? role : r
          )
        });
      }
    }
    toast.success('Role updated successfully');
  };

  const handleRoleDelete = async (roleId: string) => {
    if (!politician || !id) return;
    
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
      
      // Update the UI
      setPolitician({
        ...politician,
        formerRoles: politician.formerRoles.filter(r => r.id !== roleId)
      });
      
      toast.success('Role deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete role');
    }
  };

  const handlePartyUpdate = (partyData: any) => {
    if (!politician) return;
    
    // Convert from database format to application format
    const party: Party = {
      id: partyData.id,
      name: partyData.parties.name,
      joinDate: partyData.join_date,
      leaveDate: partyData.leave_date,
      isCurrent: partyData.is_current,
      position: partyData.position
    };
    
    // If it's a new party
    if (!politician.parties.find(p => p.id === party.id)) {
      setPolitician({
        ...politician,
        parties: [...politician.parties, party]
      });
    } else {
      // If it's an update to an existing party
      setPolitician({
        ...politician,
        parties: politician.parties.map(p => 
          p.id === party.id ? party : p
        )
      });
    }
    
    toast.success('Party affiliation updated successfully');
  };

  const handlePartyDelete = async (partyId: string) => {
    if (!politician || !id) return;
    
    try {
      const { error } = await supabase
        .from('party_affiliations')
        .delete()
        .eq('id', partyId);
      
      if (error) throw error;
      
      // Update the UI
      setPolitician({
        ...politician,
        parties: politician.parties.filter(p => p.id !== partyId)
      });
      
      toast.success('Party affiliation deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete party affiliation');
    }
  };

  const handleProjectUpdate = (projectData: any) => {
    if (!politician) return;
    
    // Convert from database format to application format if needed
    const project: Project = {
      id: projectData.id,
      name: projectData.name,
      description: projectData.description,
      startDate: projectData.start_date,
      endDate: projectData.end_date,
      budget: projectData.budget,
      status: projectData.status as any,
      outcome: projectData.outcome,
      location: projectData.location
    };
    
    // If it's a new project
    if (!politician.projects.find(p => p.id === project.id)) {
      setPolitician({
        ...politician,
        projects: [...politician.projects, project]
      });
    } else {
      // If it's an update to an existing project
      setPolitician({
        ...politician,
        projects: politician.projects.map(p => 
          p.id === project.id ? project : p
        )
      });
    }
    
    toast.success('Project updated successfully');
  };

  const handleProjectDelete = async (projectId: string) => {
    if (!politician || !id) return;
    
    try {
      // First delete the relationship
      await supabase
        .from('project_politicians')
        .delete()
        .eq('project_id', projectId)
        .eq('politician_id', id);
      
      // Then delete project locations
      await supabase
        .from('project_locations')
        .delete()
        .eq('project_id', projectId);
      
      // Finally delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      // Update the UI
      setPolitician({
        ...politician,
        projects: politician.projects.filter(p => p.id !== projectId)
      });
      
      toast.success('Project deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete project');
    }
  };

  const handleScandalUpdate = (scandalData: any) => {
    if (!politician) return;
    
    // Convert from database format to application format if needed
    const scandal: Scandal = {
      id: scandalData.id,
      title: scandalData.title,
      description: scandalData.description,
      date: scandalData.date,
      resolution: scandalData.resolution,
      impact: scandalData.impact,
      mediaLinks: scandalData.mediaLinks
    };
    
    // If it's a new scandal
    if (!politician.scandals.find(s => s.id === scandal.id)) {
      setPolitician({
        ...politician,
        scandals: [...politician.scandals, scandal]
      });
    } else {
      // If it's an update to an existing scandal
      setPolitician({
        ...politician,
        scandals: politician.scandals.map(s => 
          s.id === scandal.id ? scandal : s
        )
      });
    }
    
    toast.success('Scandal updated successfully');
  };

  const handleScandalDelete = async (scandalId: string) => {
    if (!politician) return;
    
    try {
      // First delete media links
      await supabase
        .from('media_links')
        .delete()
        .eq('scandal_id', scandalId);
      
      // Then delete the scandal
      const { error } = await supabase
        .from('scandals')
        .delete()
        .eq('id', scandalId);
      
      if (error) throw error;
      
      // Update the UI
      setPolitician({
        ...politician,
        scandals: politician.scandals.filter(s => s.id !== scandalId)
      });
      
      toast.success('Scandal deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete scandal');
    }
  };

  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading politician data...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (error || !politician) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error || 'Unknown error'}</p>
          <Link to="/politicians" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-md">
            Back to Politicians
          </Link>
        </div>
      </div>
    );
  }

  // Format popularity data for chart
  const popularityData = politician.popularityHistory.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    }),
    popularity: point.rating
  }));

  const currentParty = politician.parties.find(p => p.isCurrent);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/politicians" className="text-muted-foreground hover:text-foreground">
              Politicians
            </Link>
            <span className="text-muted-foreground">→</span>
            <span>{politician.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{politician.name}</h1>
          <p className="text-xl text-muted-foreground">
            {politician.currentRole.title}, {politician.currentRole.organization}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/politicians/edit/${politician.id}`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAlert(true)}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square relative bg-muted/30 rounded-md flex items-center justify-center overflow-hidden">
                {politician.image ? (
                  <img 
                    src={politician.image} 
                    alt={politician.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                ) : (
                  <Users className="h-20 w-20 text-muted" />
                )}
              </div>
              
              {politician.bio && (
                <div>
                  <h3 className="font-medium mb-1">Biography</h3>
                  <p className="text-sm text-muted-foreground">{politician.bio}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                {politician.dateOfBirth && (
                  <div>
                    <h3 className="font-medium text-sm">Birth Date</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(politician.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {politician.county && (
                  <div>
                    <h3 className="font-medium text-sm">County</h3>
                    <p className="text-sm text-muted-foreground">{politician.county}</p>
                  </div>
                )}
                
                {politician.constituency && (
                  <div>
                    <h3 className="font-medium text-sm">Constituency</h3>
                    <p className="text-sm text-muted-foreground">{politician.constituency}</p>
                  </div>
                )}
                
                {politician.ward && (
                  <div>
                    <h3 className="font-medium text-sm">Ward</h3>
                    <p className="text-sm text-muted-foreground">{politician.ward}</p>
                  </div>
                )}
              </div>
              
              {politician.education && politician.education.length > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Education</h3>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    {politician.education.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentParty && (
                <div>
                  <h3 className="font-medium mb-1">Current Party</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-primary border-primary">
                      {currentParty.name}
                    </Badge>
                    {currentParty.position && (
                      <span className="text-sm text-muted-foreground">{currentParty.position}</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Popularity Trend</CardTitle>
              <CardDescription>Historical popularity ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={popularityData}
                    margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="popularity" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="roles" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="parties">Parties</TabsTrigger>
              <TabsTrigger value="scandals">Scandals</TabsTrigger>
            </TabsList>
            
            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Current Role</h2>
                <FormDialog 
                  formType="role" 
                  politicianId={politician.id}
                  entity={politician.currentRole}
                  isEditing={true}
                  onSave={handleRoleUpdate}
                  buttonText="Edit Current Role"
                />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{politician.currentRole.title}</CardTitle>
                  <CardDescription>{politician.currentRole.organization}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Since {new Date(politician.currentRole.startDate).toLocaleDateString()}</span>
                  </div>
                  {politician.currentRole.description && (
                    <p className="text-sm text-muted-foreground">{politician.currentRole.description}</p>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between mt-6">
                <h2 className="text-xl font-semibold">Former Roles</h2>
                <FormDialog 
                  formType="role" 
                  politicianId={politician.id}
                  onSave={handleRoleUpdate}
                />
              </div>
              
              {politician.formerRoles.length > 0 ? (
                <div className="space-y-3">
                  {politician.formerRoles.map(role => (
                    <Card key={role.id}>
                      <CardHeader className="pb-2 flex flex-row items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{role.title}</CardTitle>
                          <CardDescription>{role.organization}</CardDescription>
                        </div>
                        <div className="flex">
                          <FormDialog 
                            formType="role" 
                            politicianId={politician.id}
                            entity={role}
                            isEditing={true}
                            onSave={handleRoleUpdate}
                            buttonText="Edit"
                            buttonVariant="ghost"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRoleDelete(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(role.startDate).toLocaleDateString()} - 
                            {role.endDate ? new Date(role.endDate).toLocaleDateString() : 'Present'}
                          </span>
                        </div>
                        {role.description && (
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No former roles recorded</p>
                </div>
              )}
            </TabsContent>
            
            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Projects</h2>
                <FormDialog 
                  formType="project" 
                  politicianId={politician.id}
                  onSave={handleProjectUpdate}
                />
              </div>
              
              {politician.projects.length > 0 ? (
                <div className="space-y-4">
                  {politician.projects.map(project => (
                    <Card key={project.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            <Badge 
                              className={
                                project.status === 'completed' ? 'bg-green-500' : 
                                project.status === 'in-progress' ? 'bg-blue-500' : 
                                project.status === 'planned' ? 'bg-amber-500' :
                                'bg-red-500'
                              }
                            >
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex">
                            <FormDialog 
                              formType="project" 
                              politicianId={politician.id}
                              entity={project}
                              isEditing={true}
                              onSave={handleProjectUpdate}
                              buttonText="Edit"
                              buttonVariant="ghost"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleProjectDelete(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {project.location && (
                          <CardDescription>Location: {project.location}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">{project.description}</p>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(project.startDate).toLocaleDateString()} - 
                              {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Present'}
                            </span>
                          </div>
                          
                          {project.budget && (
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-muted-foreground" />
                              <span>Budget: KES {project.budget.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        
                        {project.outcome && (
                          <div className="mt-2">
                            <h4 className="font-medium text-sm">Outcome</h4>
                            <p className="text-sm text-muted-foreground">{project.outcome}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No projects recorded</p>
                </div>
              )}
            </TabsContent>
            
            {/* Parties Tab */}
            <TabsContent value="parties" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Political Parties</h2>
                <FormDialog 
                  formType="party" 
                  politicianId={politician.id}
                  onSave={handlePartyUpdate}
                />
              </div>
              
              {politician.parties.length > 0 ? (
                <div className="space-y-3">
                  {politician.parties.map(party => (
                    <Card key={party.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{party.name}</CardTitle>
                            {party.isCurrent && (
                              <Badge>Current</Badge>
                            )}
                          </div>
                          <div className="flex">
                            <FormDialog 
                              formType="party" 
                              politicianId={politician.id}
                              entity={party}
                              isEditing={true}
                              onSave={handlePartyUpdate}
                              buttonText="Edit"
                              buttonVariant="ghost"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => handlePartyDelete(party.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {party.position && (
                          <CardDescription>Position: {party.position}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(party.joinDate).toLocaleDateString()} - 
                            {party.leaveDate ? new Date(party.leaveDate).toLocaleDateString() : 'Present'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No party affiliations recorded</p>
                </div>
              )}
            </TabsContent>
            
            {/* Scandals Tab */}
            <TabsContent value="scandals" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Scandals</h2>
                <FormDialog 
                  formType="scandal" 
                  politicianId={politician.id}
                  onSave={handleScandalUpdate}
                />
              </div>
              
              {politician.scandals.length > 0 ? (
                <div className="space-y-4">
                  {politician.scandals.map(scandal => (
                    <Card key={scandal.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <CardTitle className="text-base">{scandal.title}</CardTitle>
                          </div>
                          <div className="flex">
                            <FormDialog 
                              formType="scandal" 
                              politicianId={politician.id}
                              entity={scandal}
                              isEditing={true}
                              onSave={handleScandalUpdate}
                              buttonText="Edit"
                              buttonVariant="ghost"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleScandalDelete(scandal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          {new Date(scandal.date).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">{scandal.description}</p>
                        
                        {scandal.resolution && (
                          <div>
                            <h4 className="font-medium text-sm">Resolution</h4>
                            <p className="text-sm text-muted-foreground">{scandal.resolution}</p>
                          </div>
                        )}
                        
                        {scandal.impact && (
                          <div>
                            <h4 className="font-medium text-sm">Impact</h4>
                            <p className="text-sm text-muted-foreground">{scandal.impact}</p>
                          </div>
                        )}
                        
                        {scandal.mediaLinks && scandal.mediaLinks.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm">Media Links</h4>
                            <ul className="text-sm text-primary space-y-1">
                              {scandal.mediaLinks.map((link, index) => (
                                <li key={index}>
                                  <a href={link} target="_blank" rel="noopener noreferrer" className="underline">
                                    {link.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0]}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No scandals recorded</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this politician?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the politician
              and all related data including roles, party affiliations, projects, and scandals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
