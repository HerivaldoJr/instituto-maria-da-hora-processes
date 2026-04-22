export type UserRole = 'ti_admin' | 'presidencia' | 'diretoria' | 'coordenacao' | 'liderado';
export type Department = 'financeiro' | 'rh' | 'licitacao' | 'dp' | 'ti' | 'presidencia' | 'diretoria' | 'gestar' | 'gerencia_tecnica';
export type ProcessStatus = 'aberto' | 'em_analise' | 'aguardando_aprovacao' | 'em_execucao' | 'concluido' | 'arquivado' | 'ganha' | 'perdida';
export type ProcessPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type ProcessModule = 'rh' | 'financeiro' | 'licitacao' | 'dp' | 'gerencia_tecnica';

export interface ProcessCategory {
  id: string;
  module: ProcessModule;
  name: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  avatar?: string;
  active: boolean;
  cargo?: string;
}

export interface Process {
  id: string;
  nup: string;
  title: string;
  description: string;
  module: ProcessModule;
  categoryId?: string;
  projectName?: string;
  resourceSource?: string;
  status: ProcessStatus;
  priority: ProcessPriority;
  assignedTo: string;
  createdBy: string;
  department: Department;
  currentDepartment: Department;
  createdAt: string;
  updatedAt: string;
  deadline: string;
  timeline: TimelineEvent[];
  documents: Document[];
  comments: Comment[];
  value?: number;
  recurring?: RecurringConfig;
  confidential?: boolean;
  confidentialBy?: string;
  pendingAcceptance?: boolean;
  pendingAcceptanceBy?: string;
}

export interface RecurringConfig {
  enabled: boolean;
  frequency: 'semanal' | 'quinzenal' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
  nextDate: string;
  description: string;
}

export interface TimelineEvent {
  id: string;
  action: string;
  user: string;
  department: string;
  date: string;
  description: string;
  type?: 'criacao' | 'tramitacao' | 'analise' | 'aprovacao' | 'rejeicao' | 'execucao' | 'conclusao' | 'comentario' | 'documento' | 'edicao';
  fromDepartment?: string;
  toDepartment?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  date: string;
  department?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  read: boolean;
  date: string;
  processId?: string;
}

export interface Colaborador {
  id: string;
  userId: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  dataAdmissao: string;
  cargo: string;
  salario: number;
  endereco: string;
  telefone: string;
  documentos: Document[];
  ferias: FeriasRecord[];
  historico: HistoricoEvent[];
}

export interface FeriasRecord {
  id: string;
  periodo: string;
  inicio: string;
  fim: string;
  status: 'agendada' | 'em_gozo' | 'concluida' | 'cancelada';
  diasUtilizados: number;
  saldoRestante: number;
}

export interface HistoricoEvent {
  id: string;
  tipo: 'admissao' | 'promocao' | 'transferencia' | 'ferias' | 'advertencia' | 'elogio' | 'treinamento';
  descricao: string;
  data: string;
  responsavel: string;
}

// Brazilian holidays 2026
export const holidays2026 = [
  '2026-01-01', '2026-02-16', '2026-02-17', '2026-04-03', '2026-04-21',
  '2026-05-01', '2026-06-04', '2026-09-07', '2026-10-12', '2026-11-02',
  '2026-11-15', '2026-12-25',
];

export function isBusinessDay(dateStr: string): boolean {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  if (day === 0 || day === 6) return false;
  if (holidays2026.includes(dateStr)) return false;
  return true;
}

