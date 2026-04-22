import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProcesses } from '@/contexts/ProcessContext';
import { roleLabels, departmentLabels } from '@/data/mockData';
import {
  LayoutDashboard, FileText, KanbanSquare, Users, Settings, LogOut,
  Bell, ChevronLeft, ChevronRight, Shield, Menu, PlusCircle,
  DollarSign, UserCog, ShoppingCart, ClipboardList, BarChart3, FolderOpen, Repeat,
  AlertTriangle, Info, CheckCircle2, AlertCircle, X, CheckCheck, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoHorizontal from '@/assets/logo-horizontal.webp';

const notifIcons = { urgent: AlertTriangle, warning: AlertCircle, info: Info, success: CheckCircle2 };
const notifColors = {
  urgent: 'text-destructive', warning: 'text-warning', info: 'text-info', success: 'text-success',
};

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useProcesses();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const menuItems = getMenuItems(user.role, user.department);
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => (
    <button
      onClick={() => { navigate(item.path); setMobileOpen(false); }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
        isActive(item.path)
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      }`}>
      <item.icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-medium">
          {item.badge}
        </span>
      )}
    </button>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {collapsed ? (
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white font-heading font-bold text-sm">IM</span>
            </div>
          ) : (
            <img src={logoHorizontal} alt="Instituto Maria da Hora" className="h-9 brightness-0 invert opacity-80" />
          )}
        </div>
      </div>
      {!collapsed && (
        <div className="px-3 pt-3">
          <button onClick={() => { navigate('/novo-processo'); setMobileOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity">
            <PlusCircle className="w-4 h-4" /> Novo Processo
          </button>
        </div>
      )}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map(item => <NavItem key={item.path} item={item} />)}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-sidebar-foreground/50">{user.cargo || roleLabels[user.role]}</p>
          </div>
        )}
        <button onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all text-sm">
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );

  const recentNotifs = notifications.slice(0, 8);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`hidden md:flex flex-col gradient-sidebar border-r border-sidebar-border transition-all duration-300 relative ${collapsed ? 'w-16' : 'w-64'}`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-card border border-border shadow flex items-center justify-center z-50 hover:bg-muted">
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] gradient-sidebar z-50 md:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="font-heading font-semibold text-foreground text-sm md:text-base">
              Instituto Maria da Hora
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification bell with popup */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                      <h3 className="text-sm font-heading font-semibold text-foreground">Notificações</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={() => markAllNotificationsRead()}
                            className="text-[11px] text-primary hover:underline flex items-center gap-1">
                            <CheckCheck className="w-3 h-3" /> Marcar todas
                          </button>
                        )}
                        <button onClick={() => setNotifOpen(false)}>
                          <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-border">
                      {recentNotifs.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">Sem notificações</div>
                      ) : recentNotifs.map(n => {
                        const Icon = notifIcons[n.type];
                        return (
                          <button key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.processId) navigate(`/processos/${n.processId}`);
                              setNotifOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3 ${!n.read ? 'bg-primary/5' : ''}`}>
                            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${notifColors[n.type]}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">
                                {new Date(n.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-border">
                      <button onClick={() => { navigate('/notificacoes'); setNotifOpen(false); }}
                        className="w-full text-center py-2.5 text-sm text-primary font-medium hover:bg-muted/50 transition-colors">
                        Ver todas as notificações
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:block text-right mr-2">
              <p className="text-xs font-medium text-foreground">{user.name}</p>
              <p className="text-[10px] text-muted-foreground">{departmentLabels[user.department]}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">{user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function getMenuItems(role: string, department: string) {
  const base = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', badge: undefined as string | undefined },
    { icon: KanbanSquare, label: 'Kanban', path: '/kanban', badge: undefined },
    { icon: FileText, label: 'Processos', path: '/processos', badge: undefined },
    { icon: Repeat, label: 'Recorrentes', path: '/recorrentes', badge: undefined },
  ];

  if (role === 'ti_admin') {
    return [
      ...base,
      { icon: Activity, label: 'Desempenho', path: '/desempenho', badge: undefined },
      { icon: BarChart3, label: 'Relatórios', path: '/relatorios', badge: undefined },
      { icon: Users, label: 'Usuários', path: '/usuarios', badge: undefined },
      { icon: Shield, label: 'Auditoria', path: '/auditoria', badge: undefined },
      { icon: Settings, label: 'Configurações', path: '/configuracoes', badge: undefined },
    ];
  }

  if (role === 'presidencia' || role === 'diretoria') {
    return [
      ...base,
      { icon: ClipboardList, label: 'Aprovações', path: '/aprovacoes', badge: '3' },
      { icon: Activity, label: 'Desempenho', path: '/desempenho', badge: undefined },
      { icon: BarChart3, label: 'Relatórios', path: '/relatorios', badge: undefined },
    ];
  }

  if (role === 'coordenacao') {
    const moduleIcon = department === 'financeiro' ? DollarSign
      : department === 'licitacao' || department === 'gestar' ? ShoppingCart
      : department === 'rh' ? UserCog
      : ClipboardList;
    const items = [
      ...base,
      { icon: moduleIcon, label: departmentLabels[department as keyof typeof departmentLabels] || department, path: '/modulo', badge: undefined },
      { icon: Activity, label: 'Desempenho', path: '/desempenho', badge: undefined },
      { icon: BarChart3, label: 'Relatórios', path: '/relatorios', badge: undefined },
    ];
    if (department === 'rh' || department === 'dp') {
      items.push({ icon: FolderOpen, label: 'Dossiê Digital', path: '/dossie', badge: undefined });
    }
    return items;
  }

  return base;
}

export default AppLayout;
