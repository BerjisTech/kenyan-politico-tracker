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
      user_role: "superadmin" | "admin" | "staff" | "user"
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
      user_role: ["superadmin", "admin", "staff", "user"],
    },
  },
} as const
