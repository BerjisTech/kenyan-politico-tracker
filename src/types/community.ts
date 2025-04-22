
import { Database } from "@/integrations/supabase/types";

export type PostType = "text" | "image" | "video" | "audio";
export type VisibilityType = "public" | "private";
export type ModerationActionType = "ban" | "mute" | "remove";
export type MemberRole = "member" | "moderator" | "admin";

export interface Topic {
  id: string;
  name: string;
  description?: string;
  visibility: VisibilityType;
  created_by: string;
  is_banned?: boolean;
  banned_reason?: string;
  banned_at?: string;
  banned_by?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  visibility: VisibilityType;
  created_by: string;
  is_banned?: boolean;
  banned_reason?: string;
  banned_at?: string;
  banned_by?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  topic_id?: string;
  group_id?: string;
  visibility: VisibilityType;
  created_by: string;
  is_banned?: boolean;
  banned_reason?: string;
  banned_at?: string;
  banned_by?: string;
  created_at: string;
  updated_at: string;
  topic?: Topic;
  group?: Group;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  post_type: PostType;
  user_id: string;
  topic_id?: string;
  group_id?: string;
  channel_id?: string;
  media_url?: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    email?: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    };
  };
  topic?: Topic;
  group?: Group;
  channel?: Channel;
  hashtags?: Hashtag[];
  comment_count?: number;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    email?: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    };
  };
  replies?: Comment[];
}

export interface Hashtag {
  id: string;
  name: string;
  created_at: string;
  post_count?: number;
}

export interface MemberWithRole {
  id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    };
  };
}

export interface ModerationEvent {
  id: string;
  action: ModerationActionType;
  target_user_id: string;
  performed_by: string;
  topic_id?: string;
  group_id?: string;
  channel_id?: string;
  reason?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  target_user?: {
    id: string;
    email?: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
    };
  };
  performed_by_user?: {
    id: string;
    email?: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
    };
  };
}
