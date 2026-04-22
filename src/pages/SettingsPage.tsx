import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Settings, Save, Building2, Clock, Bell, Shield, FileText, Workflow, Plus, Trash2, Edit2, X } from 'lucide-react';
import { defaultSlaRules, SlaRule } from '@/data/slaConfig';
import { departmentLabels, moduleLabels, ProcessModule } from '@/data/mockData';
import { useProcesses } from '@/contexts/ProcessContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const { categories, addCategory, updateCategory, deleteCategory } = useProcesses();
  const [activeTab, setActiveTab] = useState('geral');
  const [saved, setSaved] = useState(false);

  const [orgName, setOrgName] = useState('Instituto Maria da Hora');
  const [orgAbbr, setOrgAbbr] = useState('IMH');
  const [nupPrefix, setNupPrefix] = useState('IMH-');
  const [workHoursStart, setWorkHoursStart] = useState('08:00');
  const [workHoursEnd, setWorkHoursEnd] = useState('17:00');

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSystem, setNotifSystem] = useState(true);
  const [notifSlaWarning, setNotifSlaWarning] = useState(1);
  const [notifSlaUrgent, setNotifSlaUrgent] = useState(0);

  // Categories Tab states
  const [newCatName, setNewCatName] = useState('');
  const [newCatModule, setNewCatModule] = useState<ProcessModule>('dp');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatModule, setEditCatModule] = useState<ProcessModule>('dp');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user || user.role !== 'ti_admin') return null;

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Building2 },
    { id: 'horarios', label: 'Horários', icon: Clock },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'categorias', label: 'Categorias', icon: FileText },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Configurações do Sistema
          </h1>
          <p className="text-muted-foreground text-sm">Gerencie as configurações gerais do SUITE Maria da Hora</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Save className="w-4 h-4" />
          {saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-0.5 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all ${
              activeTab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 space-y-6">

        {activeTab === 'geral' && (
          <>
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Dados da Organização
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome da Organização</label>
                <input value={orgName} onChange={e => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sigla</label>
                <input value={orgAbbr} onChange={e => setOrgAbbr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Prefixo NUP</label>
                <input value={nupPrefix} onChange={e => setNupPrefix(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          </>
        )}

        {activeTab === 'horarios' && (
          <>
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Horário de Expediente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Início</label>
                <input type="time" value={workHoursStart} onChange={e => setWorkHoursStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Término</label>
                <input type="time" value={workHoursEnd} onChange={e => setWorkHoursEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                <strong>Feriados:</strong> O sistema utiliza o calendário de feriados nacionais brasileiros de 2026 para cálculos de dias úteis e SLA.
              </p>
            </div>
          </>
        )}

        {activeTab === 'notificacoes' && (
          <>
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Preferências de Notificação
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificações por E-mail</p>
                  <p className="text-xs text-muted-foreground">Enviar alertas por e-mail para todos os usuários</p>
                </div>
                <button onClick={() => setNotifEmail(!notifEmail)}
                  className={`w-10 h-6 rounded-full transition-colors ${notifEmail ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${notifEmail ? 'translate-x-4' : ''}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Notificações do Sistema</p>
                  <p className="text-xs text-muted-foreground">Exibir notificações internas no sino</p>
                </div>
                <button onClick={() => setNotifSystem(!notifSystem)}
                  className={`w-10 h-6 rounded-full transition-colors ${notifSystem ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${notifSystem ? 'translate-x-4' : ''}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Alerta de SLA (dias antes)</label>
                  <input type="number" min={0} max={5} value={notifSlaWarning} onChange={e => setNotifSlaWarning(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Alerta urgente (dias antes)</label>
                  <input type="number" min={0} max={5} value={notifSlaUrgent} onChange={e => setNotifSlaUrgent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'categorias' && (
          <div className="space-y-6">
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Gerenciamento de Categorias
            </h3>
            
            <div className="bg-muted/50 p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs text-muted-foreground mb-1 block">Nome da Categoria</label>
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Ex: Admissão" 
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex-1 w-full">
                <label className="text-xs text-muted-foreground mb-1 block">Módulo</label>
                <select value={newCatModule} onChange={e => setNewCatModule(e.target.value as ProcessModule)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30">
                  {Object.entries(moduleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <button 
                onClick={() => {
                  if (newCatName.trim()) {
                    addCategory({ name: newCatName.trim(), module: newCatModule, active: true });
                    setNewCatName('');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  {editingCatId === cat.id ? (
                    <div className="flex sm:items-center gap-3 w-full flex-col sm:flex-row">
                      <input value={editCatName} onChange={e => setEditCatName(e.target.value)} className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-background" />
                      <select value={editCatModule} onChange={e => setEditCatModule(e.target.value as ProcessModule)} className="px-3 py-1.5 text-sm rounded-md border border-border bg-background">
                        {Object.entries(moduleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <div className="flex items-center gap-2">
                        <button onClick={() => {
                          if (editCatName.trim()) updateCategory(cat.id, { name: editCatName.trim(), module: editCatModule });
                          setEditingCatId(null);
                        }} className="px-3 py-1.5 bg-success/10 text-success rounded-md text-sm font-medium">Salvar</button>
                        <button onClick={() => setEditingCatId(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{moduleLabels[cat.module]} • {cat.active ? 'Ativa' : 'Inativa'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => {
                          setEditingCatId(cat.id);
                          setEditCatName(cat.name);
                          setEditCatModule(cat.module);
                        }} className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteCategory(cat.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma categoria cadastrada.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <>
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
              <Workflow className="w-4 h-4 text-primary" /> Fluxos de Trabalho
            </h3>
            <div className="space-y-4">
              {[
                { module: 'RH', steps: ['Aberto → Em Análise', 'Em Análise → Aguardando Aprovação', 'Aprovação → Em Execução', 'Execução → Concluído'] },
                { module: 'Financeiro', steps: ['Aberto → Em Análise', 'Em Análise → Aguardando Aprovação', 'Aprovação → Em Execução', 'Execução → Concluído'] },
                { module: 'Licitação', steps: ['Aberto → Em Cotação', 'Cotação → Edital', 'Edital → Pregão', 'Pregão → Concluído'] },
                { module: 'DP', steps: ['Aberto → Em Análise', 'Análise → Em Processamento', 'Processamento → Concluído'] },
              ].map(wf => (
                <div key={wf.module} className="rounded-lg border border-border p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">{wf.module}</h4>
                  <div className="flex flex-wrap gap-2">
                    {wf.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-xs bg-muted px-2 py-1 rounded text-foreground">{step}</span>
                        {i < wf.steps.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                A edição de workflows estará disponível em uma versão futura. Atualmente os fluxos seguem o padrão definido acima.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default SettingsPage;
