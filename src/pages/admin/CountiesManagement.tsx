
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function CountiesManagement() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isCountyDialogOpen, setIsCountyDialogOpen] = useState(false);
  const [editingCounty, setEditingCounty] = useState<any>(null);
  const itemsPerPage = 10;
  
  // County form schema
  const countyFormSchema = z.object({
    name: z.string().min(2, { message: "County name is required and must be at least 2 characters" })
  });

  const countyForm = useForm<z.infer<typeof countyFormSchema>>({
    resolver: zodResolver(countyFormSchema),
    defaultValues: {
      name: ''
    }
  });

  // Get counties with pagination
  const { data: countiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-counties', page],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('counties')
        .select('*', { count: 'exact' })
        .order('name')
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
      
      if (error) throw error;
      return { counties: data, totalCount: count || 0 };
    }
  });

  // Get subcounties with their counties
  const { data: subCountiesData, refetch: refetchSubCounties } = useQuery({
    queryKey: ['admin-subcounties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_counties')
        .select('id, name, county_id, counties(id, name)')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Handle county form submit
  const onSubmitCounty = async (values: z.infer<typeof countyFormSchema>) => {
    setLoading(true);
    try {
      if (editingCounty) {
        // Update existing county
        const { error } = await supabase
          .from('counties')
          .update({ name: values.name })
          .eq('id', editingCounty.id);

        if (error) throw error;
        toast.success(`${values.name} county updated successfully`);
      } else {
        // Create new county
        const { error } = await supabase
          .from('counties')
          .insert({ name: values.name });

        if (error) throw error;
        toast.success(`${values.name} county created successfully`);
      }
      
      setIsCountyDialogOpen(false);
      countyForm.reset();
      refetch();
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle county delete
  const handleDeleteCounty = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} county?`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('counties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`${name} county has been deleted`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit county
  const handleEditCounty = (county: any) => {
    setEditingCounty(county);
    countyForm.setValue('name', county.name);
    setIsCountyDialogOpen(true);
  };

  // Reset form when dialog opens/closes
  const handleDialogChange = (open: boolean) => {
    setIsCountyDialogOpen(open);
    if (!open) {
      setEditingCounty(null);
      countyForm.reset();
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil((countiesData?.totalCount || 0) / itemsPerPage);

  // Group subcounties by county for easier display
  const subcountiesByCounty: Record<string, any[]> = {};
  if (subCountiesData) {
    subCountiesData.forEach(subCounty => {
      if (subCounty.counties) {
        const countyId = subCounty.counties.id;
        if (!subcountiesByCounty[countyId]) {
          subcountiesByCounty[countyId] = [];
        }
        subcountiesByCounty[countyId].push(subCounty);
      }
    });
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Counties Management</h1>
        <Dialog open={isCountyDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New County
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCounty ? 'Edit County' : 'Add New County'}</DialogTitle>
            </DialogHeader>
            <Form {...countyForm}>
              <form onSubmit={countyForm.handleSubmit(onSubmitCounty)} className="space-y-6">
                <FormField
                  control={countyForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>County Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter county name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {editingCounty ? 'Update County' : 'Add County'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center p-8">Loading counties...</div>
      ) : error ? (
        <div className="p-8 text-center text-destructive">Error loading counties: {(error as Error).message}</div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>County Name</TableHead>
                  <TableHead className="w-[150px]">Sub-Counties</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countiesData?.counties.map((county: any) => (
                  <TableRow key={county.id}>
                    <TableCell className="font-medium">{county.name}</TableCell>
                    <TableCell>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="subcounties">
                          <AccordionTrigger className="py-1">
                            {subcountiesByCounty[county.id]?.length || 0} Sub-Counties
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-1 text-sm">
                              {subcountiesByCounty[county.id]?.length ? (
                                subcountiesByCounty[county.id].map(subcounty => (
                                  <li key={subcounty.id}>{subcounty.name}</li>
                                ))
                              ) : (
                                <li className="text-muted-foreground">No sub-counties</li>
                              )}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCounty(county)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDeleteCounty(county.id, county.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!countiesData?.counties.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No counties found
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
