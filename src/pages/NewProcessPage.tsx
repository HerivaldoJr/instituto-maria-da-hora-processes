import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import { ProcessModule, ProcessPriority, ProcessStatus, moduleLabels, priorityLabels, mockUsers, departmentLabels, RecurringConfig, frequencyLabels, Department } from '@/data/mockData';
import { motion } from 'framer-motion';
import { ArrowLeft, PlusCircle, Upload, Repeat, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const NewProcessPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addProcess, categories } = useProcesses();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState<ProcessModule>('rh');
  const [categoryId, setCategoryId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [resourceSource, setResourceSource] = useState('');
  const [priority, setPriority] = useState<ProcessPriority>('media');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [value, setValue] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurringConfig['frequency']>('mensal');
  const [recurringDesc, setRecurringDesc] = useState('');
  const [mockDocs, setMockDocs] = useState<{ name: string; size: string }[]>([]);
  const [docName, setDocName] = useState('');

  // Filter categories by selected module
  const moduleCategories = categories.filter(c => c.module === module && c.active);

  if (!user) return null;

  const handleAddDoc = () => {
    if (!docName.trim()) return;
    setMockDocs(prev => [...prev, {
      name: docName.trim().endsWith('.pdf') ? docName.trim() : docName.trim() + '.pdf',
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
    }]);
    setDocName('');
  };

  const moduleToDepartment: Record<ProcessModule, Department> = {
    rh: 'rh', financeiro: 'financeiro', licitacao: 'licitacao', dp: 'dp', gerencia_tecnica: 'gerencia_tecnica'
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !deadline || !assignedTo) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const dept = moduleToDepartment[module] || user.department;

    addProcess({
      title: title.trim(),
      description: description.trim(),
      module,
      status: 'aberto' as ProcessStatus,
      priority,
      assignedTo,
      createdBy: user.id,
      department: dept,
      currentDepartment: dept,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      deadline,
      categoryId: categoryId || undefined,
      projectName: projectName || undefined,
      resourceSource: resourceSource || undefined,
      value: value ? parseFloat(value) : undefined,
      recurring: recurring ? {
        enabled: true,
        frequency,
        nextDate: deadline,
        description: recurringDesc || `Demanda recorrente ${frequencyLabels[frequency].toLowerCase()}.`,
      } : undefined,
      documents: mockDocs.map((d, i) => ({
        id: `nd${Date.now()}_${i}`,
        name: d.name,
        type: 'PDF',
        size: d.size,
        uploadedBy: user.name,
        uploadedAt: new Date().toISOString().split('T')[0],
      })),
    });

    toast.success('Processo criado com sucesso!');
    navigate('/processos');
  };

  const assignableUsers = mockUsers.filter(u => u.active);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Novo Processo</h1>
          <p className="text-muted-foreground text-sm">Preencha as informações para criar um novo processo</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Título *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Solicitação de Férias - João Silva"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição *</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Descreva detalhadamente o processo..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Módulo *</label>
            <select value={module} onChange={e => {
                setModule(e.target.value as ProcessModule);
                setCategoryId(''); 
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {Object.entries(moduleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Categoria</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Selecione...</option>
              {moduleCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Prioridade *</label>
            <select value={priority} onChange={e => setPriority(e.target.value as ProcessPriority)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Prazo *</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Responsável *</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">Selecione...</option>
              {assignableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name} — {u.cargo || departmentLabels[u.department]}</option>
              ))}
            </select>
          </div>
        </div>

        {(module === 'gerencia_tecnica' || module === 'financeiro' || module === 'licitacao') && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
            <div className="sm:col-span-2">
              <h4 className="text-sm font-bold text-primary mb-3">Acompanhamento Técnico / Financeiro</h4>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Projeto Vinculado</label>
              <input value={projectName} onChange={e => setProjectName(e.target.value)}
                placeholder="Ex: Ação Social XYZ"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Fonte de Recurso</label>
              <input value={resourceSource} onChange={e => setResourceSource(e.target.value)}
                placeholder="Ex: Fundo Municipal"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </motion.div>
        )}

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Valor (R$)</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)}
            placeholder="Opcional — informe se aplicável"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div className="border border-border rounded-xl p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <Repeat className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Demanda Recorrente</span>
          </label>
          {recurring && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pl-7">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Frequência</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value as RecurringConfig['frequency'])}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  {Object.entries(frequencyLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Descrição da recorrência</label>
                <input value={recurringDesc} onChange={e => setRecurringDesc(e.target.value)}
                  placeholder="Ex: Folha de pagamento mensal"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
            </motion.div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Documentos</label>
          <div className="flex gap-2 mb-2">
            <input value={docName} onChange={e => setDocName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddDoc()}
              placeholder="Nome do documento (ex: nota_fiscal.pdf)"
              className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={handleAddDoc}
              className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90">
              <Upload className="w-4 h-4" />
            </button>
          </div>
          {mockDocs.length > 0 && (
            <div className="space-y-1">
              {mockDocs.map((doc, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 text-sm">
                  <span className="text-foreground">{doc.name} <span className="text-muted-foreground">({doc.size})</span></span>
                  <button onClick={() => setMockDocs(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
          Cancelar
        </button>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Criar Processo
        </motion.button>
      </div>
    </div>
  );
};

export default NewProcessPage;
