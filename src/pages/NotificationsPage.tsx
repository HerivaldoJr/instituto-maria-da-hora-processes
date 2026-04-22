import { useProcesses } from '@/contexts/ProcessContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';

const typeIcons = {
  urgent: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  success: CheckCircle2,
};

const typeStyles = {
  urgent: 'border-l-destructive bg-destructive/5',
  warning: 'border-l-warning bg-warning/5',
  info: 'border-l-info bg-info/5',
  success: 'border-l-success bg-success/5',
};

const NotificationsPage = () => {
  const { notifications, markNotificationRead } = useProcesses();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold text-foreground">Notificações</h1>
      <div className="space-y-2">
        {notifications.map((n, i) => {
          const Icon = typeIcons[n.type];
          return (
            <motion.button key={n.id}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.processId) navigate(`/processos/${n.processId}`);
              }}
              className={`w-full text-left p-4 rounded-xl border-l-4 ${typeStyles[n.type]} ${
                !n.read ? 'bg-card shadow-sm' : 'opacity-60'
              } hover:shadow-md transition-all`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${
                  n.type === 'urgent' ? 'text-destructive' :
                  n.type === 'warning' ? 'text-warning' :
                  n.type === 'success' ? 'text-success' : 'text-info'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{n.date}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;
