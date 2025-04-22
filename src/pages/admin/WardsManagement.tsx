
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function WardsManagement() {
  const { subCountyId } = useParams<{ subCountyId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isWardDialogOpen, setIsWardDialogOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<any>(null);
  const itemsPerPage = 10;
  
  // Ward form schema
  const wardFormSchema = z.object({
    name: z.string().min(2, { message: "Ward name is required and must be at least 2 characters" })
  });

  const wardForm = useForm<z.infer<typeof wardFormSchema>>({
    resolver: zodResolver(wardFormSchema),
    defaultValues: {
      name: ''
    }
  });
  
  // Get subcounty details with parent county
  const { data: breadcrumbData } = useQuery({
    queryKey: ['admin-subcounty-breadcrumb', subCountyId],
    queryFn: async () => {
      if (!subCountyId) return null;
      
      const { data, error } = await supabase
        .from('sub_counties')
        .select('id, name, county_id, counties(id, name)')
        .eq('id', subCountyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!subCountyId,
  });

  // Get wards with pagination
  const { data: wardsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-wards-by-subcounty', subCountyId, page],
    queryFn: async () => {
      if (!subCountyId) return { wards: [], totalCount: 0 };
      
      const { data, error, count } = await supabase
        .from('wards')
        .select('*', { count: 'exact' })
        .eq('sub_county_id', subCountyId)
        .order('name')
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
      
      if (error) throw error;
      return { wards: data, totalCount: count || 0 };
    },
    enabled: !!subCountyId,
  });

  // Handle ward form submit
  const onSubmitWard = async (values: z.infer<typeof wardFormSchema>) => {
    if (!subCountyId) return;
    
    setLoading(true);
    try {
      if (editingWard) {
        // Update existing ward
        const { error } = await supabase
          .from('wards')
          .update({ name: values.name })
          .eq('id', editingWard.id);

        if (error) throw error;
        toast.success(`${values.name} ward updated successfully`);
      } else {
        // Create new ward
        const { error } = await supabase
          .from('wards')
          .insert({ 
            name: values.name,
            sub_county_id: subCountyId
          });

        if (error) throw error;
        toast.success(`${values.name} ward created successfully`);
      }
      
      setIsWardDialogOpen(false);
      wardForm.reset();
      refetch();
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle ward delete
  const handleDeleteWard = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} ward?`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('wards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`${name} ward has been deleted`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit ward
  const handleEditWard = (ward: any) => {
    setEditingWard(ward);
    wardForm.setValue('name', ward.name);
    setIsWardDialogOpen(true);
  };

  // Reset form when dialog opens/closes
  const handleDialogChange = (open: boolean) => {
    setIsWardDialogOpen(open);
    if (!open) {
      setEditingWard(null);
      wardForm.reset();
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil((wardsData?.totalCount || 0) / itemsPerPage);
  
  if (!subCountyId) {
    return <div className="p-8 text-center">Sub-County ID not provided</div>;
  }
  
  return (
    <div className="container py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/counties">Counties</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/admin/counties/${breadcrumbData?.county_id}/subcounties`}>
                {breadcrumbData?.counties?.name || 'County'} Sub-Counties
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              {breadcrumbData?.name || 'Loading...'} Wards
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{breadcrumbData?.name || 'Loading...'}</h1>
          <p className="text-muted-foreground">Manage wards</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => breadcrumbData?.county_id ? 
              navigate(`/admin/counties/${breadcrumbData.county_id}/subcounties`) : 
              navigate('/admin/counties')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Sub-Counties
          </Button>
          
          <Dialog open={isWardDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Ward
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingWard ? 'Edit Ward' : 'Add New Ward'}</DialogTitle>
              </DialogHeader>
              <Form {...wardForm}>
                <form onSubmit={wardForm.handleSubmit(onSubmitWard)} className="space-y-6">
                  <FormField
                    control={wardForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ward Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter ward name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {editingWard ? 'Update Ward' : 'Add Ward'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading wards...</div>
      ) : error ? (
        <div className="p-8 text-center text-destructive">Error loading wards: {(error as Error).message}</div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ward Name</TableHead>
                  <TableHead className="w-[200px]">Locations</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wardsData?.wards.map((ward: any) => (
                  <TableRow key={ward.id}>
                    <TableCell className="font-medium">{ward.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">0 Locations</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/wards/${ward.id}/locations`}>
                            <ChevronRight className="h-4 w-4" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditWard(ward)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDeleteWard(ward.id, ward.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!wardsData?.wards.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No wards found for this sub-county
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
