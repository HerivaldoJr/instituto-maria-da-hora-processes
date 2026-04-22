import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import {
  statusLabels, priorityLabels, moduleLabels, ProcessStatus, ProcessModule,
  departmentLabels, countBusinessDays, Department, mockUsers
} from '@/data/mockData';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GripVertical, ArrowRightLeft, Timer, AlertTriangle, CheckCircle, Clock, Search, Users, Filter } from 'lucide-react';
import { toast } from 'sonner';

// static removed, now inside component

function getTimeInCurrentStatus(process: any): number {
  const now = new Date().toISOString().split('T')[0];
  const statusEvents = [...process.timeline].reverse();
  const lastStatusEvent = statusEvents.find((e: any) =>
    e.type === 'criacao' || e.type === 'tramitacao' || e.type === 'aprovacao' || e.type === 'rejeicao' || e.type === 'edicao'
  );
  const fromDate = lastStatusEvent ? lastStatusEvent.date.split('T')[0].split(' ')[0] : process.createdAt;
  return countBusinessDays(fromDate, now);
}

const KanbanPage = () => {
  const { user } = useAuth();
  const { processes, updateProcessStatus, acceptProcess } = useProcesses();
  const navigate = useNavigate();
  const [filterModule, setFilterModule] = useState<ProcessModule | 'all'>('all');
  const [filterColaborador, setFilterColaborador] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const sectorProcesses = useMemo(() => {
    if (!user) return [];
    let filtered = processes.filter(p => p.status !== 'arquivado');

    if (user.role !== 'ti_admin' && user.role !== 'presidencia' && user.role !== 'diretoria') {
      filtered = filtered.filter(p =>
        p.currentDepartment === user.department ||
        (user.department === 'gestar' && p.module === 'licitacao')
      );
    }

    if (filterModule !== 'all') {
      filtered = filtered.filter(p => p.module === filterModule);
    }

    if (filterColaborador !== 'all') {
      filtered = filtered.filter(p => p.assignedTo === filterColaborador || p.createdBy === filterColaborador);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.nup.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [processes, user, filterModule, filterColaborador, searchQuery]);

  const teamMembers = useMemo(() => {
    if (!user) return [];
    if (user.role === 'ti_admin' || user.role === 'presidencia' || user.role === 'diretoria') {
      return mockUsers.filter(u => u.active);
    }
    return mockUsers.filter(u => u.active && u.department === user.department);
  }, [user]);

  const activeColumns = useMemo(() => {
    let cols: { status: ProcessStatus; label: string; color: string; icon: any }[] = [
      { status: 'aberto', label: 'Recebido', color: 'border-t-muted-foreground', icon: Clock },
      { status: 'em_analise', label: 'Em Análise', color: 'border-t-info', icon: Clock },
      { status: 'aguardando_aprovacao', label: 'Aguard. Aprovação', color: 'border-t-warning', icon: AlertTriangle },
      { status: 'em_execucao', label: 'Em Execução', color: 'border-t-primary', icon: Timer },
      { status: 'concluido', label: 'Concluído', color: 'border-t-success', icon: CheckCircle },
    ];
    if (filterModule === 'licitacao' || filterModule === 'all' || user.department === 'gestar') {
      cols.push(
        { status: 'ganha', label: 'Licitação Ganha', color: 'border-t-success bg-success/5 font-bold', icon: CheckCircle },
        { status: 'perdida', label: 'Licitação Perdida', color: 'border-t-destructive bg-destructive/5 font-bold', icon: AlertTriangle }
      );
    }
    return cols;
  }, [filterModule, user]);

  if (!user) return null;

  const sectorLabel = user.role === 'ti_admin' || user.role === 'presidencia' || user.role === 'diretoria'
    ? 'Todos os Setores'
    : departmentLabels[user.department] || user.department;

  const handleDragStart = (e: React.DragEvent, processId: string) => {
    setDraggedId(processId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: ProcessStatus) => {
    e.preventDefault();
    if (draggedId) {
      updateProcessStatus(draggedId, status, user.name, departmentLabels[user.department]);
      setDraggedId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleAccept = (e: React.MouseEvent, processId: string) => {
    e.stopPropagation();
    acceptProcess(processId, user.name, user.department);
    toast.success('Recebimento confirmado!');
  };

  const modules: { value: ProcessModule | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'rh', label: 'RH' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'licitacao', label: 'Licitação' },
    { value: 'dp', label: 'DP' },
  ];

  // Stats for the header
  const totalInSector = sectorProcesses.length;
  const overdueCount = sectorProcesses.filter(p => new Date(p.deadline) < new Date() && p.status !== 'concluido').length;
  const pendingCount = sectorProcesses.filter(p => p.pendingAcceptance && p.currentDepartment === user.department).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Kanban — {sectorLabel}</h1>
            <p className="text-muted-foreground text-sm">
              {totalInSector} processos • {overdueCount > 0 && <span className="text-destructive font-medium">{overdueCount} atrasados</span>}
              {overdueCount > 0 && ' • '}
              {pendingCount > 0 && <span className="text-warning font-medium">{pendingCount} aguardando recebimento</span>}
              {overdueCount === 0 && pendingCount === 0 && 'Arraste os cards para alterar o status'}
            </p>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar NUP, título..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Module filter */}
          <div className="flex gap-1">
            {modules.map(m => (
              <button key={m.value} onClick={() => setFilterModule(m.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterModule === m.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Colaborador filter (for coordenadores+) */}
          {(user.role === 'ti_admin' || user.role === 'presidencia' || user.role === 'diretoria' || user.role === 'coordenacao') && teamMembers.length > 1 && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterColaborador}
                onChange={e => setFilterColaborador(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">Toda equipe</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {activeColumns.map(col => {
          const colProcesses = sectorProcesses.filter(p => p.status === col.status);
          return (
            <div key={col.status}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.status)}
              className={`kanban-column min-w-[260px] flex-1 border-t-4 ${col.color}`}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-heading font-semibold text-sm text-foreground">{col.label}</h3>
                <span className="text-xs bg-card px-2 py-0.5 rounded-full text-muted-foreground font-medium">
                  {colProcesses.length}
                </span>
              </div>
              <div className="space-y-2">
                {colProcesses.map((p, i) => {
                  const daysInStatus = getTimeInCurrentStatus(p);
                  const isOverdue = new Date(p.deadline) < new Date() && p.status !== 'concluido';
                  const isPendingAcceptance = p.pendingAcceptance && p.currentDepartment === user.department;

                  // Find assigned user name
                  const assignedUser = mockUsers.find(u => u.id === p.assignedTo);

                  return (
                    <motion.div key={p.id}
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      draggable
                      onDragStart={e => handleDragStart(e as unknown as React.DragEvent, p.id)}
                      onClick={() => navigate(`/processos/${p.id}`)}
                      className={`kanban-card ${draggedId === p.id ? 'opacity-50' : ''} ${isOverdue ? 'border-destructive/30' : ''} ${isPendingAcceptance ? 'border-warning/40 bg-warning/5' : ''}`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[11px] text-muted-foreground font-mono">{p.nup}</span>
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 cursor-grab" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-2 line-clamp-2">{p.title}</p>

                      {isPendingAcceptance && (
                        <button onClick={e => handleAccept(e, p.id)}
                          className="w-full mb-2 px-2 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-warning text-[11px] font-medium hover:bg-warning/20 transition-colors flex items-center justify-center gap-1">
                          📥 Confirmar Recebimento
                        </button>
                      )}

                      {/* Assigned user */}
                      {assignedUser && (
                        <div className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                            {assignedUser.name.charAt(0)}
                          </div>
                          {assignedUser.name}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {moduleLabels[p.module].split(' ')[0]}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          p.priority === 'urgente' ? 'bg-destructive/10 text-destructive' :
                          p.priority === 'alta' ? 'bg-warning/10 text-warning' :
                          p.priority === 'media' ? 'bg-info/10 text-info' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {priorityLabels[p.priority]}
                        </span>
                        {p.confidential && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/5 text-destructive">🔒</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1 text-[10px] text-primary">
                          <ArrowRightLeft className="w-3 h-3" />
                          {departmentLabels[p.currentDepartment] || p.currentDepartment}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                            daysInStatus > 5 ? 'bg-destructive/10 text-destructive' :
                            daysInStatus > 3 ? 'bg-warning/10 text-warning' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            <Timer className="w-2.5 h-2.5" /> {daysInStatus}d
                          </span>
                          {isOverdue && <AlertTriangle className="w-3 h-3 text-destructive" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {colProcesses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground/50 text-xs">
                    Nenhum processo
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanPage;
