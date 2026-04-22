import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useSlaAlerts } from '@/hooks/useSlaAlerts';
import { Process, ProcessStatus, Notification, ProcessModule, ProcessPriority, Department, departmentLabels, ProcessCategory } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';

interface ProcessContextType {
  processes: Process[];
  notifications: Notification[];
  categories: ProcessCategory[];
  updateProcessStatus: (processId: string, newStatus: ProcessStatus, userName: string, userDepartment: string) => void;
  addComment: (processId: string, user: string, text: string, department?: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  addProcess: (process: Omit<Process, 'id' | 'nup' | 'timeline' | 'documents' | 'comments'> & { documents?: Process['documents'] }) => void;
  approveProcess: (processId: string, userName: string) => void;
  rejectProcess: (processId: string, userName: string, reason: string) => void;
  tramitarProcess: (processId: string, toDepartment: Department, userName: string, fromDepartment: string, description: string) => void;
  addDocument: (processId: string, doc: Process['documents'][0], userName: string, fileBlob?: File) => void;
  addTimelineEvent: (processId: string, event: Omit<Process['timeline'][0], 'id'>) => void;
  editProcess: (processId: string, updates: Partial<Pick<Process, 'title' | 'description' | 'priority' | 'deadline' | 'value' | 'categoryId' | 'projectName' | 'resourceSource'>>, userName: string) => void;
  toggleConfidential: (processId: string, userName: string) => void;
  deleteProcess: (processId: string, userName: string) => void;
  acceptProcess: (processId: string, userName: string, userDepartment: Department) => void;
  
  addCategory: (category: Omit<ProcessCategory, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<ProcessCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  loadMoreProcesses: () => Promise<void>;
  loadingMore: boolean;
}

const ProcessContext = createContext<ProcessContextType | null>(null);

const PAGE_SIZE = 30;

function mapSupabaseProcess(p: any, timeline: any[], documents: any[], comments: any[]): Process {
  return {
    id: p.id,
    nup: p.nup,
    title: p.title,
    description: p.description,
    module: p.module,
    status: p.status,
    priority: p.priority,
    assignedTo: p.assigned_to || '',
    createdBy: p.created_by,
    department: p.department,
    currentDepartment: p.current_department || p.department,
    createdAt: p.created_at?.split('T')[0] || p.created_at,
    updatedAt: p.updated_at?.split('T')[0] || p.updated_at,
    deadline: p.deadline || '',
    categoryId: p.category_id || undefined,
    projectName: p.project_name || undefined,
    resourceSource: p.resource_source || undefined,
    value: p.value || undefined,
    confidential: p.confidential || false,
    confidentialBy: p.confidential_by || undefined,
    pendingAcceptance: p.pending_acceptance || false,
    pendingAcceptanceBy: p.pending_acceptance_by || undefined,
    timeline: (timeline || []).map((t: any) => ({
      id: t.id,
      action: t.action,
      user: t.user_name,
      department: t.department,
      date: t.created_at,
      description: t.description,
      type: t.event_type,
      fromDepartment: t.from_department || undefined,
      toDepartment: t.to_department || undefined,
    })),
    documents: (documents || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      type: d.file_type,
      size: d.size,
      uploadedBy: d.uploaded_by,
      uploadedAt: d.created_at?.split('T')[0] || d.created_at,
      fileUrl: d.file_url || undefined,
    })),
    comments: (comments || []).map((c: any) => ({
      id: c.id,
      user: c.user_name,
      text: c.text,
      date: c.created_at,
      department: c.department || undefined,
    })),
  };
}

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<ProcessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const initDone = useRef(false);

  const fetchPage = useCallback(async (pageIndex: number) => {
    try {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: procs, error: procErr } = await supabase.from('processes')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (procErr || !procs) {
        throw procErr;
      }

      if (procs.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (procs.length === 0) {
        if (pageIndex === 0) setProcesses([]);
        return;
      }

      const processIds = procs.map(p => p.id);

      const [timelineRes, docsRes, commentsRes, notifsRes, categoriesRes] = await Promise.all([
        supabase.from('timeline_events').select('*').in('process_id', processIds).order('created_at'),
        supabase.from('documents').select('*').in('process_id', processIds).order('created_at'),
        supabase.from('comments').select('*').in('process_id', processIds).order('created_at'),
        pageIndex === 0 ? supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
        pageIndex === 0 ? supabase.from('process_categories').select('*').order('name') : Promise.resolve({ data: null }),
      ]);

      const timelineByProcess = new Map<string, any[]>();
      (timelineRes.data || []).forEach((t: any) => {
        if (!timelineByProcess.has(t.process_id)) timelineByProcess.set(t.process_id, []);
        timelineByProcess.get(t.process_id)!.push(t);
      });

      const docsByProcess = new Map<string, any[]>();
      (docsRes.data || []).forEach((d: any) => {
        if (!docsByProcess.has(d.process_id)) docsByProcess.set(d.process_id, []);
        docsByProcess.get(d.process_id)!.push(d);
      });

      const commentsByProcess = new Map<string, any[]>();
      (commentsRes.data || []).forEach((c: any) => {
        if (!commentsByProcess.has(c.process_id)) commentsByProcess.set(c.process_id, []);
        commentsByProcess.get(c.process_id)!.push(c);
      });

      const mappedProcesses = procs.map((p: any) =>
        mapSupabaseProcess(p, timelineByProcess.get(p.id) || [], docsByProcess.get(p.id) || [], commentsByProcess.get(p.id) || [])
      );

      if (pageIndex === 0) {
        setProcesses(mappedProcesses);
        if (categoriesRes.data) {
          setCategories(categoriesRes.data.map((c: any) => ({
            id: c.id, module: c.module, name: c.name, active: c.active 
          })));
        }
        if (notifsRes.data && notifsRes.data.length > 0) {
          setNotifications(notifsRes.data.map((n: any) => ({
            id: n.id, title: n.title, message: n.message, type: n.notification_type, read: n.read, date: n.created_at, processId: n.process_id || undefined,
          })));
        }
      } else {
        setProcesses(prev => {
          const newOrUpdated = [...prev];
          mappedProcesses.forEach(mp => {
            const idx = newOrUpdated.findIndex(x => x.id === mp.id);
            if (idx >= 0) newOrUpdated[idx] = mp;
            else newOrUpdated.push(mp);
          });
          return newOrUpdated;
        });
      }
    } catch (err) {
      console.error('Supabase query failed:', err);
    }
  }, []);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    fetchPage(0).finally(() => setLoading(false));
  }, [fetchPage]);

  const loadMoreProcesses = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchPage(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const addNotification = useCallback((title: string, message: string, type: Notification['type'], processId?: string) => {
    const notif: Notification = {
      id: `n${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
      title, message, type, read: false,
      date: new Date().toISOString(),
      processId,
    };
    setNotifications(prev => [notif, ...prev]);
    supabase.from('notifications').insert({
      title, message, notification_type: type, read: false, process_id: processId || null, user_id: null,
    }).then();
  }, []);

  const updateProcessStatus = useCallback((processId: string, newStatus: ProcessStatus, userName: string, userDepartment: string) => {
    setProcesses(prev => prev.map(p =>
      p.id === processId ? {
        ...p, status: newStatus, updatedAt: new Date().toISOString().split('T')[0],
        timeline: [...p.timeline, { id: `t${Date.now()}`, action: `Status alterado para ${newStatus}`, user: userName, department: userDepartment, date: new Date().toISOString(), description: `Status do processo alterado para ${newStatus} por ${userName}.`, type: 'edicao' as const }],
      } : p
    ));
    supabase.from('processes').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', processId).then();
    supabase.from('timeline_events').insert({ process_id: processId, action: `Status alterado para ${newStatus}`, user_name: userName, department: userDepartment, description: `Status do processo alterado para ${newStatus} por ${userName}.`, event_type: 'edicao' }).then();
  }, []);

  const addComment = useCallback((processId: string, user: string, text: string, department?: string) => {
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, comments: [...p.comments, { id: `c${Date.now()}`, user, text, date: new Date().toISOString(), department }] } : p));
    supabase.from('comments').insert({ process_id: processId, user_name: user, text, department: department || null }).then();
    supabase.from('timeline_events').insert({ process_id: processId, action: 'Comentário adicionado', user_name: user, department: department || '', description: text.substring(0, 80), event_type: 'comentario' }).then();
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    supabase.from('notifications').update({ read: true }).eq('id', notificationId).then();
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    supabase.from('notifications').update({ read: true }).eq('read', false).then();
  }, []);

  const addProcess = useCallback((data: Omit<Process, 'id' | 'nup' | 'timeline' | 'documents' | 'comments'> & { documents?: Process['documents'] }) => {
    const tempId = `p${Date.now()}`;
    const newProcess: Process = {
      ...data, id: tempId, nup: `IMH-TEMP`, currentDepartment: data.currentDepartment || data.department,
      timeline: [{ id: `t${Date.now()}`, action: 'Processo criado', user: data.createdBy, department: departmentLabels[data.department] || data.department, date: new Date().toISOString(), description: 'Processo registrado no sistema.', type: 'criacao' }],
      documents: data.documents || [], comments: [],
    };
    setProcesses(prev => [newProcess, ...prev]);
    addNotification('Novo processo', `Um processo foi criado por ${data.createdBy}.`, 'info');

    supabase.from('processes').insert({
      title: newProcess.title, description: newProcess.description, module: newProcess.module, status: newProcess.status, priority: newProcess.priority,
      assigned_to: newProcess.assignedTo || null, created_by: newProcess.createdBy, department: newProcess.department, current_department: newProcess.currentDepartment,
      deadline: newProcess.deadline || null, value: newProcess.value || null,
      category_id: newProcess.categoryId || null, project_name: newProcess.projectName || null, resource_source: newProcess.resourceSource || null,
    }).select().single().then(({ data: created, error }) => {
      if (created) {
        setProcesses(prev => prev.map(p => p.id === tempId ? { ...p, id: created.id, nup: created.nup } : p));
        supabase.from('timeline_events').insert({ process_id: created.id, action: 'Processo criado', user_name: data.createdBy, department: departmentLabels[data.department] || data.department, description: 'Processo registrado no sistema.', event_type: 'criacao' }).then();
      } else {
        console.error("Failed to insert process", error);
      }
    });
  }, [addNotification]);

  const approveProcess = useCallback((processId: string, userName: string) => {
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, status: 'em_execucao' as ProcessStatus, updatedAt: new Date().toISOString().split('T')[0] } : p));
    addNotification('Processo aprovado', `Processo foi aprovado por ${userName}.`, 'success', processId);
    supabase.from('processes').update({ status: 'em_execucao', updated_at: new Date().toISOString() }).eq('id', processId).then();
    supabase.from('timeline_events').insert({ process_id: processId, action: 'Aprovado', user_name: userName, department: 'Presidência', description: `Processo aprovado por ${userName}.`, event_type: 'aprovacao' }).then();
  }, [addNotification]);

  const rejectProcess = useCallback((processId: string, userName: string, reason: string) => {
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, status: 'aberto' as ProcessStatus, currentDepartment: p.department } : p));
    addNotification('Processo rejeitado', `Processo foi rejeitado: ${reason}`, 'warning', processId);
    const proc = processes.find(p => p.id === processId);
    supabase.from('processes').update({ status: 'aberto', current_department: proc?.department, updated_at: new Date().toISOString() }).eq('id', processId).then();
    supabase.from('timeline_events').insert({ process_id: processId, action: 'Rejeitado', user_name: userName, department: 'Presidência', description: `Processo rejeitado: ${reason}`, event_type: 'rejeicao' }).then();
  }, [addNotification, processes]);

  const tramitarProcess = useCallback((processId: string, toDepartment: Department, userName: string, fromDepartment: string, description: string) => {
    const toDeptLabel = departmentLabels[toDepartment] || toDepartment;
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, currentDepartment: toDepartment, status: p.status === 'aberto' ? 'em_analise' : p.status, pendingAcceptance: true, pendingAcceptanceBy: toDeptLabel } : p));
    addNotification('Processo tramitado', `Processo tramitado de ${fromDepartment} para ${toDeptLabel} por ${userName}.`, 'info', processId);
    const proc = processes.find(p => p.id === processId);
    supabase.from('processes').update({ current_department: toDepartment, status: proc?.status === 'aberto' ? 'em_analise' : proc?.status, pending_acceptance: true, pending_acceptance_by: toDeptLabel, updated_at: new Date().toISOString() }).eq('id', processId).then();
    supabase.from('timeline_events').insert({ process_id: processId, action: `Tramitado para ${toDeptLabel}`, user_name: userName, department: fromDepartment, description, event_type: 'tramitacao', from_department: fromDepartment, to_department: toDeptLabel }).then();
  }, [addNotification, processes]);

  const acceptProcess = useCallback((processId: string, userName: string, userDepartment: Department) => {
    const process = processes.find(p => p.id === processId);
    if (!process || !process.pendingAcceptance || process.currentDepartment !== userDepartment) return;
    const userDepartmentLabel = departmentLabels[userDepartment] || userDepartment;
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, pendingAcceptance: false, pendingAcceptanceBy: undefined } : p));
    addNotification('Recebimento confirmado', `${userName} confirmou recebimento do processo.`, 'success', processId);
    supabase.from('processes').update({ pending_acceptance: false, pending_acceptance_by: null, updated_at: new Date().toISOString() }).eq('id', processId).then();
    supabase.from('timeline_events').insert({ process_id: processId, action: 'Recebimento confirmado', user_name: userName, department: userDepartmentLabel, description: `${userName} confirmou o recebimento do processo.`, event_type: 'analise' }).then();
  }, [addNotification, processes]);

  const addDocument = useCallback(async (processId: string, doc: Process['documents'][0], userName: string, fileBlob?: File) => {
    let fileUrl = '';
    
    if (fileBlob) {
      const fileName = `${processId}/${Date.now()}_${doc.name}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage.from('documents').upload(fileName, fileBlob);
      if (uploadErr) {
        console.error("Storage upload error:", uploadErr);
      } else {
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
        fileUrl = publicUrl;
      }
    }

    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, documents: [...p.documents, { ...doc, fileUrl }] } : p));
    
    await supabase.from('documents').insert({ process_id: processId, name: doc.name, file_type: doc.type, size: doc.size, uploaded_by: userName, file_url: fileUrl || null });
    await supabase.from('timeline_events').insert({ process_id: processId, action: 'Documento anexado', user_name: userName, department: '', description: `Documento "${doc.name}" anexado.`, event_type: 'documento' });
  }, []);

  const addTimelineEvent = useCallback((processId: string, event: Omit<Process['timeline'][0], 'id'>) => {
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, timeline: [...p.timeline, { ...event, id: `t${Date.now()}` }] } : p));
    supabase.from('timeline_events').insert({ process_id: processId, action: event.action, user_name: event.user, department: event.department, description: event.description, event_type: event.type || 'edicao', from_department: event.fromDepartment || null, to_department: event.toDepartment || null }).then();
  }, []);

  const editProcess = useCallback((processId: string, updates: Partial<Pick<Process, 'title' | 'description' | 'priority' | 'deadline' | 'value' | 'categoryId' | 'projectName' | 'resourceSource'>>, userName: string) => {
    const changes = Object.keys(updates).join(', ');
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, ...updates } : p));
    const dbUpdates: Record<string, unknown> = { 
      updated_at: new Date().toISOString(), 
      title: updates.title, description: updates.description, priority: updates.priority, deadline: updates.deadline, value: updates.value,
      category_id: updates.categoryId, project_name: updates.projectName, resource_source: updates.resourceSource 
    };
    // remove undefined
    Object.keys(dbUpdates).forEach(k => dbUpdates[k] === undefined && delete dbUpdates[k]);
    
    supabase.from('processes').update(dbUpdates).eq('id', processId).then();
    supabase.from('timeline_events').insert({ process_id: processId, action: 'Processo editado', user_name: userName, department: '', description: `Campos alterados: ${changes}`, event_type: 'edicao' }).then();
  }, []);

  const toggleConfidential = useCallback((processId: string, userName: string) => {
    const proc = processes.find(p => p.id === processId);
    setProcesses(prev => prev.map(p => p.id === processId ? { ...p, confidential: !p.confidential, confidentialBy: !p.confidential ? userName : undefined } : p));
    supabase.from('processes').update({ confidential: !proc?.confidential, confidential_by: !proc?.confidential ? userName : null, updated_at: new Date().toISOString() }).eq('id', processId).then();
  }, [processes]);

  const deleteProcess = useCallback((processId: string, userName: string) => {
    setProcesses(prev => prev.filter(p => p.id !== processId));
    addNotification('Processo excluído', `Processo excluído por ${userName}.`, 'warning');
    supabase.from('processes').delete().eq('id', processId).then();
  }, [addNotification]);

  const addCategory = useCallback(async (category: Omit<ProcessCategory, 'id'>) => {
    const { data } = await supabase.from('process_categories').insert({
      module: category.module, name: category.name, active: category.active
    }).select().single();
    if (data) {
      setCategories(prev => [...prev, { id: data.id, module: data.module, name: data.name, active: data.active }]);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<ProcessCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    await supabase.from('process_categories').update(updates).eq('id', id);
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    await supabase.from('process_categories').delete().eq('id', id);
  }, []);

  useSlaAlerts({ processes, addNotification });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ProcessContext.Provider value={{
      processes, notifications, categories, updateProcessStatus, addComment, markNotificationRead,
      markAllNotificationsRead, addProcess, approveProcess, rejectProcess, tramitarProcess,
      addDocument, addTimelineEvent, editProcess, toggleConfidential, deleteProcess,
      acceptProcess, addCategory, updateCategory, deleteCategory, unreadCount, loading, hasMore, loadMoreProcesses, loadingMore
    }}>
      {children}
    </ProcessContext.Provider>
  );
};

export const useProcesses = () => {
  const ctx = useContext(ProcessContext);
  if (!ctx) throw new Error('useProcesses must be used within ProcessProvider');
  return ctx;
};
