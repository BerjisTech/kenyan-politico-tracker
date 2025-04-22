
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function PoliticiansManagement() {
  const [loading, setLoading] = useState(false);
  
  // Use a more efficient query that gets all needed data in one go
  const { data: politicians, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-politicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('politicians')
        .select(`
          id, name, image, county_id, 
          counties:county_id(name)
        `)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
  
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('politicians').delete().eq('id', id);
      
      if (error) throw error;
      toast.success(`${name} has been deleted`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading politicians...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-destructive">Error loading politicians: {(error as Error).message}</div>;
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Politicians Management</h1>
        <Button asChild>
          <Link to="/admin/politicians/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Politician
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {politicians?.map((politician: any) => (
          <div key={politician.id} className="border rounded-lg overflow-hidden bg-card">
            <div className="aspect-square w-full relative">
              <img 
                src={politician.image || "/placeholder.svg"} 
                alt={politician.name}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold">{politician.name}</h2>
              <p className="text-muted-foreground">{politician.counties?.name || "No county"}</p>
              
              <div className="flex gap-2 mt-4">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to={`/politicians/${politician.id}`}>View</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to={`/admin/politicians/edit/${politician.id}`}>Edit</Link>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={loading}
                  onClick={() => handleDelete(politician.id, politician.name)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {politicians?.length === 0 && (
          <div className="col-span-full text-center p-8 border rounded-lg">
            <h3 className="text-xl font-medium mb-2">No Politicians Yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating a new politician profile</p>
            <Button asChild>
              <Link to="/admin/politicians/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Politician
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
