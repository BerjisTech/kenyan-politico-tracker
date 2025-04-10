
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Scandal } from "@/types";

// Define the form schema with Zod
const scandalFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  date: z.date(),
  resolution: z.string().optional(),
  impact: z.string().optional(),
  mediaLinks: z.array(z.string().url("Must be a valid URL")).optional()
});

type ScandalFormValues = z.infer<typeof scandalFormSchema>;

interface ScandalFormProps {
  scandal?: Scandal;
  politicianId: string;
  onSave?: (scandal: any) => void;
  onCancel?: () => void;
}

export function ScandalForm({ scandal, politicianId, onSave, onCancel }: ScandalFormProps) {
  const [loading, setLoading] = useState(false);
  const [mediaLinkFields, setMediaLinkFields] = useState<string[]>(
    scandal?.mediaLinks || [""]
  );
  const isEditing = !!scandal;

  const form = useForm<ScandalFormValues>({
    resolver: zodResolver(scandalFormSchema),
    defaultValues: {
      title: scandal?.title || "",
      description: scandal?.description || "",
      date: scandal?.date ? new Date(scandal.date) : new Date(),
      resolution: scandal?.resolution || "",
      impact: scandal?.impact || "",
      mediaLinks: scandal?.mediaLinks || []
    }
  });

  const addMediaLinkField = () => {
    setMediaLinkFields([...mediaLinkFields, ""]);
  };

  const removeMediaLinkField = (index: number) => {
    const updatedFields = [...mediaLinkFields];
    updatedFields.splice(index, 1);
    setMediaLinkFields(updatedFields);
  };

  const handleMediaLinkChange = (index: number, value: string) => {
    const updatedFields = [...mediaLinkFields];
    updatedFields[index] = value;
    setMediaLinkFields(updatedFields);
    form.setValue('mediaLinks', updatedFields.filter(field => field.trim() !== ''));
  };
  
  async function onSubmit(data: ScandalFormValues) {
    setLoading(true);
    try {
      // Filter out empty media link fields
      const filteredMediaLinks = mediaLinkFields.filter(field => field.trim() !== '');
      data.mediaLinks = filteredMediaLinks;
      
      // Prepare scandal data
      const scandalData = {
        title: data.title,
        description: data.description,
        date: format(data.date, 'yyyy-MM-dd'),
        resolution: data.resolution || null,
        impact: data.impact || null,
        politician_id: politicianId
      };
      
      let scandalId;
      
      if (isEditing) {
        // Update existing scandal
        const { error } = await supabase
          .from('scandals')
          .update(scandalData)
          .eq('id', scandal!.id);
        
        if (error) throw error;
        scandalId = scandal!.id;
        
        // Delete existing media links
        const { error: deleteError } = await supabase
          .from('media_links')
          .delete()
          .eq('scandal_id', scandalId);
        
        if (deleteError) throw deleteError;
        
        toast.success('Scandal updated successfully');
      } else {
        // Insert new scandal
        const { data: newScandal, error } = await supabase
          .from('scandals')
          .insert(scandalData)
          .select()
          .single();
        
        if (error) throw error;
        scandalId = newScandal.id;
        toast.success('Scandal created successfully');
      }
      
      // Add media links if any
      if (data.mediaLinks && data.mediaLinks.length > 0) {
        const mediaLinksData = data.mediaLinks.map(url => ({
          url,
          scandal_id: scandalId
        }));
        
        const { error: linksError } = await supabase
          .from('media_links')
          .insert(mediaLinksData);
        
        if (linksError) throw linksError;
      }
      
      if (onSave) {
        // Get the complete scandal to return
        const { data: updatedScandal } = await supabase
          .from('scandals')
          .select()
          .eq('id', scandalId)
          .single();
        
        const { data: mediaLinks } = await supabase
          .from('media_links')
          .select('url')
          .eq('scandal_id', scandalId);
        
        const fullScandal = {
          ...updatedScandal,
          mediaLinks: mediaLinks ? mediaLinks.map(link => link.url) : []
        };
        
        onSave(fullScandal);
      }
    } catch (error) {
      console.error('Error saving scandal:', error);
      toast.error('Failed to save scandal');
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
                <Input placeholder="Enter a title for the scandal" {...field} />
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
                  placeholder="Describe what happened in detail" 
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
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
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
          name="resolution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resolution</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="How was this scandal resolved? (if applicable)" 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="impact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What was the impact of this scandal?" 
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Media Links</FormLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={addMediaLinkField}
            >
              <PlusCircle className="h-4 w-4" />
              Add Link
            </Button>
          </div>
          
          {mediaLinkFields.map((field, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={field}
                onChange={(e) => handleMediaLinkChange(index, e.target.value)}
                placeholder="https://example.com/news-article"
                className="flex-grow"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMediaLinkField(index)}
                disabled={mediaLinkFields.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <FormDescription>
            Add links to news articles, videos, or other media covering this scandal
          </FormDescription>
          {form.formState.errors.mediaLinks && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.mediaLinks.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Scandal' : 'Add Scandal'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

