import { useState } from 'react';
import { SlaRule, defaultSlaRules, moduleLabelsShort, priorityLabelsShort } from '@/data/slaConfig';
import { ProcessModule, ProcessPriority } from '@/data/mockData';
import { Settings2, Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface SlaConfigPanelProps {
  rules: SlaRule[];
  onSave: (rules: SlaRule[]) => void;
}

const modules: ProcessModule[] = ['rh', 'financeiro', 'licitacao', 'dp'];
const priorities: ProcessPriority[] = ['baixa', 'media', 'alta', 'urgente'];

const SlaConfigPanel = ({ rules, onSave }: SlaConfigPanelProps) => {
  const [editing, setEditing] = useState(false);
  const [localRules, setLocalRules] = useState<SlaRule[]>(rules);

  const getValue = (module: ProcessModule, priority: ProcessPriority) => {
    return localRules.find(r => r.module === module && r.priority === priority)?.prazoUteis ?? 0;
  };

  const setValue = (module: ProcessModule, priority: ProcessPriority, val: number) => {
    setLocalRules(prev =>
      prev.map(r => r.module === module && r.priority === priority ? { ...r, prazoUteis: val } : r)
    );
  };

  const handleSave = () => {
    onSave(localRules);
    setEditing(false);
  };

  const handleReset = () => {
    setLocalRules(defaultSlaRules);
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-sm">SLA por Módulo (dias úteis)</h3>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Resetar
              </button>
              <button onClick={handleSave} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1">
                <Save className="w-3 h-3" /> Salvar
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80">
              Editar
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Módulo</th>
              {priorities.map(p => (
                <th key={p} className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  {priorityLabelsShort[p]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((mod, i) => (
              <motion.tr key={mod} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="border-b border-border/50">
                <td className="px-4 py-3 font-medium text-foreground">{moduleLabelsShort[mod]}</td>
                {priorities.map(pri => (
                  <td key={pri} className="px-4 py-3 text-center">
                    {editing ? (
                      <input type="number" min={1} max={90}
                        value={getValue(mod, pri)}
                        onChange={e => setValue(mod, pri, parseInt(e.target.value) || 1)}
                        className="w-14 text-center px-2 py-1 rounded-lg border border-border bg-background text-foreground text-sm"
                      />
                    ) : (
                      <span className="text-foreground font-mono">{getValue(mod, pri)}d</span>
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SlaConfigPanel;
