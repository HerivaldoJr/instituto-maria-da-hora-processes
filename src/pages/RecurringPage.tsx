import { useProcesses } from '@/contexts/ProcessContext';
import { frequencyLabels, moduleLabels, priorityLabels, mockUsers } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Repeat, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecurringPage = () => {
  const { processes } = useProcesses();
  const navigate = useNavigate();

  const recurringProcesses = processes.filter(p => p.recurring?.enabled);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Repeat className="w-6 h-6 text-primary" /> Demandas Recorrentes
        </h1>
        <p className="text-muted-foreground text-sm">
          Processos que são gerados automaticamente em intervalos regulares
        </p>
      </div>

      {recurringProcesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Repeat className="w-12 h-12 opacity-30 mb-3" />
          <p className="text-sm">Nenhuma demanda recorrente configurada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recurringProcesses.map((p, i) => {
            const assignee = mockUsers.find(u => u.id === p.assignedTo);
            const nextDate = p.recurring ? new Date(p.recurring.nextDate) : null;
            const daysUntilNext = nextDate ? Math.round((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/processos/${p.id}`)}>
                <div className="flex items-stretch">
                  <div className="w-1.5 bg-primary shrink-0" />
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">{p.nup}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {p.recurring && frequencyLabels[p.recurring.frequency]}
                          </span>
                        </div>
                        <h3 className="text-base font-heading font-semibold text-foreground">{p.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{p.recurring?.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${
                          p.priority === 'urgente' ? 'bg-destructive/10 text-destructive' :
                          p.priority === 'alta' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>{priorityLabels[p.priority]}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Próxima: {nextDate?.toLocaleDateString('pt-BR')}
                      </span>
                      <span>{moduleLabels[p.module]}</span>
                      <span>Responsável: {assignee?.name || '-'}</span>
                      {daysUntilNext <= 7 && daysUntilNext > 0 && (
                        <span className="flex items-center gap-1 text-warning font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Em {daysUntilNext} dia{daysUntilNext !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="bg-muted/50 rounded-xl p-5 border border-border/50">
        <h3 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" /> Como funciona
        </h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>• Ao criar um processo, marque como <strong>Demanda Recorrente</strong></li>
          <li>• Defina a frequência: semanal, mensal, trimestral, etc.</li>
          <li>• O sistema notifica automaticamente quando a próxima instância deve ser criada</li>
          <li>• O histórico de todas as instâncias fica vinculado ao processo original</li>
        </ul>
      </div>
    </div>
  );
};

export default RecurringPage;
