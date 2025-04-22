export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          banned_at: string | null
          banned_by: string | null
          banned_reason: string | null
          created_at: string
          created_by: string
          description: string | null
          group_id: string | null
          id: string
          is_banned: boolean | null
          name: string
          topic_id: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          banned_at?: string | null
          banned_by?: string | null
          banned_reason?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          group_id?: string | null
          id?: string
          is_banned?: boolean | null
          name: string
          topic_id?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          banned_at?: string | null
          banned_by?: string | null
          banned_reason?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          group_id?: string | null
          id?: string
          is_banned?: boolean | null
          name?: string
          topic_id?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: [
          {
            foreignKeyName: "channels_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          downvotes: number | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          downvotes?: number | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          downvotes?: number | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      counties: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          banned_at: string | null
          banned_by: string | null
          banned_reason: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_banned: boolean | null
          name: string
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          banned_at?: string | null
          banned_by?: string | null
          banned_reason?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_banned?: boolean | null
          name: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          banned_at?: string | null
          banned_by?: string | null
          banned_reason?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_banned?: boolean | null
          name?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: []
      }
      hashtags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      media_links: {
        Row: {
          created_at: string
          id: string
          scandal_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          scandal_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          scandal_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_links_scandal_id_fkey"
            columns: ["scandal_id"]
            isOneToOne: false
            referencedRelation: "scandals"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action: Database["public"]["Enums"]["moderation_action"]
          channel_id: string | null
          created_at: string
          expires_at: string | null
          group_id: string | null
          id: string
          performed_by: string
          reason: string | null
          target_user_id: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          action: Database["public"]["Enums"]["moderation_action"]
          channel_id?: string | null
          created_at?: string
          expires_at?: string | null
          group_id?: string | null
          id?: string
          performed_by: string
          reason?: string | null
          target_user_id: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["moderation_action"]
          channel_id?: string | null
          created_at?: string
          expires_at?: string | null
          group_id?: string | null
          id?: string
          performed_by?: string
          reason?: string | null
          target_user_id?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      party_affiliations: {
        Row: {
          created_at: string
          id: string
          is_current: boolean
          join_date: string
          leave_date: string | null
          party_id: string
          politician_id: string
          position: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_current?: boolean
          join_date: string
          leave_date?: string | null
          party_id: string
          politician_id: string
          position?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_current?: boolean
          join_date?: string
          leave_date?: string | null
          party_id?: string
          politician_id?: string
          position?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "party_affiliations_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_affiliations_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      politicians: {
        Row: {
          bio: string | null
          constituency: string | null
          county_id: string | null
          created_at: string
          current_role_id: string | null
          date_of_birth: string | null
          education: string[] | null
          id: string
          image: string | null
          name: string
          ward: string | null
        }
        Insert: {
          bio?: string | null
          constituency?: string | null
          county_id?: string | null
          created_at?: string
          current_role_id?: string | null
          date_of_birth?: string | null
          education?: string[] | null
          id?: string
          image?: string | null
          name: string
          ward?: string | null
        }
        Update: {
          bio?: string | null
          constituency?: string | null
          county_id?: string | null
          created_at?: string
          current_role_id?: string | null
          date_of_birth?: string | null
          education?: string[] | null
          id?: string
          image?: string | null
          name?: string
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "politicians_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "politicians_current_role_id_fkey"
            columns: ["current_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      popularity_ratings: {
        Row: {
          created_at: string
          date: string
          id: string
          politician_id: string
          rating: number
          source: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          politician_id: string
          rating: number
          source?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          politician_id?: string
          rating?: number
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "popularity_ratings_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      post_hashtags: {
        Row: {
          created_at: string
          hashtag_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          hashtag_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          hashtag_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          channel_id: string | null
          content: string | null
          created_at: string
          downvotes: number | null
          group_id: string | null
          id: string
          media_url: string | null
          post_type: Database["public"]["Enums"]["post_type"]
          title: string
          topic_id: string | null
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          content?: string | null
          created_at?: string
          downvotes?: number | null
          group_id?: string | null
          id?: string
          media_url?: string | null
          post_type?: Database["public"]["Enums"]["post_type"]
          title: string
          topic_id?: string | null
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          channel_id?: string | null
          content?: string | null
          created_at?: string
          downvotes?: number | null
          group_id?: string | null
          id?: string
          media_url?: string | null
          post_type?: Database["public"]["Enums"]["post_type"]
          title?: string
          topic_id?: string | null
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_locations: {
        Row: {
          county_id: string
          created_at: string
          id: string
          project_id: string
          sub_county_id: string | null
          ward_id: string | null
        }
        Insert: {
          county_id: string
          created_at?: string
          id?: string
          project_id: string
          sub_county_id?: string | null
          ward_id?: string | null
        }
        Update: {
          county_id?: string
          created_at?: string
          id?: string
          project_id?: string
          sub_county_id?: string | null
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_locations_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_locations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_locations_sub_county_id_fkey"
            columns: ["sub_county_id"]
            isOneToOne: false
            referencedRelation: "sub_counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_locations_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      project_politicians: {
        Row: {
          created_at: string
          id: string
          politician_id: string
          project_id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          politician_id: string
          project_id: string
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          politician_id?: string
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_politicians_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_politicians_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          description: string
          end_date: string | null
          id: string
          name: string
          outcome: string | null
          start_date: string
          status: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description: string
          end_date?: string | null
          id?: string
          name: string
          outcome?: string | null
          start_date: string
          status: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          name?: string
          outcome?: string | null
          start_date?: string
          status?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean
          organization: string
          politician_id: string
          start_date: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          organization: string
          politician_id: string
          start_date: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          organization?: string
          politician_id?: string
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      scandals: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          impact: string | null
          politician_id: string
          resolution: string | null
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          id?: string
          impact?: string | null
          politician_id: string
          resolution?: string | null
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          impact?: string | null
          politician_id?: string
          resolution?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "scandals_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_counties: {
        Row: {
          county_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          county_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          county_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_counties_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          topic_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          topic_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_members_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          banned_at: string | null
          banned_by: string | null
          banned_reason: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_banned: boolean | null
          name: string
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          banned_at?: string | null
          banned_by?: string | null
          banned_reason?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_banned?: boolean | null
          name: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          banned_at?: string | null
          banned_by?: string | null
          banned_reason?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_banned?: boolean | null
          name?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wards: {
        Row: {
          created_at: string
          id: string
          name: string
          sub_county_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sub_county_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sub_county_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wards_sub_county_id_fkey"
            columns: ["sub_county_id"]
            isOneToOne: false
            referencedRelation: "sub_counties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ban_user_from_topic: {
        Args: {
          _topic_id: string
          _user_id: string
          _reason: string
          _admin_id: string
        }
        Returns: undefined
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role_safely: {
        Args: { user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin_or_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      moderation_action: "ban" | "mute" | "remove"
      post_type: "text" | "image" | "video" | "audio"
      user_role: "superadmin" | "admin" | "staff" | "user"
      visibility_type: "public" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      moderation_action: ["ban", "mute", "remove"],
      post_type: ["text", "image", "video", "audio"],
      user_role: ["superadmin", "admin", "staff", "user"],
      visibility_type: ["public", "private"],
    },
  },
} as const
