import { describe, it, expect } from 'vitest';

// Simulando a lógica de negócios de visibilidade extraída do ProcessListPage
function getVisibleProcesses(processes: any[], user: any) {
  if (user.role === 'ti_admin') return processes;
  if (user.role === 'presidencia') return processes;
  if (user.role === 'diretoria') return processes;
  if (user.role === 'coordenacao') {
    return processes.filter((p: any) =>
      p.department === user.department ||
      p.currentDepartment === user.department ||
      (user.department === 'gestar' && p.module === 'licitacao')
    );
  }
  return processes.filter((p: any) => p.assignedTo === user.id || p.createdBy === user.id);
}

describe('Regras de Acesso e Permissões (Processos)', () => {
  const mockProcesses = [
    { id: '1', nup: '001', department: 'rh', currentDepartment: 'financeiro', module: 'rh', createdBy: 'u1', assignedTo: 'u2' },
    { id: '2', nup: '002', department: 'licitacao', currentDepartment: 'licitacao', module: 'licitacao', createdBy: 'u3', assignedTo: 'u4' },
    { id: '3', nup: '003', department: 'dp', currentDepartment: 'presidencia', module: 'dp', createdBy: 'u5', assignedTo: 'u1' } // assignedTo liderado
  ];

  it('TI Admin deve ver todos os processos do sistema', () => {
    const admin = { id: 'admin1', role: 'ti_admin', department: 'ti' };
    const visible = getVisibleProcesses(mockProcesses, admin);
    expect(visible.length).toBe(3);
  });

  it('Coordenador Financeiro deve ver processos do Financeiro, mas não de Licitação se não tramitados pra lá', () => {
    const coordFin = { id: 'coord1', role: 'coordenacao', department: 'financeiro' };
    const visible = getVisibleProcesses(mockProcesses, coordFin);
    // Deve ver apenas o Processo 1 porque está no currentDepartment = financeiro
    expect(visible.length).toBe(1);
    expect(visible[0].id).toBe('1');
  });

  it('Liderados devem ver APENAS os processos criados por eles ou atribuídos a eles', () => {
    const liderado = { id: 'u1', role: 'liderado', department: 'rh' };
    const visible = getVisibleProcesses(mockProcesses, liderado);
    // u1 criou o processo 1 e foi designado (assignedTo) no processo 3
    expect(visible.length).toBe(2);
    const ids = visible.map(v => v.id);
    expect(ids).toContain('1');
    expect(ids).toContain('3');
    expect(ids).not.toContain('2');
  });

  it('Coordenadores do Gestar devem ter visibilidade global no módulo de "Licitação"', () => {
    const gestar = { id: 'g1', role: 'coordenacao', department: 'gestar' };
    const visible = getVisibleProcesses(mockProcesses, gestar);
    // Gestar tem regra especial de ler todos de licitacao
    expect(visible.some(v => v.id === '2')).toBe(true);
  });
});
