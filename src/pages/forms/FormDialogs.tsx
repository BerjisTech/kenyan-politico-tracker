
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RoleForm } from '@/components/forms/RoleForm';
import { PartyForm } from '@/components/forms/PartyForm';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { ScandalForm } from '@/components/forms/ScandalForm';

interface FormDialogProps {
  formType: 'role' | 'party' | 'project' | 'scandal';
  politicianId: string;
  onSave?: (data: any) => void;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  entity?: any;
  isEditing?: boolean;
}

export function FormDialog({
  formType,
  politicianId,
  onSave,
  buttonText,
  buttonVariant = 'outline',
  entity,
  isEditing = false
}: FormDialogProps) {
  const [open, setOpen] = useState(false);

  const getTitleText = () => {
    const action = isEditing ? 'Edit' : 'Add New';
    switch (formType) {
      case 'role':
        return `${action} Role`;
      case 'party':
        return `${action} Party Affiliation`;
      case 'project':
        return `${action} Project`;
      case 'scandal':
        return `${action} Scandal`;
      default:
        return 'Form';
    }
  };

  const getDescriptionText = () => {
    const action = isEditing ? 'Edit' : 'Add';
    switch (formType) {
      case 'role':
        return `${action} a political role or position`;
      case 'party':
        return `${action} a political party affiliation`;
      case 'project':
        return `${action} a project implemented or initiated`;
      case 'scandal':
        return `${action} a scandal or controversy`;
      default:
        return '';
    }
  };

  const getDefaultButtonText = () => {
    const action = isEditing ? 'Edit' : 'Add';
    switch (formType) {
      case 'role':
        return `${action} Role`;
      case 'party':
        return `${action} Party`;
      case 'project':
        return `${action} Project`;
      case 'scandal':
        return `${action} Scandal`;
      default:
        return 'Open Form';
    }
  };

  const handleSave = (data: any) => {
    if (onSave) {
      onSave(data);
    }
    setOpen(false);
  };

  const renderForm = () => {
    switch (formType) {
      case 'role':
        return (
          <RoleForm 
            politicianId={politicianId} 
            role={entity} 
            onSave={handleSave} 
            onCancel={() => setOpen(false)}
          />
        );
      case 'party':
        return (
          <PartyForm 
            politicianId={politicianId} 
            party={entity} 
            onSave={handleSave} 
            onCancel={() => setOpen(false)}
          />
        );
      case 'project':
        return (
          <ProjectForm 
            politicianId={politicianId} 
            project={entity} 
            onSave={handleSave} 
            onCancel={() => setOpen(false)}
          />
        );
      case 'scandal':
        return (
          <ScandalForm 
            politicianId={politicianId} 
            scandal={entity} 
            onSave={handleSave} 
            onCancel={() => setOpen(false)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className="gap-1">
          {!isEditing && <Plus className="h-4 w-4" />}
          {buttonText || getDefaultButtonText()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitleText()}</DialogTitle>
          <DialogDescription>{getDescriptionText()}</DialogDescription>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
