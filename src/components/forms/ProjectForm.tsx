
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types";

// Define the form schema with Zod
const projectFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  startDate: z.date(),
  endDate: z.date().optional(),
  budget: z.number().optional(),
  status: z.enum(["planned", "in-progress", "completed", "failed", "abandoned"]),
  outcome: z.string().optional(),
  location: z.string().optional()
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: Project;
  politicianId: string;
  onSave?: (project: any) => void;
  onCancel?: () => void;
}

export function ProjectForm({ project, politicianId, onSave, onCancel }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [counties, setCounties] = useState<any[]>([]);
  const isEditing = !!project;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      startDate: project?.startDate ? new Date(project.startDate) : new Date(),
      endDate: project?.endDate ? new Date(project.endDate) : undefined,
      budget: project?.budget,
      status: (project?.status as any) || "planned",
      outcome: project?.outcome || "",
      location: project?.location || ""
    }
  });

  // Fetch counties when component mounts
  useState(() => {
    const fetchCounties = async () => {
      try {
        const { data, error } = await supabase.from('counties').select('id, name').order('name');
        if (error) throw error;
        setCounties(data || []);
      } catch (error) {
        console.error('Error fetching counties:', error);
        toast.error('Failed to load counties data');
      }
    };
    
    fetchCounties();
  });

  const status = form.watch("status");
  
  async function onSubmit(data: ProjectFormValues) {
    setLoading(true);
    try {
      // Prepare project data
      const projectData = {
        name: data.name,
        description: data.description,
        start_date: format(data.startDate, 'yyyy-MM-dd'),
        end_date: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : null,
        budget: data.budget || null,
        status: data.status,
        outcome: data.outcome || null
      };
      
      let projectId;
      let result;
      
      if (isEditing) {
        // Update existing project
        const { data: updatedProject, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project!.id)
          .select()
          .single();
        
        if (error) throw error;
        result = updatedProject;
        projectId = project!.id;
        toast.success('Project updated successfully');
      } else {
        // Insert new project
        const { data: newProject, error } = await supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single();
        
        if (error) throw error;
        result = newProject;
        projectId = newProject.id;
        
        // Link project to politician
        const { error: linkError } = await supabase
          .from('project_politicians')
          .insert({
            project_id: projectId,
            politician_id: politicianId
          });
        
        if (linkError) throw linkError;
        toast.success('Project created successfully');
      }
      
      // Handle location if provided
      if (data.location) {
        // Check if location already exists for this project
        const { data: existingLocation } = await supabase
          .from('project_locations')
          .select('id')
          .eq('project_id', projectId)
          .single();
        
        // Find the county ID from the location name
        const countyName = data.location.split(',')[0].trim();
        const { data: countyData } = await supabase
          .from('counties')
          .select('id')
          .ilike('name', `%${countyName}%`)
          .single();
        
        if (countyData) {
          const locationData = {
            project_id: projectId,
            county_id: countyData.id
          };
          
          if (existingLocation) {
            // Update existing location
            await supabase
              .from('project_locations')
              .update(locationData)
              .eq('id', existingLocation.id);
          } else {
            // Insert new location
            await supabase
              .from('project_locations')
              .insert(locationData);
          }
        }
      }
      
      if (onSave) {
        // Set location in the result object
        result.location = data.location;
        onSave(result);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the project and its goals" 
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => 
                        (form.getValues("startDate") && date < form.getValues("startDate"))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget (KES)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g., 1000000" 
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === "" ? undefined : Number(e.target.value);
                    field.onChange(value);
                  }}
                  value={field.value === undefined ? "" : field.value}
                />
              </FormControl>
              <FormDescription>Optional: Enter the project budget in Kenya Shillings</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Nairobi County" list="counties-list" {...field} />
              </FormControl>
              <datalist id="counties-list">
                {counties.map((county) => (
                  <option key={county.id} value={county.name} />
                ))}
              </datalist>
              <FormDescription>
                Enter the location where the project is implemented
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {(status === "completed" || status === "failed" || status === "abandoned") && (
          <FormField
            control={form.control}
            name="outcome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Outcome</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the outcome or results of the project" 
                    className="min-h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Add Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
