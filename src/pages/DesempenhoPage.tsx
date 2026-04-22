import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import { mockUsers, departmentLabels, countBusinessDays, Department, statusLabels } from '@/data/mockData';
import { defaultSlaRules, SlaRule } from '@/data/slaConfig';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, CheckCircle, TrendingUp, Users, Timer, Target, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import SlaConfigPanel from '@/components/desempenho/SlaConfigPanel';
import PeriodFilter from '@/components/desempenho/PeriodFilter';

interface ColaboradorStats {
  id: string;
  name: string;
  cargo: string;
  department: Department;
  totalProcesses: number;
  concluidos: number;
  emAndamento: number;
  atrasados: number;
  tempoMedio: number;
  slaPercent: number;
}

const DesempenhoPage = () => {
  const { user } = useAuth();
  const { processes } = useProcesses();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const [slaRules, setSlaRules] = useState<SlaRule[]>(() => {
    const saved = localStorage.getItem('imh_sla_rules');
    return saved ? JSON.parse(saved) : defaultSlaRules;
  });

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  const canSeeAll = user?.role === 'ti_admin' || user?.role === 'presidencia' || user?.role === 'diretoria';
  const isAdmin = user?.role === 'ti_admin';
  const userDept = user?.department || 'ti';

  const handleSlaRulesSave = (rules: SlaRule[]) => {
    setSlaRules(rules);
    localStorage.setItem('imh_sla_rules', JSON.stringify(rules));
  };

  // Filter processes by period
  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const d = new Date(p.createdAt);
      if (viewMode === 'month') {
        return d.getMonth() === month && d.getFullYear() === year;
      }
      return d.getFullYear() === year;
    });
  }, [processes, month, year, viewMode]);

  const relevantUsers = useMemo(() => {
    if (!user) return [];
    let users = mockUsers.filter(u => u.active);
    if (!canSeeAll) {
      users = users.filter(u => u.department === userDept);
    } else if (selectedDepartment !== 'all') {
      users = users.filter(u => u.department === selectedDepartment);
    }
    return users;
  }, [canSeeAll, userDept, selectedDepartment, user]);

  const stats: ColaboradorStats[] = useMemo(() => {
    return relevantUsers.map(u => {
      const userProcesses = filteredProcesses.filter(p =>
        p.assignedTo === u.id || p.createdBy === u.id
      );
      const concluidos = userProcesses.filter(p => p.status === 'concluido');
      const emAndamento = userProcesses.filter(p => p.status !== 'concluido' && p.status !== 'arquivado');
      const atrasados = userProcesses.filter(p =>
        new Date(p.deadline) < new Date() && p.status !== 'concluido' && p.status !== 'arquivado'
      );

      let tempoMedio = 0;
      if (concluidos.length > 0) {
        const tempos = concluidos.map(p => {
          const conclusaoEvent = [...p.timeline].reverse().find(t => t.type === 'conclusao' || t.type === 'aprovacao');
          const endDate = conclusaoEvent ? conclusaoEvent.date.split('T')[0].split(' ')[0] : p.updatedAt;
          return countBusinessDays(p.createdAt, endDate);
        });
        tempoMedio = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
      }

      const processesWithDeadline = userProcesses.filter(p => p.deadline);
      const noPrazo = processesWithDeadline.filter(p => {
        if (p.status === 'concluido') return new Date(p.updatedAt) <= new Date(p.deadline);
        return new Date(p.deadline) >= new Date();
      });
      const slaPercent = processesWithDeadline.length > 0
        ? Math.round((noPrazo.length / processesWithDeadline.length) * 100) : 100;

      return {
        id: u.id, name: u.name, cargo: u.cargo || '', department: u.department,
        totalProcesses: userProcesses.length, concluidos: concluidos.length,
        emAndamento: emAndamento.length, atrasados: atrasados.length, tempoMedio, slaPercent,
      };
    }).sort((a, b) => b.totalProcesses - a.totalProcesses);
  }, [relevantUsers, filteredProcesses]);

  if (!user) return null;

  const totalProcesses = stats.reduce((a, b) => a + b.totalProcesses, 0);
  const totalConcluidos = stats.reduce((a, b) => a + b.concluidos, 0);
  const totalAtrasados = stats.reduce((a, b) => a + b.atrasados, 0);
  const avgSla = stats.length > 0 ? Math.round(stats.reduce((a, b) => a + b.slaPercent, 0) / stats.length) : 0;
  const withTempo = stats.filter(s => s.tempoMedio > 0);
  const avgTempo = withTempo.length > 0 ? Math.round(withTempo.reduce((a, b) => a + b.tempoMedio, 0) / withTempo.length) : 0;

  const chartData = stats.filter(s => s.totalProcesses > 0).map(s => ({
    name: s.name.split(' ')[0], concluidos: s.concluidos, emAndamento: s.emAndamento, atrasados: s.atrasados,
  }));

  const pieData = [
    { name: 'Concluídos', value: totalConcluidos },
    { name: 'Em andamento', value: totalProcesses - totalConcluidos - totalAtrasados },
    { name: 'Atrasados', value: totalAtrasados },
  ].filter(d => d.value > 0);

  const departments: { value: Department | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'rh', label: 'RH' },
    { value: 'licitacao', label: 'Licitação' },
    { value: 'dp', label: 'DP' },
    { value: 'ti', label: 'TI' },
    { value: 'presidencia', label: 'Presidência' },
    { value: 'diretoria', label: 'Diretoria' },
  ];

  const kpis = [
    { label: 'Processos', value: totalProcesses, icon: Target, color: 'text-primary' },
    { label: 'Concluídos', value: totalConcluidos, icon: CheckCircle, color: 'text-success' },
    { label: 'Atrasados', value: totalAtrasados, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'SLA Médio', value: `${avgSla}%`, icon: TrendingUp, color: avgSla >= 80 ? 'text-success' : avgSla >= 50 ? 'text-warning' : 'text-destructive' },
    { label: 'Tempo Médio', value: `${avgTempo}d`, icon: Timer, color: 'text-info' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Desempenho da Equipe
            </h1>
            <p className="text-muted-foreground text-sm">
              {canSeeAll ? 'Visão geral de todos os setores' : `Setor: ${departmentLabels[userDept]}`}
            </p>
          </div>
          {canSeeAll && (
            <div className="flex gap-1 flex-wrap">
              {departments.map(d => (
                <button key={d.value} onClick={() => setSelectedDepartment(d.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedDepartment === d.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Period filter */}
        <PeriodFilter month={month} year={year} onMonthChange={setMonth} onYearChange={setYear}
          viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className={`text-2xl font-heading font-bold ${kpi.color}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading font-semibold text-sm mb-4">Processos por Colaborador</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="concluidos" name="Concluídos" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="emAndamento" name="Em andamento" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atrasados" name="Atrasados" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              Nenhum dado disponível para este período
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-heading font-semibold text-sm mb-4">Distribuição</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={['hsl(142 71% 45%)', 'hsl(var(--info))', 'hsl(var(--destructive))'][idx]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Nenhum dado</div>
          )}
        </div>
      </div>

      {/* Monthly Evolution Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-heading font-semibold text-sm mb-4">Evolução Mensal — SLA e Processos Concluídos</h3>
        {(() => {
          const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
          const evolutionData = monthNames.map((mName, mIdx) => {
            const monthProcesses = processes.filter(p => {
              const d = new Date(p.createdAt);
              return d.getMonth() === mIdx && d.getFullYear() === year;
            });
            const deptFiltered = canSeeAll && selectedDepartment === 'all'
              ? monthProcesses
              : monthProcesses.filter(p => {
                  const dept = selectedDepartment !== 'all' ? selectedDepartment : userDept;
                  return relevantUsers.some(u => u.id === p.assignedTo || u.id === p.createdBy);
                });
            const concluidos = deptFiltered.filter(p => p.status === 'concluido').length;
            const withDeadline = deptFiltered.filter(p => p.deadline);
            const noPrazo = withDeadline.filter(p => {
              if (p.status === 'concluido') return new Date(p.updatedAt) <= new Date(p.deadline);
              return new Date(p.deadline) >= new Date();
            });
            const sla = withDeadline.length > 0 ? Math.round((noPrazo.length / withDeadline.length) * 100) : null;
            return { name: mName, concluidos, sla, total: deptFiltered.length };
          });
          const hasData = evolutionData.some(d => d.total > 0);
          if (!hasData) return (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              Nenhum dado disponível para {year}
            </div>
          );
          return (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="concluidos" name="Concluídos" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="sla" name="SLA %" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          );
        })()}
      </div>

      {/* Ranking table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-sm">Ranking de Colaboradores</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Colaborador</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Setor</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Total</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Concluídos</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Atrasados</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Tempo Médio</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">SLA</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{s.cargo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{departmentLabels[s.department]}</td>
                  <td className="px-4 py-3 text-center font-medium">{s.totalProcesses}</td>
                  <td className="px-4 py-3 text-center"><span className="text-success font-medium">{s.concluidos}</span></td>
                  <td className="px-4 py-3 text-center">
                    {s.atrasados > 0 ? (
                      <span className="text-destructive font-medium flex items-center justify-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" /> {s.atrasados}
                      </span>
                    ) : <span className="text-muted-foreground">0</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">{s.tempoMedio > 0 ? `${s.tempoMedio} dias` : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      s.slaPercent >= 80 ? 'bg-success/10 text-success' :
                      s.slaPercent >= 50 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                    }`}>{s.slaPercent}%</span>
                  </td>
                </motion.tr>
              ))}
              {stats.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum colaborador encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLA Config - Admin only */}
      {isAdmin && <SlaConfigPanel rules={slaRules} onSave={handleSlaRulesSave} />}
    </div>
  );
};

export default DesempenhoPage;
