
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PoliticianForm } from '@/components/forms/PoliticianForm';

export default function PoliticianCreate() {
  const [saving, setSaving] = useState(false);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/politicians" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Politicians
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Politician</h1>
          <p className="text-muted-foreground">
            Add a new politician to the database
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <PoliticianForm />
      </div>
    </div>
  );
}
