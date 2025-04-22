
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createPost, fetchHashtags } from '@/services/community';
import { Hashtag } from '@/types/community';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  content: z.string().optional(),
  post_type: z.enum(["text", "image", "video", "audio"]),
  media_file: z.any().optional(),
  hashtags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PostCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Hashtag[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  
  const topic_id = searchParams.get('topic_id');
  const group_id = searchParams.get('group_id');
  const channel_id = searchParams.get('channel_id');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      post_type: "text",
      hashtags: "",
    },
  });

  const watchPostType = form.watch("post_type");
  
  useEffect(() => {
    const loadHashtags = async () => {
      try {
        const hashtags = await fetchHashtags();
        setSuggestions(hashtags);
      } catch (error) {
        console.error('Error loading hashtags:', error);
      }
    };
    
    loadHashtags();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to create a post');
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Reset media preview when post type changes
  useEffect(() => {
    setMediaPreview(null);
    form.setValue('media_file', undefined);
  }, [watchPostType, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('media_file', file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  };

  const handleHashtagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If the user enters a space or comma, add the hashtag
    if (value.endsWith(' ') || value.endsWith(',')) {
      const tag = value.slice(0, -1).trim().toLowerCase();
      if (tag && !selectedHashtags.includes(tag)) {
        setSelectedHashtags([...selectedHashtags, tag]);
      }
      form.setValue('hashtags', '');
    }
  };

  const removeHashtag = (tag: string) => {
    setSelectedHashtags(selectedHashtags.filter(t => t !== tag));
  };

  const handleSuggestionClick = (tag: string) => {
    if (!selectedHashtags.includes(tag)) {
      setSelectedHashtags([...selectedHashtags, tag]);
    }
  };

  async function onSubmit(values: FormValues) {
    try {
      let mediaUrl = null;
      
      // Handle media upload if there's a file
      if (values.media_file && values.post_type !== 'text') {
        setMediaUploading(true);
        const file = values.media_file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `posts/${values.post_type}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('media')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
          
        mediaUrl = publicUrl;
        setMediaUploading(false);
      }
      
      await createPost({
        title: values.title,
        content: values.content,
        post_type: values.post_type,
        topic_id: topic_id || undefined,
        group_id: group_id || undefined,
        channel_id: channel_id || undefined,
        media_url: mediaUrl || undefined,
        hashtags: selectedHashtags,
      });
      
      if (topic_id) {
        navigate(`/community/topic/${topic_id}`);
      } else if (group_id) {
        navigate(`/community/group/${group_id}`);
      } else if (channel_id) {
        navigate(`/community/channel/${channel_id}`);
      } else {
        navigate('/community');
      }
      
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(`Failed to create post: ${error.message}`);
    }
  }

  const getReturnPath = () => {
    if (topic_id) {
      return `/community/topic/${topic_id}`;
    } else if (group_id) {
      return `/community/group/${group_id}`;
    } else if (channel_id) {
      return `/community/channel/${channel_id}`;
    } else {
      return '/community';
    }
  };

  const getContextTitle = () => {
    if (topic_id) {
      return 'in Topic';
    } else if (group_id) {
      return 'in Group';
    } else if (channel_id) {
      return 'in Channel';
    } else {
      return 'Community';
    }
  };

  return (
    <div className="container py-10">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/community" className="text-muted-foreground hover:underline">Community</Link>
        <span className="text-muted-foreground">/</span>
        <Link to={getReturnPath()} className="text-muted-foreground hover:underline">
          {getContextTitle()}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span>New Post</span>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Share your thoughts, questions, or media with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for your post" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="post_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select post type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchPostType === 'text' && (
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts, ideas, or questions..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchPostType !== 'text' && (
                <FormItem>
                  <FormLabel>Upload {watchPostType}</FormLabel>
                  <FormControl>
                    <Input 
                      type="file"
                      accept={
                        watchPostType === 'image' ? 'image/*' :
                        watchPostType === 'video' ? 'video/*' :
                        watchPostType === 'audio' ? 'audio/*' : undefined
                      }
                      onChange={handleFileChange}
                    />
                  </FormControl>
                  <FormMessage />
                  
                  {mediaPreview && (
                    <div className="mt-2">
                      {watchPostType === 'image' && (
                        <img 
                          src={mediaPreview} 
                          alt="Preview" 
                          className="max-h-[300px] rounded-md"
                        />
                      )}
                      {watchPostType === 'video' && (
                        <video 
                          src={mediaPreview} 
                          controls 
                          className="max-w-full rounded-md"
                        />
                      )}
                      {watchPostType === 'audio' && (
                        <audio 
                          src={mediaPreview} 
                          controls 
                          className="w-full"
                        />
                      )}
                    </div>
                  )}
                </FormItem>
              )}

              <div>
                <FormLabel>Hashtags</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedHashtags.map(tag => (
                    <div 
                      key={tag} 
                      className="bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      #{tag}
                      <button 
                        type="button" 
                        onClick={() => removeHashtag(tag)} 
                        className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <FormField
                  control={form.control}
                  name="hashtags"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Add hashtags (separated by space or comma)" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleHashtagInput(e);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Add relevant hashtags to improve discoverability
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Popular hashtags:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.slice(0, 10).map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleSuggestionClick(tag.name)}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full hover:bg-secondary/80"
                        >
                          #{tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={getReturnPath()}>Cancel</Link>
                </Button>
                <Button 
                  type="submit"
                  disabled={mediaUploading}
                >
                  {mediaUploading ? 'Uploading...' : 'Create Post'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
