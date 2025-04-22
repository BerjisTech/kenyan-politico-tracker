
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchTopicById, fetchPosts, joinTopic, fetchChannels, createChannel } from '@/services/community';
import { Topic, Post, Channel } from '@/types/community';
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
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Users, Lock, Globe, MessageSquare, ThumbsUp, Clock, PlusCircle, MessageSquareText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const channelFormSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  visibility: z.enum(["public", "private"]),
});

type ChannelFormValues = z.infer<typeof channelFormSchema>;

export default function TopicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);
  const [activeTab, setActiveTab] = useState("posts");
  const [openChannelDialog, setOpenChannelDialog] = useState(false);

  const channelForm = useForm<ChannelFormValues>({
    resolver: zodResolver(channelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "public",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [topicData, postsData, channelsData] = await Promise.all([
          fetchTopicById(id),
          fetchPosts({ topic_id: id }),
          fetchChannels({ topic_id: id }),
        ]);
        
        setTopic(topicData);
        setPosts(postsData.posts);
        setPostCount(postsData.count || 0);
        setChannels(channelsData.channels);
      } catch (error) {
        console.error('Error loading topic data:', error);
        toast.error('Failed to load topic data');
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleJoinTopic = async () => {
    if (!topic) return;
    
    try {
      await joinTopic(topic.id);
      // Refresh topic data to update member count
      const updatedTopic = await fetchTopicById(topic.id);
      setTopic(updatedTopic);
    } catch (error) {
      console.error('Error joining topic:', error);
    }
  };

  async function onChannelSubmit(values: ChannelFormValues) {
    if (!topic) return;
    
    try {
      await createChannel({
        name: values.name,
        description: values.description,
        topic_id: topic.id,
        visibility: values.visibility as "public" | "private",
      });
      
      // Refresh channels list
      const { channels: newChannels } = await fetchChannels({ topic_id: topic.id });
      setChannels(newChannels);
      setOpenChannelDialog(false);
      channelForm.reset();
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  }

  if (loading) {
    return (
      <div className="container py-10 text-center">
        <p>Loading topic...</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container py-10 text-center">
        <p>Topic not found</p>
        <Button asChild className="mt-4">
          <Link to="/community">Back to Community</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/community" className="text-muted-foreground hover:underline">Community</Link>
        <span className="text-muted-foreground">/</span>
        <span>{topic.name}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{topic.name}</h1>
            {topic.visibility === 'public' ? (
              <Globe className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <p className="text-muted-foreground mt-1">{topic.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" />
              {topic.member_count || 0} members
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {postCount} posts
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Created {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isAuthenticated && (
            <>
              <Button onClick={handleJoinTopic} className="whitespace-nowrap">
                Join Topic
              </Button>
              <Button asChild variant="outline">
                <Link to={`/community/post/new?topic_id=${topic.id}`}>
                  Create Post
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p>No posts in this topic yet.</p>
              {isAuthenticated && (
                <Button asChild className="mt-4">
                  <Link to={`/community/post/new?topic_id=${topic.id}`}>
                    Create the first post
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle>
                      <Link to={`/community/post/${post.id}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Posted by {post.author?.user_metadata?.first_name || 'Anonymous'} {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {post.post_type === 'text' && (
                      <p className="line-clamp-3">{post.content}</p>
                    )}
                    {post.post_type === 'image' && post.media_url && (
                      <div className="aspect-video w-full max-h-[300px] overflow-hidden rounded-md">
                        <img 
                          src={post.media_url} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {post.post_type === 'video' && post.media_url && (
                      <div className="aspect-video max-h-[300px] overflow-hidden rounded-md">
                        <video 
                          src={post.media_url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {post.post_type === 'audio' && post.media_url && (
                      <audio 
                        src={post.media_url} 
                        controls 
                        className="w-full mt-2"
                      />
                    )}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.hashtags.map((tag) => (
                          <Link 
                            key={tag.id}
                            to={`/community/hashtag/${tag.name}`}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" /> {post.upvotes}
                      </span>
                      <span className="text-sm flex items-center gap-1">
                        <MessageSquareText className="h-4 w-4" /> {post.comment_count || 0}
                      </span>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/community/post/${post.id}`}>
                        View Discussion
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Channels</h2>
            {isAuthenticated && (
              <Dialog open={openChannelDialog} onOpenChange={setOpenChannelDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Channel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Channel</DialogTitle>
                    <DialogDescription>
                      Channels are focused discussion spaces within a topic.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...channelForm}>
                    <form onSubmit={channelForm.handleSubmit(onChannelSubmit)} className="space-y-4">
                      <FormField
                        control={channelForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Channel Name</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g., General Discussion" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={channelForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe what this channel is about..." 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={channelForm.control}
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
                        <Button type="submit">Create Channel</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {channels.length === 0 ? (
            <div className="text-center py-10">
              <p>No channels in this topic yet.</p>
              {isAuthenticated && (
                <Button onClick={() => setOpenChannelDialog(true)} className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create the first channel
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((channel) => (
                <Card key={channel.id}>
                  <CardHeader>
                    <CardTitle>
                      <Link to={`/community/channel/${channel.id}`} className="hover:underline">
                        {channel.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {channel.visibility === 'public' ? (
                        <Globe className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      <span>{channel.visibility === 'public' ? 'Public Channel' : 'Private Channel'}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {channel.description || 'No description provided.'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={`/community/channel/${channel.id}`}>
                        Join Discussion
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
