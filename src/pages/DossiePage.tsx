import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockColaboradores, mockUsers, FeriasRecord, HistoricoEvent } from '@/data/mockData';
import { motion } from 'framer-motion';
import { User, FileText, Calendar, History, Search, ChevronRight, Briefcase, MapPin, Phone, Mail } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const statusFeriasColors: Record<string, string> = {
  agendada: 'bg-info/10 text-info',
  em_gozo: 'bg-warning/10 text-warning',
  concluida: 'bg-success/10 text-success',
  cancelada: 'bg-destructive/10 text-destructive',
};

const statusFeriasLabels: Record<string, string> = {
  agendada: 'Agendada',
  em_gozo: 'Em Gozo',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const historicoIcons: Record<string, string> = {
  admissao: '🟢',
  promocao: '⭐',
  transferencia: '🔄',
  ferias: '🏖️',
  advertencia: '⚠️',
  elogio: '🏅',
  treinamento: '📚',
};

const DossiePage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!user) return null;

  const colaboradores = mockColaboradores.map(c => ({
    ...c,
    user: mockUsers.find(u => u.id === c.userId),
  }));

  const filtered = colaboradores.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.user?.name.toLowerCase().includes(s) || c.cpf.includes(s) || c.cargo.toLowerCase().includes(s);
  });

  const selected = selectedId ? colaboradores.find(c => c.id === selectedId) : null;

  if (selected && selected.user) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedId(null)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Voltar para lista
        </button>

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white font-heading font-bold text-2xl shrink-0">
              {selected.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-heading font-bold text-foreground">{selected.user.name}</h2>
              <p className="text-muted-foreground">{selected.cargo}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {selected.user.email}</span>
                <span className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {selected.telefone}</span>
                <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {selected.endereco}</span>
                <span className="flex items-center gap-2 text-muted-foreground"><Briefcase className="w-3.5 h-3.5" /> Admissão: {new Date(selected.dataAdmissao).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Salário</p>
              <p className="text-lg font-heading font-bold text-foreground">R$ {selected.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="pessoal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pessoal" className="text-xs sm:text-sm"><User className="w-4 h-4 mr-1.5 hidden sm:inline" />Dados Pessoais</TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs sm:text-sm"><FileText className="w-4 h-4 mr-1.5 hidden sm:inline" />Documentos</TabsTrigger>
            <TabsTrigger value="ferias" className="text-xs sm:text-sm"><Calendar className="w-4 h-4 mr-1.5 hidden sm:inline" />Férias</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs sm:text-sm"><History className="w-4 h-4 mr-1.5 hidden sm:inline" />Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="pessoal" className="mt-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Informações Pessoais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Nome Completo', value: selected.user.name },
                  { label: 'CPF', value: selected.cpf },
                  { label: 'RG', value: selected.rg },
                  { label: 'Data de Nascimento', value: new Date(selected.dataNascimento).toLocaleDateString('pt-BR') },
                  { label: 'Data de Admissão', value: new Date(selected.dataAdmissao).toLocaleDateString('pt-BR') },
                  { label: 'Cargo', value: selected.cargo },
                  { label: 'E-mail', value: selected.user.email },
                  { label: 'Telefone', value: selected.telefone },
                  { label: 'Endereço', value: selected.endereco },
                  { label: 'Departamento', value: selected.user.department },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="documentos" className="mt-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Documentos do Colaborador</h3>
              {selected.documentos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum documento cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {selected.documentos.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <FileText className="w-8 h-8 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} • {doc.size} • {doc.uploadedBy}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{doc.uploadedAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="ferias" className="mt-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Histórico de Férias</h3>
              {selected.ferias.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro de férias</p>
              ) : (
                <div className="space-y-3">
                  {selected.ferias.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">Período: {f.periodo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(f.inicio).toLocaleDateString('pt-BR')} a {new Date(f.fim).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {f.diasUtilizados} dias utilizados • Saldo: {f.saldoRestante} dias
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusFeriasColors[f.status]}`}>
                        {statusFeriasLabels[f.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Histórico Profissional</h3>
              {selected.historico.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum evento registrado</p>
              ) : (
                <div className="space-y-0">
                  {selected.historico.map((h, i) => (
                    <div key={h.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">
                          {historicoIcons[h.tipo] || '📋'}
                        </div>
                        {i < selected.historico.length - 1 && <div className="w-0.5 h-full bg-border min-h-[30px]" />}
                      </div>
                      <div className="pb-5">
                        <p className="text-sm font-medium text-foreground">{h.descricao}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(h.data).toLocaleDateString('pt-BR')} • {h.responsavel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Dossiê Digital do Colaborador</h1>
        <p className="text-muted-foreground text-sm">{colaboradores.length} colaboradores cadastrados</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, CPF ou cargo..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c, i) => (
          <motion.button key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedId(c.id)}
            className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all text-left group">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-heading font-bold shrink-0">
              {c.user?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{c.user?.name}</p>
              <p className="text-sm text-muted-foreground">{c.cargo}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Admissão: {new Date(c.dataAdmissao).toLocaleDateString('pt-BR')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DossiePage;
