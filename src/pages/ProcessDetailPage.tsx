import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import {
  statusLabels, priorityLabels, moduleLabels, ProcessStatus, Department,
  departmentLabels, mockUsers, countBusinessDays
} from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FileText, MessageSquare, Clock, Paperclip, Send, Printer,
  ChevronRight, ArrowRightLeft, Upload, Edit3,
  AlertTriangle, Building2, User, Calendar, DollarSign, Hash, Shield,
  X, Save, Lock, LockOpen, Eye, Download, Info, Trash2, CheckCircle, Tag, Wallet, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import logoCircular from '@/assets/logo-circular.jpg';

const timelineTypeConfig: Record<string, { icon: string; color: string }> = {
  criacao: { icon: '🟢', color: 'bg-success/10 border-success/30' },
  tramitacao: { icon: '🔄', color: 'bg-info/10 border-info/30' },
  analise: { icon: '🔍', color: 'bg-warning/10 border-warning/30' },
  aprovacao: { icon: '✅', color: 'bg-success/10 border-success/30' },
  rejeicao: { icon: '❌', color: 'bg-destructive/10 border-destructive/30' },
  execucao: { icon: '⚡', color: 'bg-info/10 border-info/30' },
  conclusao: { icon: '🏁', color: 'bg-success/10 border-success/30' },
  comentario: { icon: '💬', color: 'bg-muted border-border' },
  documento: { icon: '📎', color: 'bg-muted border-border' },
  edicao: { icon: '✏️', color: 'bg-muted border-border' },
};

const statusColor: Record<string, string> = {
  aberto: 'bg-secondary text-secondary-foreground',
  em_analise: 'bg-info/10 text-info border border-info/20',
  aguardando_aprovacao: 'bg-warning/10 text-warning border border-warning/20',
  em_execucao: 'bg-primary/10 text-primary border border-primary/20',
  concluido: 'bg-success/10 text-success border border-success/20',
  arquivado: 'bg-muted text-muted-foreground',
  ganha: 'bg-success/20 text-success-foreground border border-success/30 font-bold',
  perdida: 'bg-destructive/20 text-destructive-foreground border border-destructive/30 font-bold',
};

const priorityColor: Record<string, string> = {
  baixa: 'text-muted-foreground',
  media: 'text-foreground',
  alta: 'text-warning',
  urgente: 'text-destructive',
};

const ProcessDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    processes, categories, updateProcessStatus, addComment, tramitarProcess,
    addDocument, editProcess, toggleConfidential, deleteProcess, acceptProcess
  } = useProcesses();
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'comments' | 'info'>('timeline');
  const [newComment, setNewComment] = useState('');
  const [showTramitar, setShowTramitar] = useState(false);
  const [tramitarDept, setTramitarDept] = useState<Department>('financeiro');
  const [tramitarDesc, setTramitarDesc] = useState('');
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const process = processes.find(p => p.id === id);
  if (!process || !user) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Processo não encontrado</p>
    </div>
  );

  if (process.confidential && user.role === 'liderado') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Lock className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground font-medium">Processo confidencial</p>
        <p className="text-sm text-muted-foreground">Você não tem permissão para visualizar este processo.</p>
        <button onClick={() => navigate(-1)} className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Voltar</button>
      </div>
    );
  }

  const creator = mockUsers.find(u => u.id === process.createdBy);
  const assignee = mockUsers.find(u => u.id === process.assignedTo);
  const businessDaysElapsed = countBusinessDays(process.createdAt, new Date().toISOString().split('T')[0]);
  const businessDaysToDeadline = countBusinessDays(new Date().toISOString().split('T')[0], process.deadline);
  const isOverdue = new Date(process.deadline) < new Date() && process.status !== 'concluido' && process.status !== 'arquivado';
  const isAdmin = user.role === 'ti_admin';
  const canEdit = isAdmin || user.role === 'presidencia' || user.role === 'diretoria' ||
    (user.role === 'coordenacao' && (process.department === user.department || process.currentDepartment === user.department));
  const canDelete = isAdmin;
  const canToggleConfidential = isAdmin || user.role === 'coordenacao' || user.role === 'presidencia' || user.role === 'diretoria';
  const canAcceptPending = !!process.pendingAcceptance && process.currentDepartment === user.department;

  const handleComment = () => {
    if (!newComment.trim()) return;
    addComment(process.id, user.name, newComment.trim(), departmentLabels[user.department] || user.department);
    setNewComment('');
    toast.success('Comentário registrado na tramitação.');
  };

  const handleTramitar = () => {
    if (!tramitarDesc.trim()) { toast.error('Informe o motivo da tramitação.'); return; }
    tramitarProcess(process.id, tramitarDept, user.name, departmentLabels[user.department] || user.department, tramitarDesc.trim());
    setShowTramitar(false);
    setTramitarDesc('');
    toast.success(`Processo tramitado para ${departmentLabels[tramitarDept]}.`);
  };

  const handleAddDoc = async () => {
    if (!newDocName.trim() && !selectedFile) return;
    const finalName = selectedFile ? selectedFile.name : (newDocName.trim().includes('.') ? newDocName.trim() : newDocName.trim() + '.pdf');
    const sizeMb = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(1) : (Math.random() * 3 + 0.5).toFixed(1);

    await addDocument(process.id, {
      id: `d${Date.now()}`, name: finalName,
      type: finalName.split('.').pop()?.toUpperCase() || 'PDF',
      size: `${sizeMb} MB`,
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString().split('T')[0],
    }, user.name, selectedFile || undefined);
    
    setNewDocName('');
    setSelectedFile(null);
    setShowAddDoc(false);
    toast.success('Documento anexado e salvo na nuvem.');
  };

  const handleSaveEdit = () => {
    const updates: any = {};
    if (editTitle && editTitle !== process.title) updates.title = editTitle;
    if (editDesc && editDesc !== process.description) updates.description = editDesc;
    if (editPriority && editPriority !== process.priority) updates.priority = editPriority;
    if (editDeadline && editDeadline !== process.deadline) updates.deadline = editDeadline;
    if (Object.keys(updates).length === 0) { setEditing(false); return; }
    editProcess(process.id, updates, user.name);
    setEditing(false);
    toast.success('Processo atualizado.');
  };

  const startEdit = () => {
    setEditTitle(process.title);
    setEditDesc(process.description);
    setEditPriority(process.priority);
    setEditDeadline(process.deadline);
    setEditing(true);
  };

  const handleDelete = () => {
    deleteProcess(process.id, user.name);
    navigate('/processos');
    toast.success('Processo excluído permanentemente.');
  };

  const handleAccept = () => {
    if (!canAcceptPending) {
      toast.error('Somente o setor destinatário pode confirmar o recebimento.');
      return;
    }

    acceptProcess(process.id, user.name, user.department);
    toast.success('Recebimento confirmado!');
  };

  let statusOptions: ProcessStatus[] = ['aberto', 'em_analise', 'aguardando_aprovacao', 'em_execucao', 'concluido', 'arquivado'];
  if (process.module === 'licitacao') {
    statusOptions = ['aberto', 'em_analise', 'aguardando_aprovacao', 'em_execucao', 'ganha', 'perdida', 'arquivado'];
  }

  const getCategoryName = (id?: string) => {
    if (!id) return null;
    return categories.find(c => c.id === id)?.name || id;
  };
  const tabs = [
    { key: 'timeline' as const, label: 'Tramitação', icon: Clock, count: process.timeline.length },
    { key: 'documents' as const, label: 'Documentos', icon: Paperclip, count: process.documents.length },
    { key: 'comments' as const, label: 'Comentários', icon: MessageSquare, count: process.comments.length },
    { key: 'info' as const, label: 'Informações', icon: Info, count: undefined },
  ];

  return (
    <div className="max-w-6xl space-y-5">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area-wrapper { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
          .print-area-wrapper * { visibility: visible; }
          .no-print { display: none !important; }
          .print-header { display: flex !important; margin-bottom: 24px; border-bottom: 2px solid hsl(var(--primary)); padding-bottom: 16px; }
        }
        .print-header { display: none; }
      `}</style>
      <div className="print-area-wrapper">

      {/* Print header */}
      <div className="print-header items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoCircular} alt="IMH" className="w-16 h-16 rounded-full" />
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'hsl(280,60%,45%)' }}>Instituto Maria da Hora</h2>
            <p className="text-xs text-gray-500">Sistema de Tramitação Eletrônica</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold">{process.nup}</p>
          <p className="text-xs text-gray-500">Emitido em {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Top navigation */}
      <div className="no-print flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="hover:text-foreground cursor-pointer" onClick={() => navigate('/processos')}>Processos</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{process.nup}</span>
      </div>

      {/* Pending acceptance banner - only show to receiving department or admin */}
      {canAcceptPending && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="no-print bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📥</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Aguardando confirmação de recebimento</p>
              <p className="text-xs text-muted-foreground">O setor {process.pendingAcceptanceBy} precisa confirmar o recebimento deste processo.</p>
            </div>
          </div>
          <button onClick={handleAccept}
            className="px-4 py-2 rounded-lg bg-warning text-warning-foreground text-sm font-medium hover:opacity-90 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Confirmar Recebimento
          </button>
        </motion.div>
      )}

      {/* === HEADER CARD === */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">{process.nup}</span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[process.status]}`}>
              {statusLabels[process.status]}
            </span>
            {isOverdue && (
              <span className="text-xs px-3 py-1 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Atrasado
              </span>
            )}
            {process.confidential && (
              <span className="text-xs px-3 py-1 rounded-full bg-destructive/5 text-destructive font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Confidencial
              </span>
            )}
            {canAcceptPending && (
              <span className="text-xs px-3 py-1 rounded-full bg-warning/10 text-warning font-medium">📥 Aguardando recebimento</span>
            )}
          </div>
          <div className="no-print flex items-center gap-1.5">
            {canToggleConfidential && (
              <button onClick={() => { toggleConfidential(process.id, user.name); toast.success(process.confidential ? 'Confidencialidade removida.' : 'Processo marcado como confidencial.'); }}
                className={`p-2 rounded-lg transition-colors ${process.confidential ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'hover:bg-muted text-muted-foreground'}`}
                title={process.confidential ? 'Remover confidencialidade' : 'Marcar como confidencial'}>
                {process.confidential ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
              </button>
            )}
            {canEdit && !editing && (
              <button onClick={startEdit} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="Editar">
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {editing && (
              <>
                <button onClick={() => setEditing(false)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
                <button onClick={handleSaveEdit} className="p-2 rounded-lg bg-primary text-primary-foreground"><Save className="w-4 h-4" /></button>
              </>
            )}
            {canDelete && (
              deleteConfirm ? (
                <div className="flex items-center gap-1 bg-destructive/10 rounded-lg px-2 py-1">
                  <span className="text-xs text-destructive font-medium mr-1">Excluir?</span>
                  <button onClick={handleDelete} className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded">Sim</button>
                  <button onClick={() => setDeleteConfirm(false)} className="px-2 py-1 text-xs border border-border rounded">Não</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(true)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Excluir processo">
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}
            <button onClick={() => window.print()} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="Imprimir">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & description */}
        <div className="px-6 py-5">
          {editing ? (
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="text-xl font-heading font-bold text-foreground w-full px-3 py-2 rounded-lg border border-primary/30 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
          ) : (
            <h1 className="text-xl font-heading font-bold text-foreground">{process.title}</h1>
          )}
          {editing ? (
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2}
              className="text-sm text-muted-foreground mt-2 w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          ) : (
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{process.description}</p>
          )}
        </div>

        {/* Metadata grid */}
        <div className="px-6 pb-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              icon: Hash, label: 'Status',
              content: canEdit && !editing ? (
                <select value={process.status}
                  onChange={e => updateProcessStatus(process.id, e.target.value as ProcessStatus, user.name, departmentLabels[user.department])}
                  className="text-sm font-semibold bg-transparent w-full focus:outline-none text-foreground cursor-pointer -ml-1">
                  {statusOptions.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
              ) : <span className="text-sm font-semibold">{statusLabels[process.status]}</span>
            },
            {
              icon: AlertTriangle, label: 'Prioridade',
              content: editing ? (
                <select value={editPriority} onChange={e => setEditPriority(e.target.value)}
                  className="text-sm font-semibold bg-transparent w-full focus:outline-none cursor-pointer -ml-1">
                  {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              ) : <span className={`text-sm font-semibold ${priorityColor[process.priority]}`}>{priorityLabels[process.priority]}</span>
            },
            { icon: Building2, label: 'Módulo', content: <span className="text-sm font-semibold">{moduleLabels[process.module]}</span> },
            {
              icon: Calendar, label: 'Prazo',
              content: editing ? (
                <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)}
                  className="text-sm font-semibold bg-transparent w-full focus:outline-none cursor-pointer -ml-1" />
              ) : <span className={`text-sm font-semibold ${isOverdue ? 'text-destructive' : ''}`}>{new Date(process.deadline).toLocaleDateString('pt-BR')}</span>
            },
            { icon: ArrowRightLeft, label: 'Localização', content: <span className="text-sm font-semibold text-primary">{departmentLabels[process.currentDepartment] || process.currentDepartment}</span> },
            {
              icon: Clock, label: 'Dias úteis',
              content: (
                <div>
                  <span className="text-sm font-semibold">{businessDaysElapsed}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">decorridos</span>
                  {businessDaysToDeadline > 0 && process.status !== 'concluido' && (
                    <p className="text-[10px] text-muted-foreground">{businessDaysToDeadline} restantes</p>
                  )}
                </div>
              )
            },
          ].map(({ icon: Icon, label, content }, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
              </div>
              {content}
            </div>
          ))}
          
          {process.categoryId && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">Categoria</span></div>
              <span className="text-sm font-semibold text-primary">{getCategoryName(process.categoryId)}</span>
            </div>
          )}
          {process.projectName && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">Projeto</span></div>
              <span className="text-sm font-semibold">{process.projectName}</span>
            </div>
          )}
          {process.resourceSource && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">F. Recurso</span></div>
              <span className="text-sm font-semibold">{process.resourceSource}</span>
            </div>
          )}
        </div>

        {/* Participants row */}
        <div className="px-6 pb-5 flex flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 flex-1 min-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Solicitante</p>
              <p className="text-sm font-semibold text-foreground">{creator?.name || 'N/A'}</p>
              <p className="text-[11px] text-muted-foreground">{creator?.cargo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 flex-1 min-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Responsável</p>
              <p className="text-sm font-semibold text-foreground">{assignee?.name || 'N/A'}</p>
              <p className="text-[11px] text-muted-foreground">{assignee?.cargo}</p>
            </div>
          </div>
          {process.value && (
            <div className="flex items-center gap-3 bg-warning/5 rounded-xl px-4 py-3 flex-1 min-w-[200px] border border-warning/10">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Valor</p>
                <p className="text-lg font-heading font-bold text-foreground">
                  R$ {process.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === ACTION BUTTONS === */}
      <div className="no-print flex flex-wrap gap-2">
        {canEdit && (
          <button onClick={() => setShowTramitar(!showTramitar)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm">
            <ArrowRightLeft className="w-4 h-4" /> Tramitar Processo
          </button>
        )}
        <button onClick={() => setShowAddDoc(!showAddDoc)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors">
          <Upload className="w-4 h-4" /> Anexar Documento
        </button>
      </div>

      {/* Tramitar panel */}
      <AnimatePresence>
        {showTramitar && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="no-print overflow-hidden">
            <div className="bg-card rounded-xl border border-primary/20 p-5 space-y-4">
              <h3 className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-primary" /> Tramitar para outro setor
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Setor de destino</label>
                  <select value={tramitarDept} onChange={e => setTramitarDept(e.target.value as Department)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {Object.entries(departmentLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Descrição / Motivo *</label>
                  <input value={tramitarDesc} onChange={e => setTramitarDesc(e.target.value)}
                    placeholder="Informe o motivo da tramitação..."
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowTramitar(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Cancelar</button>
                <button onClick={handleTramitar} className="px-5 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:opacity-90 font-medium">
                  Confirmar Tramitação
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add doc panel */}
      <AnimatePresence>
        {showAddDoc && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="no-print overflow-hidden">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                <input value={newDocName} onChange={e => setNewDocName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddDoc()}
                  placeholder="Nome (opcional)"
                  className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <div className="flex gap-2">
                  <button onClick={handleAddDoc} disabled={!selectedFile && !newDocName} className="px-5 py-2.5 rounded-lg text-sm bg-primary text-primary-foreground hover:opacity-90 font-medium disabled:opacity-50">Anexar</button>
                  <button onClick={() => setShowAddDoc(false)} className="px-3 py-2.5 rounded-lg text-sm border border-border hover:bg-muted"><X className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === TABS CONTENT CARD === */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="no-print border-b border-border px-2">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'timeline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
              {process.timeline.map((event, i) => {
                const config = timelineTypeConfig[event.type || ''] || { icon: '📋', color: 'bg-muted border-border' };
                const isLast = i === process.timeline.length - 1;
                return (
                  <div key={event.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base border ${config.color} ${isLast ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`}>
                        {config.icon}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 min-h-[32px] ${event.type === 'tramitacao' ? 'bg-primary/30' : 'bg-border'}`} />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{event.action}</p>
                        <p className="text-[11px] text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded">
                          {new Date(event.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" /> {event.user} • {event.department}
                      </p>
                      {event.fromDepartment && event.toDepartment && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-medium">{event.fromDepartment}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-primary" />
                          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium">{event.toDepartment}</span>
                        </div>
                      )}
                      <p className="text-sm text-foreground/80 mt-2 bg-muted/40 px-4 py-2.5 rounded-xl leading-relaxed border border-border/50">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              {process.documents.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Nenhum documento anexado</p>
                  <p className="text-xs mt-1 text-muted-foreground/70">Clique em "Anexar Documento" para adicionar</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {process.documents.map((doc, i) => (
                    <motion.div key={doc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors group">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{doc.type} • {doc.size} • {doc.uploadedBy}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</p>
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded hover:bg-muted" title="Visualizar"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                          <button className="p-1.5 rounded hover:bg-muted" title="Download"><Download className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'comments' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {process.comments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Nenhum comentário ainda</p>
                  <p className="text-xs mt-1 text-muted-foreground/70">Todos os comentários ficam registrados na tramitação</p>
                </div>
              )}
              {process.comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{c.user.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{c.user}</p>
                      {c.department && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{c.department}</span>}
                      <p className="text-[11px] text-muted-foreground">{new Date(c.date).toLocaleString('pt-BR')}</p>
                    </div>
                    <p className="text-sm text-foreground/80 mt-1.5 bg-muted/30 px-4 py-2.5 rounded-xl border border-border/50 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-3 border-t border-border">
                <input value={newComment} onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  placeholder="Adicionar comentário (registrado na tramitação)..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={handleComment}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Protocolo (NUP)', process.nup],
                      ['Título', process.title],
                      ['Módulo', moduleLabels[process.module]],
                      ...(process.categoryId ? [['Categoria', getCategoryName(process.categoryId)]] : []),
                      ...(process.projectName ? [['Projeto Vinculado', process.projectName]] : []),
                      ...(process.resourceSource ? [['Fonte de Recurso', process.resourceSource]] : []),
                      ['Departamento de origem', departmentLabels[process.department]],
                      ['Localização atual', departmentLabels[process.currentDepartment] || process.currentDepartment],
                      ['Solicitante', `${creator?.name} (${creator?.cargo})`],
                      ['Responsável', `${assignee?.name} (${assignee?.cargo})`],
                      ['Status', statusLabels[process.status]],
                      ['Prioridade', priorityLabels[process.priority]],
                      ['Data de criação', new Date(process.createdAt).toLocaleDateString('pt-BR')],
                      ['Última atualização', new Date(process.updatedAt).toLocaleDateString('pt-BR')],
                      ['Prazo', new Date(process.deadline).toLocaleDateString('pt-BR')],
                      ['Dias úteis decorridos', `${businessDaysElapsed} dias`],
                      ['Dias úteis restantes', process.status === 'concluido' ? 'Concluído' : `${businessDaysToDeadline} dias`],
                      ['Valor', process.value ? `R$ ${process.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'],
                      ['Confidencial', process.confidential ? `Sim (por ${process.confidentialBy})` : 'Não'],
                      ['Recebimento pendente', process.pendingAcceptance ? `Sim (${process.pendingAcceptanceBy})` : 'Não'],
                      ['Total de tramitações', `${process.timeline.length}`],
                      ['Total de documentos', `${process.documents.length}`],
                      ['Total de comentários', `${process.comments.length}`],
                    ].map(([label, value], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                        <td className="px-5 py-3 text-muted-foreground font-medium w-2/5 border-r border-border/50">{label}</td>
                        <td className="px-5 py-3 text-foreground font-medium">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {process.recurring && (
                <div className="rounded-xl border border-border p-5 bg-muted/10">
                  <h4 className="text-sm font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                    🔄 Demanda Recorrente
                  </h4>
                  <p className="text-sm text-muted-foreground">{process.recurring.description}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Frequência: <span className="font-medium text-foreground">{process.recurring.frequency}</span> •
                    Próximo: <span className="font-medium text-foreground">{new Date(process.recurring.nextDate).toLocaleDateString('pt-BR')}</span>
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProcessDetailPage;
