import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import { statusLabels, priorityLabels, moduleLabels, departmentLabels, mockUsers, countBusinessDays } from '@/data/mockData';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Clock, AlertTriangle, CheckCircle2, TrendingUp,
  DollarSign, Users, BarChart3, ArrowRightLeft, Timer
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['hsl(280,60%,45%)', 'hsl(210,80%,52%)', 'hsl(40,95%,55%)', 'hsl(142,71%,45%)', 'hsl(0,72%,51%)', 'hsl(280,35%,25%)'];

function getVisibleProcesses(processes: any[], user: any) {
  if (user.role === 'ti_admin' || user.role === 'presidencia' || user.role === 'diretoria') return processes;
  if (user.role === 'coordenacao') {
    return processes.filter((p: any) =>
      p.department === user.department ||
      p.currentDepartment === user.department ||
      (user.department === 'gestar' && p.module === 'licitacao')
    );
  }
  return processes.filter((p: any) => p.assignedTo === user.id || p.createdBy === user.id);
}

const DashboardPage = () => {
  const { user } = useAuth();
  const { processes } = useProcesses();
  const navigate = useNavigate();

  if (!user) return null;

  const visibleProcesses = getVisibleProcesses(processes, user);

  const stats = {
    total: visibleProcesses.length,
    abertos: visibleProcesses.filter(p => p.status === 'aberto').length,
    emAndamento: visibleProcesses.filter(p => ['em_analise', 'em_execucao', 'aguardando_aprovacao'].includes(p.status)).length,
    concluidos: visibleProcesses.filter(p => p.status === 'concluido').length,
    urgentes: visibleProcesses.filter(p => p.priority === 'urgente' || p.priority === 'alta').length,
  };

  // Business days stats for admin
  const completedProcesses = visibleProcesses.filter(p => p.status === 'concluido');
  const avgBusinessDays = completedProcesses.length > 0
    ? Math.round(completedProcesses.reduce((sum, p) => sum + countBusinessDays(p.createdAt, p.updatedAt), 0) / completedProcesses.length)
    : 0;

  const overdueCount = visibleProcesses.filter(p =>
    p.status !== 'concluido' && p.status !== 'arquivado' && new Date(p.deadline) < new Date()
  ).length;

  const statusData = Object.entries(
    visibleProcesses.reduce((acc, p) => { acc[statusLabels[p.status]] = (acc[statusLabels[p.status]] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const moduleData = Object.entries(
    visibleProcesses.reduce((acc, p) => { acc[moduleLabels[p.module]] = (acc[moduleLabels[p.module]] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.split(' ')[0], value }));

  // Department flow data
  const deptData = Object.entries(
    visibleProcesses.reduce((acc, p) => {
      const dept = departmentLabels[p.currentDepartment] || p.currentDepartment;
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.length > 10 ? name.substring(0, 10) + '...' : name, value }));

  const urgentProcesses = visibleProcesses
    .filter(p => p.status !== 'concluido' && p.status !== 'arquivado')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  // --- NEW STATS ---
  // Data for "Valor Total por Projeto"
  const projectValueDataObj: Record<string, number> = {};
  visibleProcesses.forEach(p => {
    if (p.projectName && p.value) {
      projectValueDataObj[p.projectName] = (projectValueDataObj[p.projectName] || 0) + p.value;
    }
  });
  const projectValueData = Object.entries(projectValueDataObj)
    .map(([name, value]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, value }))
    .sort((a, b) => b.value - a.value).slice(0, 5);

  // Data for "Taxa de Sucesso de Licitações"
  const licitacoes = visibleProcesses.filter(p => p.module === 'licitacao');
  const licitacoesGanhas = licitacoes.filter(p => p.status === 'ganha').length;
  const licitacoesPerdidas = licitacoes.filter(p => p.status === 'perdida').length;
  const licitacoesPendentes = licitacoes.filter(p => !['ganha', 'perdida', 'arquivado'].includes(p.status)).length;

  const licitacaoSuccessData = [
    { name: 'Ganha', value: licitacoesGanhas, color: 'hsl(142,71%,45%)' },
    { name: 'Perdida', value: licitacoesPerdidas, color: 'hsl(0,72%,51%)' },
    { name: 'Andamento', value: licitacoesPendentes, color: 'hsl(40,95%,55%)' },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total de Processos', value: stats.total, icon: FileText, color: 'text-primary' },
    { label: 'Em Andamento', value: stats.emAndamento, icon: Clock, color: 'text-info' },
    { label: 'Urgentes/Alta', value: stats.urgentes, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Concluídos', value: stats.concluidos, icon: CheckCircle2, color: 'text-success' },
  ];

  const isAdmin = user.role === 'ti_admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {user.role === 'presidencia' ? 'Dashboard Executivo' :
           user.role === 'ti_admin' ? 'Painel de Controle Geral' :
           user.role === 'diretoria' ? 'Dashboard da Diretoria' :
           user.role === 'coordenacao' ? 'Dashboard Setorial' :
           'Minhas Tarefas'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Bem-vindo(a), {user.name.split(' ')[0]}! • {departmentLabels[user.department]}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Admin-specific stats */}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Tempo Médio (dias úteis)</p>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{avgBusinessDays}</p>
            <p className="text-[10px] text-muted-foreground">criação → conclusão</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <p className="text-xs text-muted-foreground">Processos Atrasados</p>
            </div>
            <p className="text-2xl font-heading font-bold text-destructive">{overdueCount}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="w-4 h-4 text-info" />
              <p className="text-xs text-muted-foreground">Tramitações Totais</p>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">
              {visibleProcesses.reduce((sum, p) => sum + p.timeline.length, 0)}
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-warning" />
              <p className="text-xs text-muted-foreground">Valor Total</p>
            </div>
            <p className="text-lg font-heading font-bold text-foreground">
              R$ {(visibleProcesses.reduce((sum, p) => sum + (p.value || 0), 0) / 1000).toFixed(1)}k
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 stat-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Processos por Módulo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={moduleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(250,15%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(280,60%,45%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="stat-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Por Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-medium text-foreground">{d.value as number}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Department distribution (admin) */}
      {isAdmin && deptData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="stat-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Processos por Localização Atual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(250,15%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(210,80%,52%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* NEW PREMIUM CHARTS - FINANCIAL AND GESTAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(isAdmin || user.department === 'gerencia_tecnica' || user.department === 'financeiro') && projectValueData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="stat-card border border-primary/20 bg-primary/5">
            <h3 className="font-heading font-semibold text-primary mb-1">Custo por Projeto (Gerência Técnica)</h3>
            <p className="text-xs text-muted-foreground mb-4">Top 5 projetos com maior volume financeiro alocado</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={projectValueData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(250,15%,90%)" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(val) => `R$${val / 1000}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="value" fill="hsl(280,60%,45%)" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {(isAdmin || user.department === 'gestar') && licitacaoSuccessData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="stat-card border border-primary/20">
            <h3 className="font-heading font-semibold text-foreground mb-1">Taxa de Sucesso (Licitações)</h3>
            <p className="text-xs text-muted-foreground mb-4">Desempenho dos processos licitatórios do GESTAR</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={licitacaoSuccessData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {licitacaoSuccessData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Recent/urgent processes */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="stat-card">
        <h3 className="font-heading font-semibold text-foreground mb-4">Processos Prioritários</h3>
        <div className="space-y-2">
          {urgentProcesses.map(p => {
            const isOverdue = new Date(p.deadline) < new Date();
            return (
              <button key={p.id} onClick={() => navigate(`/processos/${p.id}`)}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  p.priority === 'urgente' ? 'bg-destructive' :
                  p.priority === 'alta' ? 'bg-warning' :
                  p.priority === 'media' ? 'bg-info' : 'bg-success'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.nup} • {departmentLabels[p.currentDepartment] || ''}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.status === 'aguardando_aprovacao' ? 'bg-warning/10 text-warning' :
                    p.status === 'em_analise' ? 'bg-info/10 text-info' :
                    p.status === 'aberto' ? 'bg-muted text-muted-foreground' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {statusLabels[p.status]}
                  </span>
                  <p className={`text-[11px] mt-1 ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    {isOverdue ? '⚠ Atrasado' : `Prazo: ${new Date(p.deadline).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
