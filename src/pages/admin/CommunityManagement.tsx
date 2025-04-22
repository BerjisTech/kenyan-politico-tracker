
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Topic, Group, Channel, ModerationActionType } from '@/types/community';
import { Pencil, Trash, Eye, AlertTriangle, Check, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function CommunityManagement() {
  const [activeTab, setActiveTab] = useState<string>("topics");
  
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Community Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage topics, groups, channels, and moderation for the community platform
          </p>
        </div>
        
        <Tabs defaultValue="topics" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="topics">
            <TopicsManagement />
          </TabsContent>
          
          <TabsContent value="groups">
            <GroupsManagement />
          </TabsContent>
          
          <TabsContent value="channels">
            <ChannelsManagement />
          </TabsContent>
          
          <TabsContent value="moderation">
            <ModerationManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TopicsManagement() {
  const { data: topics, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Topic[];
    }
  });
  
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete topic "${name}"? This action cannot be undone.`)) return;
    
    try {
      const { error } = await supabase.from('topics').delete().eq('id', id);
      if (error) throw error;
      
      toast.success(`Topic "${name}" deleted successfully`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to delete topic: ${err.message}`);
    }
  };
  
  const handleToggleBan = async (topic: Topic) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({
          is_banned: !topic.is_banned,
          banned_at: !topic.is_banned ? new Date().toISOString() : null,
          banned_by: !topic.is_banned ? (await supabase.auth.getUser()).data.user?.id : null,
          banned_reason: !topic.is_banned ? 'Administrative action' : null
        })
        .eq('id', topic.id);
      
      if (error) throw error;
      
      toast.success(`Topic "${topic.name}" ${topic.is_banned ? 'unbanned' : 'banned'} successfully`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to ${topic.is_banned ? 'unban' : 'ban'} topic: ${err.message}`);
    }
  };
  
  if (isLoading) return <div>Loading topics...</div>;
  if (error) return <div>Error loading topics: {(error as Error).message}</div>;
  
  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Topics Management</h2>
        <TopicDialog mode="create" onSuccess={refetch} />
      </div>
      
      {topics && topics.length > 0 ? (
        <div className="grid gap-4">
          {topics.map(topic => (
            <Card key={topic.id} className={topic.is_banned ? "border-destructive bg-destructive/5" : ""}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{topic.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{topic.description || 'No description'}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <TopicDialog mode="edit" topic={topic} onSuccess={refetch} />
                    <Button
                      variant={topic.is_banned ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => handleToggleBan(topic)}
                    >
                      {topic.is_banned ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Unban
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-1" /> Ban
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(topic.id, topic.name)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-sm text-muted-foreground">
                  <p>Visibility: {topic.visibility}</p>
                  <p>Created: {new Date(topic.created_at).toLocaleDateString()}</p>
                  {topic.is_banned && (
                    <div className="text-destructive mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> 
                      Banned {topic.banned_at && `on ${new Date(topic.banned_at).toLocaleDateString()}`}
                      {topic.banned_reason && `: ${topic.banned_reason}`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">No Topics Created</h3>
          <p className="text-muted-foreground mb-4">Get started by creating a new topic</p>
          <TopicDialog mode="create" onSuccess={refetch} />
        </div>
      )}
    </div>
  );
}

interface TopicDialogProps {
  mode: 'create' | 'edit';
  topic?: Topic;
  onSuccess: () => void;
}

function TopicDialog({ mode, topic, onSuccess }: TopicDialogProps) {
  const [name, setName] = useState(topic?.name || '');
  const [description, setDescription] = useState(topic?.description || '');
  const [visibility, setVisibility] = useState<"public" | "private">(topic?.visibility as "public" | "private" || 'public');
  const [loading, setLoading] = useState(false);
  
  // Fix: Create a handler function that properly handles the value change
  const handleVisibilityChange = (value: string) => {
    // Validate that the value is either 'public' or 'private' before setting the state
    if (value === 'public' || value === 'private') {
      setVisibility(value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent, close: () => void) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'create') {
        const user = await supabase.auth.getUser();
        if (!user.data.user) throw new Error('Not authenticated');
        
        const { error } = await supabase
          .from('topics')
          .insert({
            name,
            description,
            visibility: visibility,
            created_by: user.data.user.id
          });
        
        if (error) throw error;
        toast.success('Topic created successfully');
      } else if (mode === 'edit' && topic) {
        const { error } = await supabase
          .from('topics')
          .update({
            name,
            description,
            visibility: visibility
          })
          .eq('id', topic.id);
        
        if (error) throw error;
        toast.success('Topic updated successfully');
      }
      
      close();
      onSuccess();
    } catch (err: any) {
      toast.error(`Failed to ${mode} topic: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setName(topic?.name || '');
    setDescription(topic?.description || '');
    setVisibility(topic?.visibility as "public" | "private" || 'public');
  };
  
  return (
    <Dialog onOpenChange={(open) => {
      if (open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant={mode === 'create' ? 'default' : 'outline'} size="sm">
          {mode === 'create' ? 'Create New Topic' : <Pencil className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Topic' : 'Edit Topic'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new discussion topic for the community.'
              : 'Update the details for this community topic.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Topic name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this topic is about"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={handleVisibilityChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button 
                type="submit"
                disabled={loading || !name.trim()} 
                onClick={(e) => {
                  const closeButton = document.querySelector('[data-state="open"] button[type="button"]');
                  handleSubmit(e, () => {
                    (closeButton as HTMLButtonElement)?.click();
                  });
                }}
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GroupsManagement() {
  // Similar to TopicsManagement but for groups
  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-semibold">Groups Management</h2>
      <p className="text-muted-foreground">
        Implementation of Groups management will be similar to Topics management.
        This section would allow admins to create, edit, ban, and delete community groups.
      </p>
    </div>
  );
}

function ChannelsManagement() {
  // Management for channels
  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-semibold">Channels Management</h2>
      <p className="text-muted-foreground">
        Implementation of Channels management will be similar to Topics management.
        This section would allow admins to create, edit, ban, and delete channels within topics or groups.
      </p>
    </div>
  );
}

function ModerationManagement() {
  // Management for moderation actions
  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-semibold">Moderation Management</h2>
      <p className="text-muted-foreground">
        This section would allow admins to view and manage moderation actions,
        including user bans, content removals, and other moderation activities.
      </p>
    </div>
  );
}
