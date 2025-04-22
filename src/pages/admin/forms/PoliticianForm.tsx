
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PoliticianForm } from '@/components/forms/PoliticianForm';
import { Politician } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function AdminPoliticianForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [politician, setPolitician] = useState<Politician | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!id;

  useEffect(() => {
    if (!id) return;
    
    const fetchPolitician = async () => {
      try {
        const { data, error } = await supabase
          .from('politicians')
          .select(`
            id, name, date_of_birth, bio, education, image, 
            county_id, constituency, ward, counties(name),
            current_role_id, roles!roles_politician_id_fkey(id, title, organization, start_date, end_date, is_current, description)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          setError('Politician not found');
          return;
        }
        
        // Format the data to match the Politician type
        const politicianData = {
          id: data.id,
          name: data.name,
          dateOfBirth: data.date_of_birth,
          bio: data.bio || '',
          education: data.education || [],
          image: data.image || '',
          county: data.counties?.name || '',
          constituency: data.constituency || '',
          ward: data.ward || '',
          currentRole: {
            id: data.current_role_id,
            title: data.roles?.[0]?.title || '',
            organization: data.roles?.[0]?.organization || '',
            startDate: data.roles?.[0]?.start_date || new Date().toISOString(),
            isCurrent: data.roles?.[0]?.is_current || true,
            description: data.roles?.[0]?.description || ''
          },
          // These are required by the type but not used in the form
          formerRoles: [],
          parties: [],
          projects: [],
          scandals: [],
          popularityHistory: []
        };
        
        setPolitician(politicianData as Politician);
      } catch (err) {
        console.error('Error fetching politician:', err);
        setError('Failed to load politician data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPolitician();
  }, [id]);
  
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

  if (error && isEditing) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Link to="/admin/politicians" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-md">
            Back to Politicians
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/politicians" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Politicians
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? `Edit ${politician?.name}` : "Create New Politician"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update politician information" : "Add a new politician to the database"}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <PoliticianForm politician={politician} isEditing={isEditing} />
      </div>
    </div>
  );
}
