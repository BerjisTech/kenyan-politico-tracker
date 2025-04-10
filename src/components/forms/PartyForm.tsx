
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
import { Party } from "@/types";

// Define the form schema with Zod
const partyFormSchema = z.object({
  name: z.string().min(2, "Party name must be at least 2 characters."),
  joinDate: z.date(),
  leaveDate: z.date().optional(),
  isCurrent: z.boolean(),
  position: z.string().optional()
});

type PartyFormValues = z.infer<typeof partyFormSchema>;

interface PartyFormProps {
  party?: Party;
  politicianId: string;
  onSave?: (party: any) => void;
  onCancel?: () => void;
}

export function PartyForm({ party, politicianId, onSave, onCancel }: PartyFormProps) {
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState<any[]>([]);
  const isEditing = !!party;

  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: {
      name: party?.name || "",
      joinDate: party?.joinDate ? new Date(party.joinDate) : new Date(),
      leaveDate: party?.leaveDate ? new Date(party.leaveDate) : undefined,
      isCurrent: party?.isCurrent || false,
      position: party?.position || ""
    }
  });

  // Fetch parties when component mounts
  useState(() => {
    const fetchParties = async () => {
      try {
        const { data, error } = await supabase.from('parties').select('id, name').order('name');
        if (error) throw error;
        setParties(data || []);
      } catch (error) {
        console.error('Error fetching parties:', error);
        toast.error('Failed to load parties data');
      }
    };
    
    fetchParties();
  });

  // Update leave date field when isCurrent changes
  const isCurrent = form.watch("isCurrent");
  
  async function onSubmit(data: PartyFormValues) {
    setLoading(true);
    try {
      if (data.isCurrent) {
        data.leaveDate = undefined;
      }
      
      // First, find or create the party
      let partyId;
      const { data: existingParty, error: partyError } = await supabase
        .from('parties')
        .select('id')
        .ilike('name', data.name)
        .single();
      
      if (partyError && partyError.code !== 'PGRST116') {
        // An error other than "no rows returned"
        throw partyError;
      }
      
      if (existingParty) {
        partyId = existingParty.id;
      } else {
        // Create new party
        const { data: newParty, error } = await supabase
          .from('parties')
          .insert({ name: data.name })
          .select('id')
          .single();
        
        if (error) throw error;
        partyId = newParty.id;
      }
      
      // Prepare affiliation data
      const affiliationData = {
        party_id: partyId,
        politician_id: politicianId,
        join_date: format(data.joinDate, 'yyyy-MM-dd'),
        leave_date: data.leaveDate ? format(data.leaveDate, 'yyyy-MM-dd') : null,
        is_current: data.isCurrent,
        position: data.position || null
      };
      
      let result;
      
      if (isEditing) {
        // Update existing affiliation
        const { data: updatedAffiliation, error } = await supabase
          .from('party_affiliations')
          .update(affiliationData)
          .eq('id', party!.id)
          .select(`
            id,
            join_date,
            leave_date,
            is_current,
            position,
            parties:party_id (id, name)
          `)
          .single();
        
        if (error) throw error;
        result = updatedAffiliation;
        toast.success('Party affiliation updated successfully');
      } else {
        // Insert new affiliation
        const { data: newAffiliation, error } = await supabase
          .from('party_affiliations')
          .insert(affiliationData)
          .select(`
            id,
            join_date,
            leave_date,
            is_current,
            position,
            parties:party_id (id, name)
          `)
          .single();
        
        if (error) throw error;
        result = newAffiliation;
        toast.success('Party affiliation created successfully');
      }
      
      // If this is current party and there are other current parties, update them
      if (data.isCurrent) {
        await supabase
          .from('party_affiliations')
          .update({ is_current: false })
          .eq('politician_id', politicianId)
          .neq('id', result.id);
      }
      
      if (onSave) {
        onSave(result);
      }
    } catch (error) {
      console.error('Error saving party affiliation:', error);
      toast.error('Failed to save party affiliation');
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
              <FormLabel>Party Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jubilee Party, ODM" list="parties-list" {...field} />
              </FormControl>
              <datalist id="parties-list">
                {parties.map((party) => (
                  <option key={party.id} value={party.name} />
                ))}
              </datalist>
              <FormDescription>
                Enter the party name. You can type a new party or select from existing ones.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position in Party</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chairman, Secretary General, Member" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="joinDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Join Date</FormLabel>
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
            name="leaveDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Leave Date</FormLabel>
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
                          <span>{isCurrent ? "Current party" : "Pick a date"}</span>
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
                        (form.getValues("joinDate") && date < form.getValues("joinDate"))
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
                <FormLabel>Current Party</FormLabel>
                <FormDescription>
                  Check if this is the politician's current party
                </FormDescription>
              </div>
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
            {loading ? 'Saving...' : isEditing ? 'Update Party' : 'Add Party'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
