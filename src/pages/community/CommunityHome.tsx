
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createTopic, createGroup } from '@/services/community';
import { toast } from 'sonner';
import { Users, Lock, Globe, PlusCircle } from 'lucide-react';

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
      try {
        const [topicsResult, groupsResult] = await Promise.all([
          fetchTopics({ pageSize: 20 }),
          fetchGroups({ pageSize: 20 }),
        ]);
        setTopics(topicsResult.topics);
        setGroups(groupsResult.groups);
      } catch (error) {
        console.error('Error loading community data:', error);
        toast.error('Failed to load community data');
      } finally {
        setLoading(false);
      }
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
      
      // Refresh topics list
      const { topics: newTopics } = await fetchTopics({ pageSize: 20 });
      setTopics(newTopics);
      setOpenTopicDialog(false);
      topicForm.reset();
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  }

  async function onGroupSubmit(values: FormValues) {
    try {
      await createGroup({
        name: values.name,
        description: values.description,
        visibility: values.visibility as "public" | "private",
      });
      
      // Refresh groups list
      const { groups: newGroups } = await fetchGroups({ pageSize: 20 });
      setGroups(newGroups);
      setOpenGroupDialog(false);
      groupForm.reset();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground">Join discussions on political topics affecting Kenya</p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-2">
            <Dialog open={openTopicDialog} onOpenChange={setOpenTopicDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Topic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Topic</DialogTitle>
                  <DialogDescription>
                    Topics are public or private spaces where people can discuss specific political issues.
                  </DialogDescription>
                </DialogHeader>
                <Form {...topicForm}>
                  <form onSubmit={topicForm.handleSubmit(onTopicSubmit)} className="space-y-4">
                    <FormField
                      control={topicForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic Name</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Healthcare Reform" {...field} />
                          </FormControl>
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
                            <Textarea 
                              placeholder="Describe what this topic is about..." 
                              {...field} 
                            />
                          </FormControl>
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
                              <SelectItem value="public">
                                <div className="flex items-center">
                                  <Globe className="mr-2 h-4 w-4" />
                                  <span>Public - Anyone can view</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="private">
                                <div className="flex items-center">
                                  <Lock className="mr-2 h-4 w-4" />
                                  <span>Private - Only members can view</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" /> Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Group</DialogTitle>
                  <DialogDescription>
                    Groups are private spaces where people can collaborate on political initiatives.
                  </DialogDescription>
                </DialogHeader>
                <Form {...groupForm}>
                  <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
                    <FormField
                      control={groupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., Youth Advocates" {...field} />
                          </FormControl>
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
                            <Textarea 
                              placeholder="Describe what this group is about..." 
                              {...field}
                            />
                          </FormControl>
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
                              <SelectItem value="public">
                                <div className="flex items-center">
                                  <Globe className="mr-2 h-4 w-4" />
                                  <span>Public - Anyone can view</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="private">
                                <div className="flex items-center">
                                  <Lock className="mr-2 h-4 w-4" />
                                  <span>Private - Only members can view</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
        )}
      </div>

      <Tabs defaultValue="topics" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="topics" className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <p>Loading topics...</p>
            </div>
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
            <div className="text-center py-10">
              <p>Loading groups...</p>
            </div>
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
    </div>
  );
}
