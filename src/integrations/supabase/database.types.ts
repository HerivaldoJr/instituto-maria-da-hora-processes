export type UserRole = 'ti_admin' | 'presidencia' | 'diretoria' | 'coordenacao' | 'liderado';
export type Department = 'financeiro' | 'rh' | 'licitacao' | 'dp' | 'ti' | 'presidencia' | 'diretoria' | 'gestar';
export type ProcessStatus = 'aberto' | 'em_analise' | 'aguardando_aprovacao' | 'em_execucao' | 'concluido' | 'arquivado';
export type ProcessPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type ProcessModule = 'rh' | 'financeiro' | 'licitacao' | 'dp';
export type TimelineEventType = 'criacao' | 'tramitacao' | 'analise' | 'aprovacao' | 'rejeicao' | 'execucao' | 'conclusao' | 'comentario' | 'documento' | 'edicao';
export type NotificationType = 'info' | 'warning' | 'success' | 'urgent';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          department: Department;
          avatar_url: string | null;
          active: boolean;
          cargo: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      processes: {
        Row: {
          id: string;
          nup: string;
          title: string;
          description: string;
          module: ProcessModule;
          status: ProcessStatus;
          priority: ProcessPriority;
          assigned_to: string | null;
          created_by: string;
          department: Department;
          current_department: Department;
          deadline: string | null;
          value: number | null;
          confidential: boolean;
          confidential_by: string | null;
          pending_acceptance: boolean;
          pending_acceptance_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['processes']['Row']> & {
          title: string;
          description: string;
          module: ProcessModule;
          department: Department;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['processes']['Row']>;
      };
      timeline_events: {
        Row: {
          id: string;
          process_id: string;
          action: string;
          user_name: string;
          department: string;
          description: string;
          event_type: TimelineEventType;
          from_department: string | null;
          to_department: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['timeline_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['timeline_events']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          process_id: string;
          name: string;
          file_type: string;
          size: string;
          uploaded_by: string;
          file_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          process_id: string;
          user_name: string;
          text: string;
          department: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          message: string;
          notification_type: NotificationType;
          read: boolean;
          process_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      colaboradores: {
        Row: {
          id: string;
          user_id: string;
          cpf: string;
          rg: string;
          data_nascimento: string;
          data_admissao: string;
          cargo: string;
          salario: number;
          endereco: string;
          telefone: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['colaboradores']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['colaboradores']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: UserRole;
      department_type: Department;
      process_status: ProcessStatus;
      process_priority: ProcessPriority;
      process_module: ProcessModule;
      timeline_event_type: TimelineEventType;
      notification_type: NotificationType;
    };
  };
}
