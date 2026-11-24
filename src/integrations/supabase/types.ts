export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academic_sessions: {
        Row: {
          active: boolean
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          id: string
          level: number
          name: string
        }
        Insert: {
          id?: string
          level: number
          name: string
        }
        Update: {
          id?: string
          level?: number
          name?: string
        }
        Relationships: []
      }
      exam_subjects: {
        Row: {
          allow_decimal: boolean
          allow_exempt: boolean
          assignment_id: string
          examination_id: string
          id: string
          max_marks: number
          passing_marks: number
          submitted_at: string | null
        }
        Insert: {
          allow_decimal?: boolean
          allow_exempt?: boolean
          assignment_id: string
          examination_id: string
          id?: string
          max_marks?: number
          passing_marks?: number
          submitted_at?: string | null
        }
        Update: {
          allow_decimal?: boolean
          allow_exempt?: boolean
          assignment_id?: string
          examination_id?: string
          id?: string
          max_marks?: number
          passing_marks?: number
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_subjects_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "teacher_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_subjects_examination_id_fkey"
            columns: ["examination_id"]
            isOneToOne: false
            referencedRelation: "examinations"
            referencedColumns: ["id"]
          },
        ]
      }
      examinations: {
        Row: {
          archived: boolean
          end_date: string
          grade_rules: Json
          id: string
          is_demo: boolean
          name: string
          published_at: string | null
          scheduled_at: string | null
          scheduled_by: string | null
          session_id: string
          start_date: string
          status: string
        }
        Insert: {
          archived?: boolean
          end_date: string
          grade_rules?: Json
          id?: string
          is_demo?: boolean
          name: string
          published_at?: string | null
          scheduled_at?: string | null
          scheduled_by?: string | null
          session_id: string
          start_date: string
          status?: string
        }
        Update: {
          archived?: boolean
          end_date?: string
          grade_rules?: Json
          id?: string
          is_demo?: boolean
          name?: string
          published_at?: string | null
          scheduled_at?: string | null
          scheduled_by?: string | null
          session_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "examinations_scheduled_by_fkey"
            columns: ["scheduled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examinations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "academic_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          created_at: string
          created_by: string
          due_date: string
          id: string
          instructions: string
          section_id: string
          subject_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          due_date: string
          id?: string
          instructions?: string
          section_id: string
          subject_id: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          due_date?: string
          id?: string
          instructions?: string
          section_id?: string
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      marks: {
        Row: {
          exam_subject_id: string
          id: string
          obtained: number | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          exam_subject_id: string
          id?: string
          obtained?: number | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          exam_subject_id?: string
          id?: string
          obtained?: number | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_exam_subject_id_fkey"
            columns: ["exam_subject_id"]
            isOneToOne: false
            referencedRelation: "exam_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      marksheet_publications: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          examination_id: string
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          examination_id: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          examination_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marksheet_publications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marksheet_publications_examination_id_fkey"
            columns: ["examination_id"]
            isOneToOne: false
            referencedRelation: "examinations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          full_name: string
          id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          full_name?: string
          id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      pyqs: {
        Row: {
          class_id: string
          created_at: string
          file_path: string
          id: string
          subject_id: string
          title: string
          uploaded_by: string
          year: number
        }
        Insert: {
          class_id: string
          created_at?: string
          file_path: string
          id?: string
          subject_id: string
          title: string
          uploaded_by: string
          year: number
        }
        Update: {
          class_id?: string
          created_at?: string
          file_path?: string
          id?: string
          subject_id?: string
          title?: string
          uploaded_by?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "pyqs_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pyqs_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pyqs_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          class_id: string
          id: string
          name: string
        }
        Insert: {
          class_id: string
          id?: string
          name: string
        }
        Update: {
          class_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          active: boolean
          full_name: string
          id: string
          is_demo: boolean
          profile_id: string | null
          section_id: string
          session_id: string
          uid: string
        }
        Insert: {
          active?: boolean
          full_name: string
          id?: string
          is_demo?: boolean
          profile_id?: string | null
          section_id: string
          session_id: string
          uid: string
        }
        Update: {
          active?: boolean
          full_name?: string
          id?: string
          is_demo?: boolean
          profile_id?: string | null
          section_id?: string
          session_id?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "academic_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          id: string
          name: string
        }
        Insert: {
          code: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      teacher_assignments: {
        Row: {
          id: string
          section_id: string
          subject_id: string
          teacher_id: string
        }
        Insert: {
          id?: string
          section_id: string
          subject_id: string
          teacher_id: string
        }
        Update: {
          id?: string
          section_id?: string
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          active: boolean
          full_name: string
          id: string
          is_demo: boolean
          profile_id: string | null
          username: string
        }
        Insert: {
          active?: boolean
          full_name: string
          id?: string
          is_demo?: boolean
          profile_id?: string | null
          username: string
        }
        Update: {
          active?: boolean
          full_name?: string
          id?: string
          is_demo?: boolean
          profile_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_read_pyq_file: { Args: { _path: string }; Returns: boolean }
      can_read_sheet: { Args: { _sheet: string }; Returns: boolean }
      can_upload_pyq: {
        Args: { _class: string; _subject: string }
        Returns: boolean
      }
      demo_overview: { Args: never; Returns: Json }
      exam_validation: { Args: { _exam: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_assigned: { Args: { _section: string }; Returns: boolean }
      portal_snapshot: { Args: never; Returns: Json }
      publish_examination: { Args: { _exam: string }; Returns: Json }
      reopen_sheet: { Args: { _sheet: string }; Returns: undefined }
      run_scheduled_publication: { Args: { _exam: string }; Returns: undefined }
      schedule_examination: {
        Args: { _at: string; _exam: string }
        Returns: undefined
      }
      student_subject_names: { Args: never; Returns: Json }
      teaches: {
        Args: { _section: string; _subject: string }
        Returns: boolean
      }
      unpublish_examination: { Args: { _exam: string }; Returns: undefined }
      write_marks: {
        Args: { _entries: Json; _sheet: string; _submit?: boolean }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "teacher", "student"],
    },
  },
} as const
