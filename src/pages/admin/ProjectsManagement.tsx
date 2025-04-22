
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { FormDialog } from '@/pages/forms/FormDialogs';

export default function ProjectsManagement() {
  const [loading, setLoading] = useState(false);
  
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, status, start_date, end_date')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
  
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the project "${name}"?`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      
      if (error) throw error;
      toast.success(`"${name}" has been deleted`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'abandoned': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading projects...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-destructive">Error loading projects: {(error as Error).message}</div>;
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects Management</h1>
        <FormDialog 
          formType="project" 
          politicianId=""
          buttonText="Add New Project" 
          buttonVariant="default"
          onSave={() => refetch()}
        />
      </div>
      
      <div className="bg-background border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Start Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">End Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects?.map((project: any) => (
                <tr key={project.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{project.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(project.status)}`}>
                      {project.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(project.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {project.end_date 
                      ? new Date(project.end_date).toLocaleDateString() 
                      : 'Ongoing'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/projects/${project.id}`}>View</Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={loading}
                        onClick={() => handleDelete(project.id, project.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {projects?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <h3 className="text-xl font-medium mb-2">No Projects Yet</h3>
                    <p className="text-muted-foreground mb-4">Get started by creating a new project</p>
                    <FormDialog 
                      formType="project" 
                      politicianId=""
                      buttonText="Add New Project" 
                      buttonVariant="default"
                      onSave={() => refetch()}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
