import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './client';

// ============ PROFILES ============

export const useProfiles = () =>
  useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

export const useProfile = (userId: string) =>
  useQuery({
    queryKey: ['profiles', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

// ============ PROCESSES ============

export const useSupabaseProcesses = () =>
  useQuery({
    queryKey: ['processes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('processes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useProcessTimeline = (processId: string) =>
  useQuery({
    queryKey: ['timeline', processId],
    queryFn: async () => {
      const { data, error } = await supabase.from('timeline_events').select('*').eq('process_id', processId).order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!processId,
  });

export const useProcessDocuments = (processId: string) =>
  useQuery({
    queryKey: ['documents', processId],
    queryFn: async () => {
      const { data, error } = await supabase.from('documents').select('*').eq('process_id', processId).order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!processId,
  });

export const useProcessComments = (processId: string) =>
  useQuery({
    queryKey: ['comments', processId],
    queryFn: async () => {
      const { data, error } = await supabase.from('comments').select('*').eq('process_id', processId).order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!processId,
  });

// ============ NOTIFICATIONS ============

export const useNotifications = (userId?: string) =>
  useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

// ============ MUTATIONS ============

export const useCreateProcess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (process: Record<string, unknown>) => {
      const { data, error } = await supabase.from('processes').insert(process).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['processes'] }),
  });
};

export const useUpdateProcess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { data, error } = await supabase.from('processes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['processes'] }),
  });
};

export const useDeleteProcess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('processes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['processes'] }),
  });
};

export const useAddTimelineEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: Record<string, unknown>) => {
      const { data, error } = await supabase.from('timeline_events').insert(event).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['timeline', vars.process_id as string] });
    },
  });
};

export const useAddDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (doc: Record<string, unknown>) => {
      const { data, error } = await supabase.from('documents').insert(doc).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['documents', vars.process_id as string] });
    },
  });
};

export const useAddComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (comment: Record<string, unknown>) => {
      const { data, error } = await supabase.from('comments').insert(comment).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['comments', vars.process_id as string] });
    },
  });
};

export const useAddNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notification: Record<string, unknown>) => {
      const { data, error } = await supabase.from('notifications').insert(notification).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('notifications').update({ read: true }).or(`user_id.eq.${userId},user_id.is.null`);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
};
