import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import { moduleLabels, statusLabels, mockUsers, departmentLabels } from '@/data/mockData';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { FileText, Clock, TrendingUp, AlertTriangle, Download } from 'lucide-react';
import logoCircular from '@/assets/logo-circular.jpg';

const COLORS = ['hsl(280,60%,45%)', 'hsl(210,80%,52%)', 'hsl(40,95%,55%)', 'hsl(142,71%,45%)', 'hsl(0,72%,51%)', 'hsl(280,35%,25%)'];

const ReportsPage = () => {
  const { user } = useAuth();
  const { processes } = useProcesses();

  if (!user) return null;

  // Stats
  const total = processes.length;
  const concluidos = processes.filter(p => p.status === 'concluido').length;
  const emAndamento = processes.filter(p => !['concluido', 'arquivado'].includes(p.status)).length;
  const urgentes = processes.filter(p => p.priority === 'urgente').length;

  // By module
  const byModule = Object.entries(
    processes.reduce((acc, p) => { acc[moduleLabels[p.module]] = (acc[moduleLabels[p.module]] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.split(' ')[0], value }));

  // By status
  const byStatus = Object.entries(
    processes.reduce((acc, p) => { acc[statusLabels[p.status]] = (acc[statusLabels[p.status]] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Productivity by team (processes per user)
  const byUser = mockUsers
    .map(u => ({
      name: u.name.split(' ')[0],
      atribuidos: processes.filter(p => p.assignedTo === u.id).length,
      criados: processes.filter(p => p.createdBy === u.id).length,
    }))
    .filter(u => u.atribuidos > 0 || u.criados > 0);

  // Average time simulation (days between creation and last update)
  const avgTimeByModule = Object.entries(moduleLabels).map(([key, label]) => {
    const moduleProcs = processes.filter(p => p.module === key);
    if (moduleProcs.length === 0) return { name: label.split(' ')[0], dias: 0 };
    const avgDays = moduleProcs.reduce((sum, p) => {
      const created = new Date(p.createdAt).getTime();
      const updated = new Date(p.updatedAt).getTime();
      return sum + (updated - created) / (1000 * 60 * 60 * 24);
    }, 0) / moduleProcs.length;
    return { name: label.split(' ')[0], dias: Math.round(avgDays) };
  });

  // Bottlenecks (processes stuck in aguardando_aprovacao)
  const bottlenecks = processes
    .filter(p => p.status === 'aguardando_aprovacao')
    .map(p => ({
      nup: p.nup,
      title: p.title,
      dias: Math.round((Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
      priority: p.priority,
    }))
    .sort((a, b) => b.dias - a.dias);

  const cards = [
    { label: 'Total de Processos', value: total, icon: FileText, color: 'text-primary' },
    { label: 'Em Andamento', value: emAndamento, icon: Clock, color: 'text-info' },
    { label: 'Concluídos', value: concluidos, icon: TrendingUp, color: 'text-success' },
    { label: 'Urgentes', value: urgentes, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Relatórios Gerenciais</h1>
          <p className="text-muted-foreground text-sm">Visão analítica dos processos do Instituto Maria da Hora</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90">
          <Download className="w-4 h-4" /> Exportar
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="stat-card">
            <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
            <p className="text-2xl font-heading font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="stat-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Processos por Módulo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byModule}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(250,15%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(280,60%,45%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="stat-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Distribuição por Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {byStatus.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground truncate">{d.name}</span>
                <span className="ml-auto font-medium text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Productivity + Avg Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="stat-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Produtividade por Equipe</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byUser} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(250,15%,90%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Tooltip />
              <Legend />
              <Bar dataKey="atribuidos" name="Atribuídos" fill="hsl(280,60%,45%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="criados" name="Criados" fill="hsl(40,95%,55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="stat-card">
          <h3 className="font-heading font-semibold text-foreground mb-4">Tempo Médio de Tramitação (dias)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={avgTimeByModule}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(250,15%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="dias" name="Dias" fill="hsl(210,80%,52%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottlenecks */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="stat-card">
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Gargalos — Processos Aguardando Aprovação
        </h3>
        {bottlenecks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum gargalo identificado 🎉</p>
        ) : (
          <div className="space-y-2">
            {bottlenecks.map(b => (
              <div key={b.nup} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.nup}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    b.priority === 'urgente' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                  }`}>{b.priority === 'urgente' ? 'Urgente' : 'Alta'}</span>
                  <span className="text-sm font-heading font-bold text-foreground">{b.dias}d</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-3 py-4 text-xs text-muted-foreground">
        <img src={logoCircular} alt="IMH" className="w-6 h-6 rounded-full" />
        <span>Instituto Maria da Hora — Relatório gerado em {new Date().toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  );
};

export default ReportsPage;
