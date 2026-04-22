import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import { statusLabels, priorityLabels, moduleLabels, mockUsers } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Eye, Clock, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'sonner';

const ApprovalsPage = () => {
  const { user } = useAuth();
  const { processes, approveProcess, rejectProcess } = useProcesses();
  const navigate = useNavigate();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!user) return null;

  const pendingProcesses = processes.filter(p => p.status === 'aguardando_aprovacao');

  const handleApprove = (processId: string) => {
    approveProcess(processId, user.name);
    toast.success('Processo aprovado com sucesso!');
  };

  const handleReject = (processId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Informe o motivo da rejeição.');
      return;
    }
    rejectProcess(processId, user.name, rejectReason.trim());
    setRejectingId(null);
    setRejectReason('');
    toast.success('Processo rejeitado.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Aprovações Pendentes</h1>
        <p className="text-muted-foreground text-sm">
          {pendingProcesses.length} processo{pendingProcesses.length !== 1 ? 's' : ''} aguardando sua aprovação
        </p>
      </div>

      {pendingProcesses.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle2 className="w-16 h-16 text-success/30 mb-4" />
          <h3 className="text-lg font-heading font-semibold text-foreground">Tudo em dia!</h3>
          <p className="text-muted-foreground text-sm mt-1">Não há processos aguardando aprovação.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pendingProcesses.map((p, i) => {
            const creator = mockUsers.find(u => u.id === p.createdBy);
            const assignee = mockUsers.find(u => u.id === p.assignedTo);
            const daysWaiting = Math.round((Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24));

            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Header */}
                <div className={`px-5 py-4 border-b border-border/50 ${
                  p.priority === 'urgente' ? 'bg-destructive/5 border-l-4 border-l-destructive' :
                  p.priority === 'alta' ? 'bg-warning/5 border-l-4 border-l-warning' : ''
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-muted-foreground mb-1">{p.nup}</p>
                      <h3 className="text-base font-heading font-semibold text-foreground">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {p.priority === 'urgente' && <AlertTriangle className="w-5 h-5 text-destructive" />}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        p.priority === 'urgente' ? 'bg-destructive/10 text-destructive' :
                        p.priority === 'alta' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>{priorityLabels[p.priority]}</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-border/30">
                  <div>
                    <p className="text-muted-foreground">Módulo</p>
                    <p className="font-medium text-foreground mt-0.5">{moduleLabels[p.module]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Solicitante</p>
                    <p className="font-medium text-foreground mt-0.5">{creator?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Responsável</p>
                    <p className="font-medium text-foreground mt-0.5">{assignee?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Aguardando</p>
                    <p className="font-medium text-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {daysWaiting} dia{daysWaiting !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {p.value && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Valor</p>
                      <p className="font-medium text-foreground mt-0.5">R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 py-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => navigate(`/processos/${p.id}`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Eye className="w-3.5 h-3.5" /> Ver Detalhes
                  </button>
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => setRejectingId(rejectingId === p.id ? null : p.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Rejeitar
                    </button>
                    <button onClick={() => handleApprove(p.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-success text-success-foreground hover:opacity-90 transition-opacity">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                    </button>
                  </div>
                </div>

                {/* Reject reason */}
                <AnimatePresence>
                  {rejectingId === p.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-5 py-3 border-t border-border/50 bg-destructive/5">
                        <label className="text-xs font-medium text-foreground mb-1.5 block">Motivo da rejeição *</label>
                        <div className="flex gap-2">
                          <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleReject(p.id)}
                            placeholder="Informe o motivo..."
                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-destructive/30" />
                          <button onClick={() => handleReject(p.id)}
                            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90">
                            Confirmar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;
