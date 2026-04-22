import { useEffect, useRef } from 'react';
import { Process, countBusinessDays } from '@/data/mockData';

interface UseSlaAlertsProps {
  processes: Process[];
  addNotification: (title: string, message: string, type: 'info' | 'warning' | 'success' | 'urgent', processId?: string) => void;
}

export function useSlaAlerts({ processes, addNotification }: UseSlaAlertsProps) {
  const alertedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const activeProcesses = processes.filter(
      p => p.status !== 'concluido' && p.status !== 'arquivado' && p.deadline
    );

    for (const p of activeProcesses) {
      const deadlineDate = new Date(p.deadline + 'T23:59:59');
      const diffMs = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // On the day
      if (diffDays === 0 && !alertedIds.current.has(`${p.id}-today`)) {
        alertedIds.current.add(`${p.id}-today`);
        addNotification(
          '⚠️ SLA vence hoje!',
          `O processo ${p.nup} - ${p.title} vence HOJE (${p.deadline}).`,
          'urgent',
          p.id
        );
      }

      // 1 day before
      if (diffDays === 1 && !alertedIds.current.has(`${p.id}-1day`)) {
        alertedIds.current.add(`${p.id}-1day`);
        addNotification(
          '⏰ SLA vence amanhã',
          `O processo ${p.nup} - ${p.title} vence amanhã (${p.deadline}).`,
          'warning',
          p.id
        );
      }

      // Already overdue
      if (diffDays < 0 && !alertedIds.current.has(`${p.id}-overdue`)) {
        alertedIds.current.add(`${p.id}-overdue`);
        addNotification(
          '🔴 SLA vencido!',
          `O processo ${p.nup} - ${p.title} está ${Math.abs(diffDays)} dia(s) atrasado!`,
          'urgent',
          p.id
        );
      }
    }
  }, [processes, addNotification]);
}
