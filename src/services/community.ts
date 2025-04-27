
import { supabase } from "@/integrations/supabase/client";
import { 
  Post, Comment, Topic, Group, Channel, Hashtag,
  MemberWithRole, ModerationActionType, PostType
} from "@/types/community";
import { toast } from "sonner";

// Posts
export async function fetchPosts(options: { 
  topic_id?: string;
  group_id?: string;
  channel_id?: string;
  page?: number;
  pageSize?: number;
}) {
  const { page = 1, pageSize = 10 } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:user_id(
          id,
          email,
          user_metadata
        ),
        hashtags:post_hashtags(
          hashtags(*)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (options.topic_id) {
      query = query.eq('topic_id', options.topic_id);
    }

    if (options.group_id) {
      query = query.eq('group_id', options.group_id);
    }

    if (options.channel_id) {
      query = query.eq('channel_id', options.channel_id);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
      throw error;
    }

    const posts = data as unknown as Post[];
    posts.forEach(post => {
      if (post.hashtags) {
        // Fix: Extract the actual hashtag objects from the nested structure
        post.hashtags = post.hashtags.map(h => h.hashtags as unknown as Hashtag);
      }
    });

    return { posts, count };
  } catch (error) {
    console.error('Error in fetchPosts:', error);
    toast.error('Failed to load posts');
    throw error;
  }
}

export async function fetchPostById(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:user_id(
        id, 
        email,
        user_metadata
      ),
      topic:topic_id(*),
      group:group_id(*),
      channel:channel_id(*),
      hashtags:post_hashtags(
        hashtags(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    toast.error('Failed to load post');
    throw error;
  }

  const post = data as unknown as Post;
  if (post.hashtags) {
    // Fix: Extract the actual hashtag objects from the nested structure
    post.hashtags = post.hashtags.map(h => h.hashtags as unknown as Hashtag);
  }

  return post;
}

export async function createPost(post: {
  title: string;
  content?: string;
  post_type: PostType;
  topic_id?: string;
  group_id?: string;
  channel_id?: string;
  media_url?: string;
  hashtags?: string[];
}) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        title: post.title,
        content: post.content,
        post_type: post.post_type,
        topic_id: post.topic_id,
        group_id: post.group_id,
        channel_id: post.channel_id,
        media_url: post.media_url,
        user_id: user.data.user.id
      })
      .select()
      .single();

    if (postError) {
      throw postError;
    }

    if (post.hashtags && post.hashtags.length > 0) {
      for (const tag of post.hashtags) {
        const { data: hashtagData, error: hashtagError } = await supabase
          .from('hashtags')
          .upsert({ name: tag.toLowerCase().trim() })
          .select()
          .single();

        if (hashtagError) {
          console.error('Error upserting hashtag:', hashtagError);
          continue;
        }

        await supabase
          .from('post_hashtags')
          .insert({
            post_id: postData.id,
            hashtag_id: hashtagData.id
          });
      }
    }

    toast.success('Post created successfully');
    return postData;
  } catch (error: any) {
    console.error('Error creating post:', error);
    toast.error('Failed to create post: ' + error.message);
    throw error;
  }
}

