import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Info, Trash2, PlusCircle } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const politicianFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  dateOfBirth: z.date().optional(),
  bio: z.string().optional(),
  education: z.array(z.string()).optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.string().length(0)),
  county: z.string().optional(),
  constituency: z.string().optional(),
  ward: z.string().optional(),
  currentRole: z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    organization: z.string().min(2, "Organization must be at least 2 characters."),
    startDate: z.date(),
    description: z.string().optional()
  })
});

type PoliticianFormValues = z.infer<typeof politicianFormSchema>;

interface PoliticianFormProps {
  politician?: any;
  isEditing?: boolean;
}

export function PoliticianForm({ politician, isEditing = false }: PoliticianFormProps) {
  const [loading, setLoading] = useState(false);
  const [educationFields, setEducationFields] = useState<string[]>(
    politician?.education || [""]
  );
  const [counties, setCounties] = useState<any[]>([]);
  const navigate = useNavigate();

  const form = useForm<PoliticianFormValues>({
    resolver: zodResolver(politicianFormSchema),
    defaultValues: {
      name: politician?.name || "",
      dateOfBirth: politician?.dateOfBirth ? new Date(politician.dateOfBirth) : undefined,
      bio: politician?.bio || "",
      education: politician?.education || [],
      image: politician?.image || "",
      county: politician?.county || "",
      constituency: politician?.constituency || "",
      ward: politician?.ward || "",
      currentRole: {
        title: politician?.currentRole?.title || "",
        organization: politician?.currentRole?.organization || "",
        startDate: politician?.currentRole?.startDate ? new Date(politician.currentRole.startDate) : new Date(),
        description: politician?.currentRole?.description || ""
      }
    }
  });

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

  const addEducationField = () => {
    setEducationFields([...educationFields, ""]);
  };

  const removeEducationField = (index: number) => {
    const updatedFields = [...educationFields];
    updatedFields.splice(index, 1);
    setEducationFields(updatedFields);
  };

  const handleEducationChange = (index: number, value: string) => {
    const updatedFields = [...educationFields];
    updatedFields[index] = value;
    setEducationFields(updatedFields);
    form.setValue('education', updatedFields.filter(field => field.trim() !== ''));
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (date: Date | undefined) => void, currentValue?: Date) => {
    const dateString = e.target.value;
    
    if (!dateString) {
      onChange(undefined);
      return;
    }
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      onChange(date);
    }
  };

  async function onSubmit(data: PoliticianFormValues) {
    setLoading(true);
    try {
      const filteredEducation = educationFields.filter(field => field.trim() !== '');
      data.education = filteredEducation;

      let countyId = null;
      if (data.county) {
        const { data: countyData } = await supabase
          .from('counties')
          .select('id')
          .eq('name', data.county)
          .single();
        
        if (countyData) {
          countyId = countyData.id;
        }
      }
      
      let politicianId;
      
      if (isEditing) {
        const { error } = await supabase
          .from('politicians')
          .update({
            name: data.name,
            date_of_birth: data.dateOfBirth ? format(data.dateOfBirth, 'yyyy-MM-dd') : null,
            bio: data.bio,
            education: data.education,
            image: data.image,
            county_id: countyId,
            constituency: data.constituency,
            ward: data.ward
          })
          .eq('id', politician.id);
        
        if (error) throw error;
        politicianId = politician.id;
        
        const { error: roleError } = await supabase
          .from('roles')
          .update({
            title: data.currentRole.title,
            organization: data.currentRole.organization,
            start_date: format(data.currentRole.startDate, 'yyyy-MM-dd'),
            description: data.currentRole.description
          })
          .eq('id', politician.currentRole.id);
        
        if (roleError) throw roleError;
        
        toast.success('Politician updated successfully');
      } else {
        const { data: newPolitician, error } = await supabase
          .from('politicians')
          .insert({
            name: data.name,
            date_of_birth: data.dateOfBirth ? format(data.dateOfBirth, 'yyyy-MM-dd') : null,
            bio: data.bio,
            education: data.education,
            image: data.image,
            county_id: countyId,
            constituency: data.constituency,
            ward: data.ward
          })
          .select('id')
          .single();
        
        if (error) throw error;
        politicianId = newPolitician.id;
        
        const { data: currentRole, error: roleError } = await supabase
          .from('roles')
          .insert({
            title: data.currentRole.title,
            organization: data.currentRole.organization,
            politician_id: politicianId,
            start_date: format(data.currentRole.startDate, 'yyyy-MM-dd'),
            is_current: true,
            description: data.currentRole.description
          })
          .select('id')
          .single();
        
        if (roleError) throw roleError;
        
        const { error: updateError } = await supabase
          .from('politicians')
          .update({ current_role_id: currentRole.id })
          .eq('id', politicianId);
        
        if (updateError) throw updateError;
        
        toast.success('Politician created successfully');
      }
      
      navigate(`/politicians/${politicianId}`);
    } catch (error) {
      console.error('Error saving politician:', error);
      toast.error('Failed to save politician');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => handleDateInputChange(e, field.onChange, field.value)}
                    className="w-full"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-10 p-0 flex-shrink-0",
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        fromYear={1930}
                        toYear={new Date().getFullYear()}
                        captionLayout="dropdown-buttons"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biography</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description of the politician's background" 
                    className="min-h-32"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  Enter a URL to the politician's profile image
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Education</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={addEducationField}
              >
                <PlusCircle className="h-4 w-4" />
                Add
              </Button>
            </div>
            
            {educationFields.map((field, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={field}
                  onChange={(e) => handleEducationChange(index, e.target.value)}
                  placeholder="Education background"
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEducationField(index)}
                  disabled={educationFields.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Location</h2>
          
          <FormField
            control={form.control}
            name="county"
            render={({ field }) => (
              <FormItem>
                <FormLabel>County</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a county" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {counties.map((county) => (
                      <SelectItem key={county.id} value={county.name}>
                        {county.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="constituency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Constituency</FormLabel>
                <FormControl>
                  <Input placeholder="Constituency" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ward</FormLabel>
                <FormControl>
                  <Input placeholder="Ward" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Current Role</h2>
          
          <FormField
            control={form.control}
            name="currentRole.title"
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
            name="currentRole.organization"
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

          <FormField
            control={form.control}
            name="currentRole.startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => handleDateInputChange(e, field.onChange, field.value)}
                    className="w-full"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-10 p-0 flex-shrink-0",
                        )}
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        fromYear={1990}
                        toYear={new Date().getFullYear()}
                        captionLayout="dropdown-buttons"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentRole.description"
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
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/politicians')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>Saving...</>
            ) : isEditing ? (
              'Update Politician'
            ) : (
              'Create Politician'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
