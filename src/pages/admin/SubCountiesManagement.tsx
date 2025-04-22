
import { useState, useEffect } from 'react';
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

export default function SubCountiesManagement() {
  const { countyId } = useParams<{ countyId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isSubCountyDialogOpen, setIsSubCountyDialogOpen] = useState(false);
  const [editingSubCounty, setEditingSubCounty] = useState<any>(null);
  const itemsPerPage = 10;
  
  // Sub-county form schema
  const subCountyFormSchema = z.object({
    name: z.string().min(2, { message: "Sub-county name is required and must be at least 2 characters" })
  });

  const subCountyForm = useForm<z.infer<typeof subCountyFormSchema>>({
    resolver: zodResolver(subCountyFormSchema),
    defaultValues: {
      name: ''
    }
  });
  
  // Get county details
  const { data: countyData } = useQuery({
    queryKey: ['admin-county', countyId],
    queryFn: async () => {
      if (!countyId) return null;
      
      const { data, error } = await supabase
        .from('counties')
        .select('id, name')
        .eq('id', countyId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Get sub-counties with pagination
  const { data: subCountiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-subcounties-by-county', countyId, page],
    queryFn: async () => {
      if (!countyId) return { subCounties: [], totalCount: 0 };
      
      const { data, error, count } = await supabase
        .from('sub_counties')
        .select('*, wards(count)', { count: 'exact' })
        .eq('county_id', countyId)
        .order('name')
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
      
      if (error) throw error;
      
      // Format the data to include the ward count
      const subCountiesWithCounts = data.map(subCounty => ({
        ...subCounty,
        wardCount: subCounty.wards?.length || 0
      }));
      
      return { subCounties: subCountiesWithCounts, totalCount: count || 0 };
    },
    enabled: !!countyId,
  });

  // Handle sub-county form submit
  const onSubmitSubCounty = async (values: z.infer<typeof subCountyFormSchema>) => {
    if (!countyId) return;
    
    setLoading(true);
    try {
      if (editingSubCounty) {
        // Update existing sub-county
        const { error } = await supabase
          .from('sub_counties')
          .update({ name: values.name })
          .eq('id', editingSubCounty.id);

        if (error) throw error;
        toast.success(`${values.name} sub-county updated successfully`);
      } else {
        // Create new sub-county
        const { error } = await supabase
          .from('sub_counties')
          .insert({ 
            name: values.name,
            county_id: countyId
          });

        if (error) throw error;
        toast.success(`${values.name} sub-county created successfully`);
      }
      
      setIsSubCountyDialogOpen(false);
      subCountyForm.reset();
      refetch();
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle sub-county delete
  const handleDeleteSubCounty = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} sub-county?`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('sub_counties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`${name} sub-county has been deleted`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit sub-county
  const handleEditSubCounty = (subCounty: any) => {
    setEditingSubCounty(subCounty);
    subCountyForm.setValue('name', subCounty.name);
    setIsSubCountyDialogOpen(true);
  };

  // Reset form when dialog opens/closes
  const handleDialogChange = (open: boolean) => {
    setIsSubCountyDialogOpen(open);
    if (!open) {
      setEditingSubCounty(null);
      subCountyForm.reset();
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil((subCountiesData?.totalCount || 0) / itemsPerPage);
  
  if (!countyId) {
    return <div className="p-8 text-center">County ID not provided</div>;
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
            <BreadcrumbLink>
              {countyData?.name || 'Loading...'} Sub-Counties
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{countyData?.name || 'Loading...'} County</h1>
          <p className="text-muted-foreground">Manage sub-counties/constituencies</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/counties')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Counties
          </Button>
          
          <Dialog open={isSubCountyDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Sub-County
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSubCounty ? 'Edit Sub-County' : 'Add New Sub-County'}</DialogTitle>
              </DialogHeader>
              <Form {...subCountyForm}>
                <form onSubmit={subCountyForm.handleSubmit(onSubmitSubCounty)} className="space-y-6">
                  <FormField
                    control={subCountyForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-County Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter sub-county name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {editingSubCounty ? 'Update Sub-County' : 'Add Sub-County'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading sub-counties...</div>
      ) : error ? (
        <div className="p-8 text-center text-destructive">Error loading sub-counties: {(error as Error).message}</div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub-County/Constituency Name</TableHead>
                  <TableHead className="w-[200px]">Wards</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subCountiesData?.subCounties.map((subCounty: any) => (
                  <TableRow key={subCounty.id}>
                    <TableCell className="font-medium">{subCounty.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{subCounty.wardCount} Wards</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/subcounties/${subCounty.id}/wards`}>
                            <ChevronRight className="h-4 w-4" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditSubCounty(subCounty)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDeleteSubCounty(subCounty.id, subCounty.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!subCountiesData?.subCounties.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No sub-counties found for this county
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