export function countBusinessDays(startStr: string, endStr: string): number {
  const start = new Date(startStr + 'T12:00:00');
  const end = new Date(endStr + 'T12:00:00');
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const iso = current.toISOString().split('T')[0];
    if (isBusinessDay(iso)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Carlos Silva', email: 'carlos@imh.org.br', role: 'ti_admin', department: 'ti', active: true, cargo: 'Supervisor de TI' },
  { id: 'u2', name: 'Glorinha', email: 'glorinha@imh.org.br', role: 'presidencia', department: 'presidencia', active: true, cargo: 'Presidente' },
  { id: 'u3', name: 'Ana Oliveira', email: 'ana@imh.org.br', role: 'coordenacao', department: 'financeiro', active: true, cargo: 'Coordenadora Financeira' },
  { id: 'u4', name: 'João Pereira', email: 'joao@imh.org.br', role: 'coordenacao', department: 'rh', active: true, cargo: 'Coordenador de RH' },
  { id: 'u5', name: 'Cris', email: 'cris@imh.org.br', role: 'coordenacao', department: 'gestar', active: true, cargo: 'Coordenadora do Gestar' },
  { id: 'u6', name: 'Pedro Almeida', email: 'pedro@imh.org.br', role: 'liderado', department: 'financeiro', active: true, cargo: 'Assistente Financeiro' },
  { id: 'u7', name: 'Luísa Ferreira', email: 'luisa@imh.org.br', role: 'liderado', department: 'rh', active: true, cargo: 'Assistente de RH' },
  { id: 'u8', name: 'Ricardo Lima', email: 'ricardo@imh.org.br', role: 'liderado', department: 'licitacao', active: true, cargo: 'Analista de Licitações' },
  { id: 'u9', name: 'Juliana Souza', email: 'juliana@imh.org.br', role: 'liderado', department: 'dp', active: true, cargo: 'Assistente de DP' },
  { id: 'u10', name: 'Marcos Rocha', email: 'marcos@imh.org.br', role: 'coordenacao', department: 'dp', active: true, cargo: 'Coordenador de DP' },
  { id: 'u11', name: 'Nathalie', email: 'nathalie@imh.org.br', role: 'diretoria', department: 'diretoria', active: true, cargo: 'Diretora' },
];

export const mockProcesses: Process[] = [
  {
    id: 'p1', nup: 'IMH-2026/00142', title: 'Solicitação de Férias - Luísa Ferreira',
    description: 'Solicitação de férias para o período de 15/04 a 30/04/2026.',
    module: 'rh', status: 'aguardando_aprovacao', priority: 'media',
    assignedTo: 'u4', createdBy: 'u7', department: 'rh', currentDepartment: 'presidencia',
    createdAt: '2026-03-15', updatedAt: '2026-03-28', deadline: '2026-04-05',
    timeline: [
      { id: 't1', action: 'Processo criado', user: 'Luísa Ferreira', department: 'RH', date: '2026-03-15 09:00', description: 'Solicitação de férias registrada no sistema.', type: 'criacao' },
      { id: 't2', action: 'Tramitado para Coordenação de RH', user: 'Luísa Ferreira', department: 'RH', date: '2026-03-15 09:05', description: 'Processo tramitado para coordenação de RH.', type: 'tramitacao', fromDepartment: 'RH', toDepartment: 'RH' },
      { id: 't3', action: 'Em análise', user: 'João Pereira', department: 'RH', date: '2026-03-20 14:30', description: 'Coordenador iniciou análise do saldo de férias.', type: 'analise' },
      { id: 't4', action: 'Tramitado para Presidência', user: 'João Pereira', department: 'RH', date: '2026-03-28 10:00', description: 'Saldo verificado. Aguardando aprovação da Presidência.', type: 'tramitacao', fromDepartment: 'RH', toDepartment: 'Presidência' },
    ],
    documents: [
      { id: 'd1', name: 'formulario_ferias.pdf', type: 'PDF', size: '245 KB', uploadedBy: 'Luísa Ferreira', uploadedAt: '2026-03-15' },
    ],
    comments: [
      { id: 'c1', user: 'João Pereira', text: 'Saldo de férias conferido. 30 dias disponíveis.', date: '2026-03-28 10:00', department: 'RH' },
    ],
  },
  {
    id: 'p2', nup: 'IMH-2026/00138', title: 'Pagamento Fornecedor - Gráfica Express',
    description: 'Pagamento referente à impressão de material didático - NF 4521.',
    module: 'financeiro', status: 'em_analise', priority: 'alta',
    assignedTo: 'u6', createdBy: 'u3', department: 'financeiro', currentDepartment: 'financeiro',
    createdAt: '2026-03-10', updatedAt: '2026-03-27', deadline: '2026-04-01',
    value: 12500.00,
    timeline: [
      { id: 't5', action: 'Processo criado', user: 'Ana Oliveira', department: 'Financeiro', date: '2026-03-10 08:30', description: 'Solicitação de pagamento registrada.', type: 'criacao' },
      { id: 't6', action: 'Atribuído a Pedro Almeida', user: 'Ana Oliveira', department: 'Financeiro', date: '2026-03-10 08:35', description: 'Atribuído a Pedro Almeida para conferência documental.', type: 'tramitacao' },
      { id: 't7', action: 'Em análise', user: 'Pedro Almeida', department: 'Financeiro', date: '2026-03-12 10:00', description: 'Verificação de nota fiscal e documentos comprobatórios.', type: 'analise' },
    ],
    documents: [
      { id: 'd2', name: 'nota_fiscal_4521.pdf', type: 'PDF', size: '1.2 MB', uploadedBy: 'Ana Oliveira', uploadedAt: '2026-03-10' },
      { id: 'd3', name: 'contrato_grafica.pdf', type: 'PDF', size: '890 KB', uploadedBy: 'Ana Oliveira', uploadedAt: '2026-03-10' },
    ],
    comments: [
      { id: 'c2', user: 'Pedro Almeida', text: 'NF conferida, aguardando validação do contrato.', date: '2026-03-27 16:00', department: 'Financeiro' },
    ],
  },
  {
    id: 'p3', nup: 'IMH-2026/00155', title: 'Pregão Eletrônico - Material de Escritório',
    description: 'Abertura de pregão eletrônico para aquisição de material de escritório para o exercício 2026.',
    module: 'licitacao', status: 'em_execucao', priority: 'alta',
    assignedTo: 'u8', createdBy: 'u5', department: 'licitacao', currentDepartment: 'licitacao',
    createdAt: '2026-03-01', updatedAt: '2026-03-29', deadline: '2026-04-15',
    value: 45000.00,
    timeline: [
      { id: 't8', action: 'Processo criado', user: 'Cris', department: 'Gestar', date: '2026-03-01 10:00', description: 'Demanda de material de escritório registrada.', type: 'criacao' },
      { id: 't9', action: 'Tramitado para Licitação', user: 'Cris', department: 'Gestar', date: '2026-03-02 08:00', description: 'Processo encaminhado ao setor de Licitação.', type: 'tramitacao', fromDepartment: 'Gestar', toDepartment: 'Licitação' },
      { id: 't10', action: 'Em cotação', user: 'Ricardo Lima', department: 'Licitação', date: '2026-03-05 14:00', description: 'Pesquisa de mercado em andamento.', type: 'analise' },
      { id: 't11', action: 'Edital publicado', user: 'Ricardo Lima', department: 'Licitação', date: '2026-03-25 08:00', description: 'Edital publicado no portal de compras.', type: 'execucao' },
    ],
    documents: [
      { id: 'd4', name: 'edital_pregao_001.pdf', type: 'PDF', size: '3.4 MB', uploadedBy: 'Ricardo Lima', uploadedAt: '2026-03-25' },
      { id: 'd5', name: 'termo_referencia.pdf', type: 'PDF', size: '1.8 MB', uploadedBy: 'Cris', uploadedAt: '2026-03-01' },
    ],
    comments: [],
  },
  {
    id: 'p4', nup: 'IMH-2026/00160', title: 'Admissão - Roberto Nascimento',
    description: 'Processo de admissão do novo colaborador para o setor de projetos.',
    module: 'dp', status: 'aberto', priority: 'media',
    assignedTo: 'u9', createdBy: 'u10', department: 'dp', currentDepartment: 'dp',
    createdAt: '2026-03-28', updatedAt: '2026-03-28', deadline: '2026-04-10',
    timeline: [
      { id: 't12', action: 'Processo criado', user: 'Marcos Rocha', department: 'DP', date: '2026-03-28 11:00', description: 'Processo de admissão aberto após aprovação de vaga.', type: 'criacao' },
    ],
    documents: [],
    comments: [],
  },
  {
    id: 'p5', nup: 'IMH-2026/00101', title: 'Reembolso de Despesas - Evento Educacional',
    description: 'Reembolso de despesas com transporte e alimentação para evento em Juazeiro do Norte.',
    module: 'financeiro', status: 'concluido', priority: 'baixa',
    assignedTo: 'u6', createdBy: 'u6', department: 'financeiro', currentDepartment: 'financeiro',
    createdAt: '2026-02-20', updatedAt: '2026-03-05', deadline: '2026-03-10',
    value: 1850.00,
    timeline: [
      { id: 't13', action: 'Processo criado', user: 'Pedro Almeida', department: 'Financeiro', date: '2026-02-20 09:00', description: 'Solicitação de reembolso.', type: 'criacao' },
      { id: 't14', action: 'Em análise', user: 'Ana Oliveira', department: 'Financeiro', date: '2026-02-22 14:00', description: 'Conferência de comprovantes.', type: 'analise' },
      { id: 't15', action: 'Aprovado', user: 'Ana Oliveira', department: 'Financeiro', date: '2026-02-25 10:00', description: 'Reembolso aprovado.', type: 'aprovacao' },
      { id: 't16', action: 'Pago', user: 'Ana Oliveira', department: 'Financeiro', date: '2026-03-05 08:00', description: 'Valor creditado na conta.', type: 'conclusao' },
    ],
    documents: [
      { id: 'd6', name: 'comprovantes_despesas.pdf', type: 'PDF', size: '2.1 MB', uploadedBy: 'Pedro Almeida', uploadedAt: '2026-02-20' },
    ],
    comments: [],
  },
  {
    id: 'p6', nup: 'IMH-2026/00130', title: 'Renovação de Contrato - Segurança Patrimonial',
    description: 'Renovação do contrato de prestação de serviços de segurança patrimonial.',
    module: 'licitacao', status: 'aguardando_aprovacao', priority: 'urgente',
    assignedTo: 'u5', createdBy: 'u5', department: 'licitacao', currentDepartment: 'presidencia',
    createdAt: '2026-03-05', updatedAt: '2026-03-29', deadline: '2026-03-31',
    value: 180000.00,
    recurring: {
      enabled: true, frequency: 'anual', nextDate: '2027-03-05',
      description: 'Renovação anual obrigatória do contrato de segurança patrimonial.',
    },
    timeline: [
      { id: 't17', action: 'Processo criado', user: 'Cris', department: 'Gestar', date: '2026-03-05 10:00', description: 'Identificada necessidade de renovação.', type: 'criacao' },
      { id: 't18', action: 'Em análise', user: 'Cris', department: 'Gestar', date: '2026-03-10 08:00', description: 'Análise de desempenho contratual.', type: 'analise' },
      { id: 't19', action: 'Parecer jurídico', user: 'Cris', department: 'Gestar', date: '2026-03-20 14:00', description: 'Enviado para parecer jurídico favorável.', type: 'analise' },
      { id: 't20', action: 'Tramitado para Presidência', user: 'Cris', department: 'Gestar', date: '2026-03-29 09:00', description: 'Aguardando assinatura da Presidência (Glorinha).', type: 'tramitacao', fromDepartment: 'Gestar', toDepartment: 'Presidência' },
    ],
    documents: [
      { id: 'd7', name: 'parecer_juridico.pdf', type: 'PDF', size: '540 KB', uploadedBy: 'Cris', uploadedAt: '2026-03-20' },
      { id: 'd8', name: 'relatorio_desempenho.pdf', type: 'PDF', size: '1.5 MB', uploadedBy: 'Cris', uploadedAt: '2026-03-10' },
    ],
    comments: [
      { id: 'c3', user: 'Cris', text: 'URGENTE: Contrato vence em 31/03. Precisa de assinatura imediata da Glorinha.', date: '2026-03-29 09:00', department: 'Gestar' },
    ],
  },
  {
    id: 'p7', nup: 'IMH-2026/00165', title: 'Avaliação de Desempenho - Ciclo 2026.1',
    description: 'Processo de avaliação de desempenho semestral dos colaboradores.',
    module: 'rh', status: 'em_execucao', priority: 'media',
    assignedTo: 'u7', createdBy: 'u4', department: 'rh', currentDepartment: 'rh',
    createdAt: '2026-03-20', updatedAt: '2026-03-29', deadline: '2026-04-20',
    recurring: {
      enabled: true, frequency: 'semestral', nextDate: '2026-09-20',
      description: 'Avaliação de desempenho semestral obrigatória de todos os colaboradores.',
    },
    timeline: [
      { id: 't21', action: 'Processo criado', user: 'João Pereira', department: 'RH', date: '2026-03-20 08:00', description: 'Abertura do ciclo de avaliação 2026.1.', type: 'criacao' },
      { id: 't22', action: 'Formulários distribuídos', user: 'Luísa Ferreira', department: 'RH', date: '2026-03-22 10:00', description: 'Formulários enviados para todos os setores.', type: 'execucao' },
    ],
    documents: [],
    comments: [],
  },
  {
    id: 'p8', nup: 'IMH-2026/00170', title: 'Compra de Equipamentos de TI',
    description: 'Aquisição de 10 notebooks e 5 monitores para renovação do parque tecnológico.',
    module: 'licitacao', status: 'aberto', priority: 'alta',
    assignedTo: 'u8', createdBy: 'u1', department: 'licitacao', currentDepartment: 'licitacao',
    createdAt: '2026-03-29', updatedAt: '2026-03-29', deadline: '2026-05-15',
    value: 95000.00,
    timeline: [
      { id: 't23', action: 'Processo criado', user: 'Carlos Silva', department: 'TI', date: '2026-03-29 14:00', description: 'Solicitação de compra de equipamentos de TI.', type: 'criacao' },
    ],
    documents: [
      { id: 'd9', name: 'especificacao_tecnica.pdf', type: 'PDF', size: '780 KB', uploadedBy: 'Carlos Silva', uploadedAt: '2026-03-29' },
    ],
    comments: [],
  },
  {
    id: 'p9', nup: 'IMH-2026/00175', title: 'Folha de Pagamento - Março/2026',
    description: 'Processamento da folha de pagamento mensal referente a março de 2026.',
    module: 'dp', status: 'em_execucao', priority: 'alta',
    assignedTo: 'u9', createdBy: 'u10', department: 'dp', currentDepartment: 'financeiro',
    createdAt: '2026-03-25', updatedAt: '2026-03-29', deadline: '2026-03-30',
    recurring: {
      enabled: true, frequency: 'mensal', nextDate: '2026-04-25',
      description: 'Processamento mensal obrigatório da folha de pagamento.',
    },
    timeline: [
      { id: 't24', action: 'Processo criado', user: 'Marcos Rocha', department: 'DP', date: '2026-03-25 08:00', description: 'Início do processamento da folha mensal.', type: 'criacao' },
      { id: 't25', action: 'Em processamento', user: 'Juliana Souza', department: 'DP', date: '2026-03-27 10:00', description: 'Cálculos de horas extras e descontos em andamento.', type: 'execucao' },
      { id: 't26b', action: 'Tramitado para Financeiro', user: 'Marcos Rocha', department: 'DP', date: '2026-03-28 16:00', description: 'Folha calculada. Encaminhado ao Financeiro para pagamento.', type: 'tramitacao', fromDepartment: 'DP', toDepartment: 'Financeiro' },
    ],
    documents: [],
    comments: [],
  },
  {
    id: 'p10', nup: 'IMH-2026/00180', title: 'Relatório Trimestral - Prestação de Contas',
    description: 'Elaboração do relatório trimestral de prestação de contas para o conselho.',
    module: 'financeiro', status: 'aguardando_aprovacao', priority: 'alta',
    assignedTo: 'u3', createdBy: 'u3', department: 'financeiro', currentDepartment: 'presidencia',
    createdAt: '2026-03-20', updatedAt: '2026-03-29', deadline: '2026-04-05',
    recurring: {
      enabled: true, frequency: 'trimestral', nextDate: '2026-06-20',
      description: 'Relatório trimestral de prestação de contas ao conselho.',
    },
    timeline: [
      { id: 't26', action: 'Processo criado', user: 'Ana Oliveira', department: 'Financeiro', date: '2026-03-20 09:00', description: 'Início da elaboração do relatório Q1.', type: 'criacao' },
      { id: 't27', action: 'Em revisão', user: 'Ana Oliveira', department: 'Financeiro', date: '2026-03-28 14:00', description: 'Relatório finalizado, enviado para aprovação da Diretoria.', type: 'tramitacao', fromDepartment: 'Financeiro', toDepartment: 'Diretoria' },
      { id: 't28', action: 'Tramitado para Presidência', user: 'Nathalie', department: 'Diretoria', date: '2026-03-29 09:00', description: 'Aprovado pela Diretoria. Encaminhado para Presidência.', type: 'tramitacao', fromDepartment: 'Diretoria', toDepartment: 'Presidência' },
    ],
    documents: [
      { id: 'd10', name: 'relatorio_q1_2026.pdf', type: 'PDF', size: '4.2 MB', uploadedBy: 'Ana Oliveira', uploadedAt: '2026-03-28' },
    ],
    comments: [
      { id: 'c4', user: 'Ana Oliveira', text: 'Relatório Q1 finalizado. Aguardando aprovação da Nathalie e Glorinha.', date: '2026-03-29 08:00', department: 'Financeiro' },
    ],
  },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Processo urgente', message: 'Renovação de contrato de segurança vence em 2 dias!', type: 'urgent', read: false, date: '2026-03-29 09:00', processId: 'p6' },
  { id: 'n2', title: 'Nova atribuição', message: 'Você recebeu o processo IMH-2026/00170 - Compra de Equipamentos de TI.', type: 'info', read: false, date: '2026-03-29 14:00', processId: 'p8' },
  { id: 'n3', title: 'Prazo próximo', message: 'Pagamento Fornecedor - Gráfica Express vence em 3 dias.', type: 'warning', read: false, date: '2026-03-29 08:00', processId: 'p2' },
  { id: 'n4', title: 'Processo concluído', message: 'Reembolso de despesas foi concluído com sucesso.', type: 'success', read: true, date: '2026-03-05 08:00', processId: 'p5' },
  { id: 'n5', title: 'Aprovação pendente', message: 'Férias de Luísa Ferreira aguardam sua aprovação.', type: 'info', read: false, date: '2026-03-28 10:00', processId: 'p1' },
  { id: 'n6', title: 'Demanda recorrente', message: 'Folha de pagamento de abril será gerada automaticamente em 25/04.', type: 'info', read: false, date: '2026-03-29 07:00' },
  { id: 'n7', title: 'Aprovação pendente', message: 'Relatório trimestral Q1 aguarda aprovação da Presidência.', type: 'warning', read: false, date: '2026-03-29 08:00', processId: 'p10' },
];

export const mockColaboradores: Colaborador[] = [
  {
    id: 'col1', userId: 'u7', cpf: '123.456.789-00', rg: '2001234 SSP/CE',
    dataNascimento: '1992-05-15', dataAdmissao: '2022-03-01',
    cargo: 'Assistente de RH', salario: 3200.00,
    endereco: 'Rua das Flores, 123 - Fortaleza/CE', telefone: '(85) 99999-1234',
    documentos: [
      { id: 'cd1', name: 'contrato_trabalho.pdf', type: 'PDF', size: '1.5 MB', uploadedBy: 'João Pereira', uploadedAt: '2022-03-01' },
      { id: 'cd2', name: 'carteira_trabalho.pdf', type: 'PDF', size: '800 KB', uploadedBy: 'João Pereira', uploadedAt: '2022-03-01' },
    ],
    ferias: [
      { id: 'f1', periodo: '2023/2024', inicio: '2024-01-15', fim: '2024-02-14', status: 'concluida', diasUtilizados: 30, saldoRestante: 0 },
      { id: 'f2', periodo: '2024/2025', inicio: '2025-07-01', fim: '2025-07-15', status: 'concluida', diasUtilizados: 15, saldoRestante: 15 },
    ],
    historico: [
      { id: 'h1', tipo: 'admissao', descricao: 'Admissão como Assistente de RH', data: '2022-03-01', responsavel: 'João Pereira' },
      { id: 'h2', tipo: 'treinamento', descricao: 'Capacitação em Legislação Trabalhista', data: '2022-06-15', responsavel: 'João Pereira' },
      { id: 'h3', tipo: 'elogio', descricao: 'Reconhecimento por desempenho exemplar no ciclo 2024.2', data: '2025-01-10', responsavel: 'João Pereira' },
    ],
  },
  {
    id: 'col2', userId: 'u6', cpf: '987.654.321-00', rg: '2005678 SSP/CE',
    dataNascimento: '1988-11-22', dataAdmissao: '2021-06-15',
    cargo: 'Assistente Financeiro', salario: 3500.00,
    endereco: 'Av. Beira Mar, 456 - Fortaleza/CE', telefone: '(85) 98888-5678',
    documentos: [
      { id: 'cd3', name: 'contrato_trabalho.pdf', type: 'PDF', size: '1.3 MB', uploadedBy: 'Ana Oliveira', uploadedAt: '2021-06-15' },
    ],
    ferias: [
      { id: 'f3', periodo: '2022/2023', inicio: '2023-12-20', fim: '2024-01-19', status: 'concluida', diasUtilizados: 30, saldoRestante: 0 },
    ],
    historico: [
      { id: 'h4', tipo: 'admissao', descricao: 'Admissão como Assistente Financeiro', data: '2021-06-15', responsavel: 'Ana Oliveira' },
      { id: 'h5', tipo: 'promocao', descricao: 'Promoção a Analista Financeiro Júnior', data: '2023-01-01', responsavel: 'Ana Oliveira' },
    ],
  },
  {
    id: 'col3', userId: 'u8', cpf: '456.789.123-00', rg: '2009012 SSP/CE',
    dataNascimento: '1995-08-10', dataAdmissao: '2023-02-01',
    cargo: 'Analista de Licitações', salario: 4200.00,
    endereco: 'Rua do Comércio, 789 - Fortaleza/CE', telefone: '(85) 97777-9012',
    documentos: [
      { id: 'cd4', name: 'contrato_trabalho.pdf', type: 'PDF', size: '1.4 MB', uploadedBy: 'Cris', uploadedAt: '2023-02-01' },
    ],
    ferias: [],
    historico: [
      { id: 'h6', tipo: 'admissao', descricao: 'Admissão como Analista de Licitações', data: '2023-02-01', responsavel: 'Cris' },
      { id: 'h7', tipo: 'treinamento', descricao: 'Treinamento em Lei de Licitações (14.133/2021)', data: '2023-04-15', responsavel: 'Cris' },
    ],
  },
  {
    id: 'col4', userId: 'u9', cpf: '321.654.987-00', rg: '2003456 SSP/CE',
    dataNascimento: '1990-02-28', dataAdmissao: '2020-08-10',
    cargo: 'Assistente de DP', salario: 3000.00,
    endereco: 'Rua da Paz, 321 - Fortaleza/CE', telefone: '(85) 96666-3456',
    documentos: [
      { id: 'cd5', name: 'contrato_trabalho.pdf', type: 'PDF', size: '1.2 MB', uploadedBy: 'Marcos Rocha', uploadedAt: '2020-08-10' },
    ],
    ferias: [
      { id: 'f4', periodo: '2024/2025', inicio: '2026-04-15', fim: '2026-04-30', status: 'agendada', diasUtilizados: 0, saldoRestante: 30 },
    ],
    historico: [
      { id: 'h8', tipo: 'admissao', descricao: 'Admissão como Assistente de DP', data: '2020-08-10', responsavel: 'Marcos Rocha' },
    ],
  },
];

export const roleLabels: Record<UserRole, string> = {
  ti_admin: 'Supervisor de TI',
  presidencia: 'Presidência',
  diretoria: 'Diretoria',
  coordenacao: 'Coordenação',
  liderado: 'Colaborador',
};

export const departmentLabels: Record<Department, string> = {
  financeiro: 'Financeiro',
  rh: 'Recursos Humanos',
  licitacao: 'Licitação e Compras',
  dp: 'Departamento Pessoal',
  ti: 'Tecnologia da Informação',
  presidencia: 'Presidência',
  diretoria: 'Diretoria',
  gestar: 'Gestar',
  gerencia_tecnica: 'Gerência Técnica',
};

export const statusLabels: Record<ProcessStatus, string> = {
  aberto: 'Aberto',
  em_analise: 'Em Análise',
  aguardando_aprovacao: 'Aguardando Aprovação',
  em_execucao: 'Em Execução',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
  ganha: 'Licitação Ganha',
  perdida: 'Licitação Perdida',
};

export const priorityLabels: Record<ProcessPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const moduleLabels: Record<ProcessModule, string> = {
  rh: 'Recursos Humanos',
  financeiro: 'Financeiro',
  licitacao: 'Licitação e Compras',
  dp: 'Departamento Pessoal',
  gerencia_tecnica: 'Gerência Técnica',
};

export const frequencyLabels: Record<string, string> = {
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};