// Comments
export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:user_id(
        id,
        email,
        user_metadata
      )
    `)
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    toast.error('Failed to load comments');
    throw error;
  }

  const comments = data as unknown as Comment[];
  for (const comment of comments) {
    const { data: repliesData, error: repliesError } = await supabase
      .from('comments')
      .select(`
        *,
        author:user_id(
          id,
          email,
          user_metadata
        )
      `)
      .eq('parent_id', comment.id)
      .order('created_at', { ascending: true });

    if (!repliesError) {
      comment.replies = repliesData as unknown as Comment[];
    }
  }

  return comments;
}

export async function createComment(comment: {
  content: string;
  post_id: string;
  parent_id?: string;
}) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: comment.content,
        post_id: comment.post_id,
        parent_id: comment.parent_id,
        user_id: user.data.user.id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success(comment.parent_id ? 'Reply added' : 'Comment added');
    return data;
  } catch (error: any) {
    console.error('Error creating comment:', error);
    toast.error('Failed to add comment: ' + error.message);
    throw error;
  }
}

// Topics
export async function fetchTopics(options: { 
  search?: string; 
  page?: number;
  pageSize?: number;
}): Promise<{ topics: Topic[], count: number }> {
  try {
    const { search, page = 1, pageSize = 10 } = options;
    
    try {
      let query = supabase
        .from('topics')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
        
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data, count, error } = await query;
      
      if (error) {
        throw error;
      }
      
      const topics = data ? data.map(topic => ({
        ...topic as unknown as Topic,
        member_count: 0
      })) : [];
      
      return { topics, count: count || topics.length };
    } catch (error) {
      console.error('Error fetching topics with main approach, trying fallback:', error);
      
      const { data, error: fallbackError } = await supabase
        .from('topics')
        .select('id, name, description, visibility, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(pageSize);
        
      if (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw fallbackError;
      }
      
      const topics = data ? data.map(topic => ({
        ...topic as unknown as Topic,
        member_count: 0,
        created_by: '',
        is_banned: false
      })) : [];
      
      return { topics, count: topics.length };
    }
  } catch (error) {
    console.error('Error in fetchTopics:', error);
    toast.error('Failed to load topics');
    return { topics: [], count: 0 };
  }
}

export async function fetchTopicById(id: string): Promise<Topic | null> {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching topic directly:', error);
      throw error;
    }

    const topic: Topic = {
      ...data as unknown as Topic,
      member_count: 0
    };

    return topic;
  } catch (error: any) {
    console.error('Error in fetchTopicById:', error);
    toast.error('Failed to load topic: ' + error.message);
    return null;
  }
}

export async function createTopic(topic: {
  name: string;
  description?: string;
  visibility: "public" | "private";
}) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .insert({
        name: topic.name,
        description: topic.description,
        visibility: topic.visibility,
        created_by: user.data.user.id
      })
      .select()
      .single();

    if (topicError) {
      throw topicError;
    }

    await supabase
      .from('topic_members')
      .insert({
        topic_id: topicData.id,
        user_id: user.data.user.id,
        role: 'admin'
      });

    toast.success('Topic created successfully');
    return topicData;
  } catch (error: any) {
    console.error('Error creating topic:', error);
    toast.error('Failed to create topic: ' + error.message);
    throw error;
  }
}

// Groups
export async function fetchGroups(options: { 
  search?: string; 
  page?: number;
  pageSize?: number;
}): Promise<{ groups: Group[], count: number }> {
  try {
    const { search, page = 1, pageSize = 10 } = options;
    
    try {
      let query = supabase
        .from('groups')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
        
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data, count, error } = await query;
      
      if (error) {
        throw error;
      }
      
      const groups = data ? data.map(group => ({
        ...group as unknown as Group,
        member_count: 0
      })) : [];
      
      return { groups, count: count || groups.length };
    } catch (error) {
      console.error('Error fetching groups with main approach, trying fallback:', error);
      
      const { data, error: fallbackError } = await supabase
        .from('groups')
        .select('id, name, description, visibility, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(pageSize);
        
      if (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw fallbackError;
      }
      
      const groups = data ? data.map(group => ({
        ...group as unknown as Group,
        member_count: 0,
        created_by: '',
        is_banned: false
      })) : [];
      
      return { groups, count: groups.length };
    }
  } catch (error) {
    console.error('Error fetching groups:', error);
    toast.error('Failed to load groups');
    return { groups: [], count: 0 };
  }
}

export async function fetchGroupById(id: string): Promise<Group | null> {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching group:', error);
      throw error;
    }

    const group: Group = {
      ...data as unknown as Group,
      member_count: 0
    };

    return group;
  } catch (error: any) {
    console.error('Error in fetchGroupById:', error);
    toast.error('Failed to load group');
    return null;
  }
}

export async function createGroup(group: {
  name: string;
  description?: string;
  visibility: "public" | "private";
}) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: group.name,
        description: group.description,
        visibility: group.visibility,
        created_by: user.data.user.id
      })
      .select()
      .single();

    if (groupError) {
      throw groupError;
    }

    await supabase
      .from('group_members')
      .insert({
        group_id: groupData.id,
        user_id: user.data.user.id,
        role: 'admin'
      });

    toast.success('Group created successfully');
    return groupData;
  } catch (error: any) {
    console.error('Error creating group:', error);
    toast.error('Failed to create group: ' + error.message);
    throw error;
  }
}

// Channels
export async function fetchChannels(options: {
  topic_id?: string;
  group_id?: string;
  page?: number;
  pageSize?: number;
}) {
  const { topic_id, group_id, page = 1, pageSize = 10 } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  if (!topic_id && !group_id) {
    throw new Error('Either topic_id or group_id must be provided');
  }

  let query = supabase
    .from('channels')
    .select(`
      *,
      topic:topic_id(*),
      group:group_id(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (topic_id) {
    query = query.eq('topic_id', topic_id);
  }

  if (group_id) {
    query = query.eq('group_id', group_id);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching channels:', error);
    toast.error('Failed to load channels');
    throw error;
  }

  return { channels: data as unknown as Channel[], count };
}

