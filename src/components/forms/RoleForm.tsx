
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Role } from "@/types";

// Define the form schema with Zod
const roleFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  organization: z.string().min(2, "Organization must be at least 2 characters."),
  startDate: z.date(),
  endDate: z.date().optional(),
  isCurrent: z.boolean(),
  description: z.string().optional()
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  role?: Role;
  politicianId: string;
  onSave?: (role: any) => void;
  onCancel?: () => void;
}

export function RoleForm({ role, politicianId, onSave, onCancel }: RoleFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!role;

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      title: role?.title || "",
      organization: role?.organization || "",
      startDate: role?.startDate ? new Date(role.startDate) : new Date(),
      endDate: role?.endDate ? new Date(role.endDate) : undefined,
      isCurrent: role?.isCurrent || false,
      description: role?.description || ""
    }
  });

  // Update end date field when isCurrent changes
  const isCurrent = form.watch("isCurrent");
  
  async function onSubmit(data: RoleFormValues) {
    setLoading(true);
    try {
      if (data.isCurrent) {
        data.endDate = undefined;
      }
      
      const roleData = {
        title: data.title,
        organization: data.organization,
        politician_id: politicianId,
        start_date: format(data.startDate, 'yyyy-MM-dd'),
        end_date: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : null,
        is_current: data.isCurrent,
        description: data.description || null
      };
      
      let result;
      
      if (isEditing) {
        // Update existing role
        const { data: updatedRole, error } = await supabase
          .from('roles')
          .update(roleData)
          .eq('id', role!.id)
          .select()
          .single();
        
        if (error) throw error;
        result = updatedRole;
        toast.success('Role updated successfully');
      } else {
        // Insert new role
        const { data: newRole, error } = await supabase
          .from('roles')
          .insert(roleData)
          .select()
          .single();
        
        if (error) throw error;
        result = newRole;
        toast.success('Role created successfully');
      }
      
      // If this is set as current role and isCurrent is true, update the politician's current_role_id
      if (data.isCurrent) {
        const { error: updateError } = await supabase
          .from('politicians')
          .update({ current_role_id: result.id })
          .eq('id', politicianId);
        
        if (updateError) {
          console.error('Error updating politician current role:', updateError);
        }
      }
      
      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Failed to save role');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Governor, Senator, MP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <FormControl>
                <Input placeholder="e.g., National Assembly, County Government" {...field} />
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
                      disabled={(date) => date > new Date()}
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
                  <PopoverTrigger asChild disabled={isCurrent}>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          (!field.value || isCurrent) && "text-muted-foreground"
                        )}
                        disabled={isCurrent}
                      >
                        {field.value && !isCurrent ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{isCurrent ? "Current role" : "Pick a date"}</span>
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
                        date > new Date() || 
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
          name="isCurrent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Current Role</FormLabel>
                <FormDescription>
                  Check if this is the politician's current role
                </FormDescription>
              </div>
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
                  placeholder="Describe the responsibilities and achievements in this role" 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Role' : 'Add Role'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
