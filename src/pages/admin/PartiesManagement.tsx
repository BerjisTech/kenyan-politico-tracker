
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious
} from '@/components/ui/pagination';

export default function PartiesManagement() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isPartyDialogOpen, setIsPartyDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<any>(null);
  const itemsPerPage = 10;
  
  // Party form schema
  const partyFormSchema = z.object({
    name: z.string().min(2, { message: "Party name is required and must be at least 2 characters" })
  });

  const partyForm = useForm<z.infer<typeof partyFormSchema>>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: {
      name: ''
    }
  });

  // Get parties with pagination and member counts
  const { data: partiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-parties', page],
    queryFn: async () => {
      // First get parties with pagination
      const { data: parties, error, count } = await supabase
        .from('parties')
        .select('*', { count: 'exact' })
        .order('name')
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
      
      if (error) throw error;
      
      // Then get member counts for each party
      const partiesWithCounts = await Promise.all(parties.map(async party => {
        const { count: memberCount } = await supabase
          .from('party_affiliations')
          .select('*', { count: 'exact', head: true })
          .eq('party_id', party.id)
          .eq('is_current', true);
        
        return { ...party, memberCount: memberCount || 0 };
      }));
      
      return { parties: partiesWithCounts, totalCount: count || 0 };
    }
  });

  // Handle party form submit
  const onSubmitParty = async (values: z.infer<typeof partyFormSchema>) => {
    setLoading(true);
    try {
      if (editingParty) {
        // Update existing party
        const { error } = await supabase
          .from('parties')
          .update({ name: values.name })
          .eq('id', editingParty.id);

        if (error) throw error;
        toast.success(`${values.name} party updated successfully`);
      } else {
        // Create new party
        const { error } = await supabase
          .from('parties')
          .insert({ name: values.name });

        if (error) throw error;
        toast.success(`${values.name} party created successfully`);
      }
      
      setIsPartyDialogOpen(false);
      partyForm.reset();
      refetch();
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle party delete
  const handleDeleteParty = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} party?`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`${name} party has been deleted`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit party
  const handleEditParty = (party: any) => {
    setEditingParty(party);
    partyForm.setValue('name', party.name);
    setIsPartyDialogOpen(true);
  };

  // Reset form when dialog opens/closes
  const handleDialogChange = (open: boolean) => {
    setIsPartyDialogOpen(open);
    if (!open) {
      setEditingParty(null);
      partyForm.reset();
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil((partiesData?.totalCount || 0) / itemsPerPage);
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Political Parties Management</h1>
        <Dialog open={isPartyDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Party
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingParty ? 'Edit Party' : 'Add New Party'}</DialogTitle>
            </DialogHeader>
            <Form {...partyForm}>
              <form onSubmit={partyForm.handleSubmit(onSubmitParty)} className="space-y-6">
                <FormField
                  control={partyForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Party Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter party name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {editingParty ? 'Update Party' : 'Add Party'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading parties...</div>
      ) : error ? (
        <div className="p-8 text-center text-destructive">Error loading parties: {(error as Error).message}</div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Current Members</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partiesData?.parties.map((party: any) => (
                  <TableRow key={party.id}>
                    <TableCell className="font-medium">{party.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{party.memberCount} members</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditParty(party)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDeleteParty(party.id, party.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!partiesData?.parties.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No parties found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => setPage(p)}
                      isActive={page === p}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