export async function createChannel(channel: {
  name: string;
  description?: string;
  topic_id?: string;
  group_id?: string;
  visibility: "public" | "private";
}) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    if (!channel.topic_id && !channel.group_id) {
      throw new Error('Either topic_id or group_id must be provided');
    }

    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .insert({
        name: channel.name,
        description: channel.description,
        topic_id: channel.topic_id,
        group_id: channel.group_id,
        visibility: channel.visibility,
        created_by: user.data.user.id
      })
      .select()
      .single();

    if (channelError) {
      throw channelError;
    }

    await supabase
      .from('channel_members')
      .insert({
        channel_id: channelData.id,
        user_id: user.data.user.id,
        role: 'admin'
      });

    toast.success('Channel created successfully');
    return channelData;
  } catch (error: any) {
    console.error('Error creating channel:', error);
    toast.error('Failed to create channel: ' + error.message);
    throw error;
  }
}

// Hashtags
export async function fetchHashtags(search?: string): Promise<Hashtag[]> {
  let query = supabase
    .from('hashtags')
    .select('*')
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching hashtags:', error);
    toast.error('Failed to load hashtags');
    throw error;
  }

  return data as Hashtag[];
}

// Membership
export async function joinTopic(topicId: string) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('topic_members')
      .insert({
        topic_id: topicId,
        user_id: user.data.user.id,
        role: 'member'
      });

    if (error) {
      throw error;
    }

    toast.success('Joined topic successfully');
  } catch (error: any) {
    console.error('Error joining topic:', error);
    toast.error('Failed to join topic: ' + error.message);
    throw error;
  }
}

export async function joinGroup(groupId: string) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: user.data.user.id,
        role: 'member'
      });

    if (error) {
      throw error;
    }

    toast.success('Joined group successfully');
  } catch (error: any) {
    console.error('Error joining group:', error);
    toast.error('Failed to join group: ' + error.message);
    throw error;
  }
}

// Moderation
export async function banUserFromTopic(options: {
  topicId: string;
  userId: string;
  reason?: string;
}) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase.rpc('ban_user_from_topic', {
      _topic_id: options.topicId,
      _user_id: options.userId,
      _reason: options.reason || 'No reason provided',
      _admin_id: user.data.user.id
    });

    if (error) {
      throw error;
    }

    toast.success('User banned successfully');
  } catch (error: any) {
    console.error('Error banning user:', error);
    toast.error('Failed to ban user: ' + error.message);
    throw error;
  }
}

// Saved Content
export async function fetchSavedContent(options: { 
  page?: number;
  pageSize?: number;
}): Promise<{ posts: Post[], count: number }> {
  try {
    const { page = 1, pageSize = 10 } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }
    
    return { 
      posts: [],
      count: 0 
    };
  } catch (error) {
    console.error('Error fetching saved content:', error);
    toast.error('Failed to load saved content');
    return { posts: [], count: 0 };
  }
}
