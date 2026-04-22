import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import { mockUsers, departmentLabels } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Shield, Search, Filter, FileText, User, Clock, ArrowRight } from 'lucide-react';

interface AuditLog {
  id: string;
  date: string;
  user: string;
  department: string;
  action: string;
  processNup: string;
  processTitle: string;
  type: string;
  details: string;
}

const typeColors: Record<string, string> = {
  criacao: 'bg-success/10 text-success',
  tramitacao: 'bg-info/10 text-info',
  analise: 'bg-warning/10 text-warning',
  aprovacao: 'bg-success/10 text-success',
  rejeicao: 'bg-destructive/10 text-destructive',
  execucao: 'bg-primary/10 text-primary',
  conclusao: 'bg-success/10 text-success',
  comentario: 'bg-muted text-muted-foreground',
  documento: 'bg-accent text-accent-foreground',
  edicao: 'bg-warning/10 text-warning',
};

const typeLabels: Record<string, string> = {
  criacao: 'Criação',
  tramitacao: 'Tramitação',
  analise: 'Análise',
  aprovacao: 'Aprovação',
  rejeicao: 'Rejeição',
  execucao: 'Execução',
  conclusao: 'Conclusão',
  comentario: 'Comentário',
  documento: 'Documento',
  edicao: 'Edição',
};

const AuditPage = () => {
  const { user } = useAuth();
  const { processes } = useProcesses();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const logs: AuditLog[] = useMemo(() => {
    const allLogs: AuditLog[] = [];
    processes.forEach(p => {
      p.timeline.forEach(t => {
        allLogs.push({
          id: t.id,
          date: t.date,
          user: t.user,
          department: t.department,
          action: t.action,
          processNup: p.nup,
          processTitle: p.title,
          type: t.type || 'edicao',
          details: t.description,
        });
      });
    });
    return allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [processes]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (typeFilter !== 'all' && l.type !== typeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return l.user.toLowerCase().includes(s) || l.processNup.toLowerCase().includes(s) ||
          l.action.toLowerCase().includes(s) || l.processTitle.toLowerCase().includes(s);
      }
      return true;
    });
  }, [logs, search, typeFilter]);

  const types = ['all', ...Object.keys(typeLabels)];

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Auditoria do Sistema
        </h1>
        <p className="text-muted-foreground text-sm">
          Rastreamento completo de todas as ações realizadas no sistema
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por usuário, NUP, ação..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}>
              {t === 'all' ? 'Todos' : typeLabels[t] || t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total de Ações', value: logs.length, icon: FileText },
          { label: 'Usuários Ativos', value: new Set(logs.map(l => l.user)).size, icon: User },
          { label: 'Tramitações', value: logs.filter(l => l.type === 'tramitacao').length, icon: ArrowRight },
          { label: 'Hoje', value: logs.filter(l => l.date.startsWith(new Date().toISOString().split('T')[0])).length, icon: Clock },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Logs table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Data/Hora</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Usuário</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ação</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Processo</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((log, i) => (
                <motion.tr key={log.id + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap font-mono">
                    {new Date(log.date).toLocaleDateString('pt-BR')} {log.date.split(' ')[1] || ''}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {log.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{log.user}</p>
                        <p className="text-[10px] text-muted-foreground">{log.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${typeColors[log.type] || 'bg-muted text-muted-foreground'}`}>
                      {typeLabels[log.type] || log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground max-w-[200px] truncate">{log.action}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono text-primary">{log.processNup}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[250px] truncate">{log.details}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Nenhum log encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground text-center">
            Exibindo 100 de {filtered.length} registros
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditPage;
