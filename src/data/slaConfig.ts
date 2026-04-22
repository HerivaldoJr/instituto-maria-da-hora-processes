import { ProcessModule, ProcessPriority } from './mockData';

export interface SlaRule {
  module: ProcessModule;
  priority: ProcessPriority;
  prazoUteis: number; // business days
}

// Default SLA rules (configurable by admin)
export const defaultSlaRules: SlaRule[] = [
  // RH
  { module: 'rh', priority: 'baixa', prazoUteis: 15 },
  { module: 'rh', priority: 'media', prazoUteis: 10 },
  { module: 'rh', priority: 'alta', prazoUteis: 5 },
  { module: 'rh', priority: 'urgente', prazoUteis: 2 },
  // Financeiro
  { module: 'financeiro', priority: 'baixa', prazoUteis: 10 },
  { module: 'financeiro', priority: 'media', prazoUteis: 7 },
  { module: 'financeiro', priority: 'alta', prazoUteis: 3 },
  { module: 'financeiro', priority: 'urgente', prazoUteis: 1 },
  // Licitação
  { module: 'licitacao', priority: 'baixa', prazoUteis: 30 },
  { module: 'licitacao', priority: 'media', prazoUteis: 20 },
  { module: 'licitacao', priority: 'alta', prazoUteis: 10 },
  { module: 'licitacao', priority: 'urgente', prazoUteis: 5 },
  // DP
  { module: 'dp', priority: 'baixa', prazoUteis: 10 },
  { module: 'dp', priority: 'media', prazoUteis: 7 },
  { module: 'dp', priority: 'alta', prazoUteis: 3 },
  { module: 'dp', priority: 'urgente', prazoUteis: 1 },
];

export function getSlaForProcess(module: ProcessModule, priority: ProcessPriority, rules: SlaRule[] = defaultSlaRules): number {
  const rule = rules.find(r => r.module === module && r.priority === priority);
  return rule?.prazoUteis ?? 10;
}

export const moduleLabelsShort: Record<ProcessModule, string> = {
  rh: 'RH',
  financeiro: 'Financeiro',
  licitacao: 'Licitação',
  dp: 'DP',
};

export const priorityLabelsShort: Record<ProcessPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};
