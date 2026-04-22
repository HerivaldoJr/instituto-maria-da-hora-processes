import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import { statusLabels, priorityLabels, moduleLabels, ProcessStatus, ProcessModule, departmentLabels } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ArrowRightLeft, Trash2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

function getVisibleProcesses(processes: any[], user: any) {
  if (user.role === 'ti_admin') return processes;
  if (user.role === 'presidencia') return processes;
  if (user.role === 'diretoria') return processes;
  if (user.role === 'coordenacao') {
    return processes.filter((p: any) =>
      p.department === user.department ||
      p.currentDepartment === user.department ||
      (user.department === 'gestar' && p.module === 'licitacao')
    );
  }
  return processes.filter((p: any) => p.assignedTo === user.id || p.createdBy === user.id);
}

const ProcessListPage = () => {
  const { user } = useAuth();
  const { processes, deleteProcess, hasMore, loadMoreProcesses, loadingMore } = useProcesses();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProcessStatus | 'all'>('all');
  const [filterModule, setFilterModule] = useState<ProcessModule | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!user) return null;

  const isAdmin = user.role === 'ti_admin';

  const visibleProcesses = getVisibleProcesses(processes, user)
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .filter(p => filterModule === 'all' || p.module === filterModule)
    .filter(p => {
      if (!search) return true;
      const s = search.toLowerCase();
      return p.title.toLowerCase().includes(s) || p.nup.toLowerCase().includes(s) || p.description.toLowerCase().includes(s);
    });

  const handleDelete = (e: React.MouseEvent, processId: string) => {
    e.stopPropagation();
    deleteProcess(processId, user.name);
    setDeleteConfirm(null);
    toast.success('Processo excluído.');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-foreground">Processos</h1>
        <button onClick={() => navigate('/novo-processo')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          <FileText className="w-4 h-4" /> Novo Processo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por NUP, título ou descrição..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ProcessStatus | 'all')}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
          <option value="all">Todos os Status</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value as ProcessModule | 'all')}
          className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
          <option value="all">Todos os Módulos</option>
          {Object.entries(moduleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-heading font-semibold text-foreground">NUP</th>
                <th className="text-left px-4 py-3 font-heading font-semibold text-foreground">Título</th>
                <th className="text-left px-4 py-3 font-heading font-semibold text-foreground hidden md:table-cell">Módulo</th>
                <th className="text-left px-4 py-3 font-heading font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-heading font-semibold text-foreground hidden lg:table-cell">Localização</th>
                <th className="text-left px-4 py-3 font-heading font-semibold text-foreground hidden lg:table-cell">Prioridade</th>
                <th className="text-left px-4 py-3 font-heading font-semibold text-foreground hidden lg:table-cell">Prazo</th>
                {isAdmin && <th className="px-4 py-3 text-right font-heading font-semibold text-foreground">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {visibleProcesses.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/processos/${p.id}`)}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.nup}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-foreground truncate max-w-[300px]">{p.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{p.description}</p>
                      </div>
                      {p.confidential && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/5 text-destructive">🔒</span>}
                      {p.pendingAcceptance && p.currentDepartment === user.department && <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning">📥</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {moduleLabels[p.module].split(' ')[0]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      p.status === 'concluido' ? 'bg-success/10 text-success' :
                      p.status === 'aguardando_aprovacao' ? 'bg-warning/10 text-warning' :
                      p.status === 'em_analise' || p.status === 'em_execucao' ? 'bg-info/10 text-info' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {statusLabels[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs flex items-center gap-1 text-primary">
                      <ArrowRightLeft className="w-3 h-3" />
                      {departmentLabels[p.currentDepartment] || p.currentDepartment}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs ${
                      p.priority === 'urgente' ? 'text-destructive font-semibold' :
                      p.priority === 'alta' ? 'text-warning font-medium' :
                      'text-muted-foreground'
                    }`}>
                      {priorityLabels[p.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                    {new Date(p.deadline).toLocaleDateString('pt-BR')}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      {deleteConfirm === p.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={e => handleDelete(e, p.id)}
                            className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded">Excluir</button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs border border-border rounded">Não</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(p.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {visibleProcesses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Nenhum processo encontrado</p>
          </div>
        )}
        {hasMore && visibleProcesses.length > 0 && (
          <div className="py-5 flex justify-center border-t border-border bg-muted/10">
            <button
              onClick={loadMoreProcesses}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-xl border border-primary text-primary font-medium text-sm hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? 'Carregando...' : 'Carregar mais processos [+]'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessListPage;
