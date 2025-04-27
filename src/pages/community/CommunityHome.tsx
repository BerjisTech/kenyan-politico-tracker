import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchTopics, fetchGroups } from '@/services/community';
import { Topic, Group } from '@/types/community';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createTopic, createGroup } from '@/services/community';
import { toast } from 'sonner';
import { Users, Lock, Globe, PlusCircle, MessageSquare, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  visibility: z.enum(["public", "private"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function CommunityHome() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("topics");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [openTopicDialog, setOpenTopicDialog] = useState(false);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [topicsError, setTopicsError] = useState(false);
  const [groupsError, setGroupsError] = useState(false);

  const topicForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "public",
    },
  });

  const groupForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setTopicsError(false);
      setGroupsError(false);
      
      // Load topics
      try {
        const result = await fetchTopics({ pageSize: 20 });
        setTopics(result.topics);
      } catch (error) {
        console.error('Error loading topics data:', error);
        setTopicsError(true);
        setTopics([]);
      }
      
      // Load groups
      try {
        const result = await fetchGroups({ pageSize: 20 });
        setGroups(result.groups);
      } catch (error) {
        console.error('Error loading groups data:', error);
        setGroupsError(true);
        setGroups([]);
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  async function onTopicSubmit(values: FormValues) {
    try {
      await createTopic({
        name: values.name,
        description: values.description,
        visibility: values.visibility as "public" | "private",
      });
      
      const { topics: newTopics } = await fetchTopics({ pageSize: 20 });
      setTopics(newTopics);
      setOpenTopicDialog(false);
      topicForm.reset();
      toast.success('Topic created successfully');
    } catch (error) {
      console.error('Error creating topic:', error);
      toast.error('Failed to create topic');
    }
  }

  async function onGroupSubmit(values: FormValues) {
    try {
      await createGroup({
        name: values.name,
        description: values.description,
        visibility: values.visibility as "public" | "private",
      });
      
      const { groups: newGroups } = await fetchGroups({ pageSize: 20 });
      setGroups(newGroups);
      setOpenGroupDialog(false);
      groupForm.reset();
      toast.success('Group created successfully');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  }

  const ErrorDisplay = ({ type }: { type: 'topics' | 'groups' }) => (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertCircle className="h-12 w-12 text-destructive/70" />
        </div>
        <h2 className="text-xl font-medium">Failed to load {type}</h2>
        <p className="text-muted-foreground max-w-md">
          There was an error loading the {type}. This might be due to a temporary server issue.
        </p>
        <Button 
          onClick={() => {
            if (type === 'topics') {
              fetchTopics({ pageSize: 20 })
                .then(result => setTopics(result.topics))
                .catch(() => setTopicsError(true));
            } else {
              fetchGroups({ pageSize: 20 })
                .then(result => setGroups(result.groups))
                .catch(() => setGroupsError(true));
            }
          }}
        >
          Try Again
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Stories</h1>
          <p className="text-muted-foreground">Join discussions on political topics affecting Kenya</p>
        </div>
        <div className="flex gap-2">
          {isAuthenticated && (
            <>
              <Button onClick={() => setOpenTopicDialog(true)}>
                Create Story
              </Button>
              <Button variant="outline">
                View All
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <Card className="aspect-[4/3] bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Create Story</p>
          </div>
        </Card>

        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="aspect-[4/3] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          ))
        ) : (
          topics.slice(0, 3).map((topic) => (
            <Card key={topic.id} className="aspect-[4/3] relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium mb-1">{topic.name}</h3>
                <p className="text-xs text-white/80 line-clamp-2">{topic.description}</p>
              </div>
            </Card>
          ))
        )}
      </div>

      <Tabs defaultValue="topics" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="topics" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : topicsError ? (
            <ErrorDisplay type="topics" />
          ) : topics.length === 0 ? (
            <div className="text-center py-10">
              <p>No topics found. Be the first to create one!</p>
              {isAuthenticated && (
                <Button onClick={() => setOpenTopicDialog(true)} className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Topic
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <Card key={topic.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>
                      <Link to={`/community/topic/${topic.id}`} className="hover:underline">
                        {topic.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {topic.visibility === 'public' ? (
                        <Globe className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      <span>{topic.visibility === 'public' ? 'Public Topic' : 'Private Topic'}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {topic.description || 'No description provided.'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      <Users className="h-4 w-4 inline mr-1" />
                      {topic.member_count || 0} members
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/community/topic/${topic.id}`}>
                        View Topic
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="groups" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : groupsError ? (
            <ErrorDisplay type="groups" />
          ) : groups.length === 0 ? (
            <div className="text-center py-10">
              <p>No groups found. Be the first to create one!</p>
              {isAuthenticated && (
                <Button onClick={() => setOpenGroupDialog(true)} className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Group
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card key={group.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>
                      <Link to={`/community/group/${group.id}`} className="hover:underline">
                        {group.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {group.visibility === 'public' ? (
                        <Globe className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      <span>{group.visibility === 'public' ? 'Public Group' : 'Private Group'}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {group.description || 'No description provided.'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      <Users className="h-4 w-4 inline mr-1" />
                      {group.member_count || 0} members
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/community/group/${group.id}`}>
                        View Group
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={openTopicDialog} onOpenChange={setOpenTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Topic</DialogTitle>
            <DialogDescription>
              Create a topic to discuss politics and governance in Kenya.
            </DialogDescription>
          </DialogHeader>
          <Form {...topicForm}>
            <form onSubmit={topicForm.handleSubmit(onTopicSubmit)} className="space-y-4">
              <FormField
                control={topicForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Topic name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a clear, descriptive name for your topic.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={topicForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Topic description" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of what this topic is about.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={topicForm.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Public topics are visible to everyone. Private topics are only visible to members.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Topic</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={openGroupDialog} onOpenChange={setOpenGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a group to connect with like-minded individuals.
            </DialogDescription>
          </DialogHeader>
          <Form {...groupForm}>
            <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
              <FormField
                control={groupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Group name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a clear, descriptive name for your group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={groupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Group description" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of what this group is about.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={groupForm.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Public groups are visible to everyone. Private groups are only visible to members.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Group</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
