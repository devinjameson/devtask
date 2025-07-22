export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Category: {
        Row: {
          createdAt: string
          id: string
          name: string
          profileId: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          profileId: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          profileId?: string
        }
        Relationships: [
          {
            foreignKeyName: 'Category_profileId_fkey'
            columns: ['profileId']
            isOneToOne: false
            referencedRelation: 'Profile'
            referencedColumns: ['id']
          },
        ]
      }
      Profile: {
        Row: {
          createdAt: string
          id: string
          name: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: 'Profile_userId_fkey'
            columns: ['userId']
            isOneToOne: false
            referencedRelation: 'User'
            referencedColumns: ['id']
          },
        ]
      }
      Status: {
        Row: {
          createdAt: string
          id: string
          name: string
          profileId: string
        }
        Insert: {
          createdAt?: string
          id: string
          name: string
          profileId: string
        }
        Update: {
          createdAt?: string
          id?: string
          name?: string
          profileId?: string
        }
        Relationships: [
          {
            foreignKeyName: 'Status_profileId_fkey'
            columns: ['profileId']
            isOneToOne: false
            referencedRelation: 'Profile'
            referencedColumns: ['id']
          },
        ]
      }
      Task: {
        Row: {
          categoryId: string | null
          createdAt: string
          description: string | null
          dueDate: string | null
          id: string
          order: string
          profileId: string
          statusId: string
          title: string
          updatedAt: string
        }
        Insert: {
          categoryId?: string | null
          createdAt?: string
          description?: string | null
          dueDate?: string | null
          id: string
          order: string
          profileId: string
          statusId: string
          title: string
          updatedAt: string
        }
        Update: {
          categoryId?: string | null
          createdAt?: string
          description?: string | null
          dueDate?: string | null
          id?: string
          order?: string
          profileId?: string
          statusId?: string
          title?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: 'Task_categoryId_fkey'
            columns: ['categoryId']
            isOneToOne: false
            referencedRelation: 'Category'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'Task_profileId_fkey'
            columns: ['profileId']
            isOneToOne: false
            referencedRelation: 'Profile'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'Task_statusId_fkey'
            columns: ['statusId']
            isOneToOne: false
            referencedRelation: 'Status'
            referencedColumns: ['id']
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          firstName: string
          id: string
          lastName: string
        }
        Insert: {
          createdAt?: string
          email: string
          firstName: string
          id: string
          lastName: string
        }
        Update: {
          createdAt?: string
          email?: string
          firstName?: string
          id?: string
          lastName?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
