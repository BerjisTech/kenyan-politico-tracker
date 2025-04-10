
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PoliticianForm } from '@/components/forms/PoliticianForm';
import { getPoliticianById } from '@/services/database';
import { Politician } from '@/types';

export default function PoliticianEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [politician, setPolitician] = useState<Politician | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Politician ID is missing');
        setLoading(false);
        return;
      }

      try {
        // Validate if the id is a proper UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          setError('Invalid politician ID format');
          setLoading(false);
          return;
        }
        
        const data = await getPoliticianById(id);
        if (!data) {
          setError('Politician not found');
        } else {
          setPolitician(data);
        }
      } catch (err) {
        setError('Failed to fetch politician data');
        console.error('Error fetching politician by id:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/politicians/${id}`} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Politician
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Edit {politician.name}</h1>
          <p className="text-muted-foreground">
            Update politician information
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <PoliticianForm politician={politician} isEditing={true} />
      </div>
    </div>
  );
}
