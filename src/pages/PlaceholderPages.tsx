import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <Construction className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      <h2 className="text-xl font-heading font-bold text-foreground">{title}</h2>
      <p className="text-muted-foreground text-sm mt-2 max-w-md">{description}</p>
    </motion.div>
  </div>
);

export const AuditPage = () => <PlaceholderPage title="Auditoria" description="Logs de auditoria e rastreamento de ações do sistema." />;
export const SettingsPage = () => <PlaceholderPage title="Configurações" description="Configurações do sistema e editor de workflows." />;
export const ModulePage = () => <PlaceholderPage title="Módulo Setorial" description="Funcionalidades específicas do seu departamento." />;
