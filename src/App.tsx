import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProcessProvider } from "@/contexts/ProcessContext";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import KanbanPage from "./pages/KanbanPage";
import ProcessListPage from "./pages/ProcessListPage";
import ProcessDetailPage from "./pages/ProcessDetailPage";
import NewProcessPage from "./pages/NewProcessPage";
import NotificationsPage from "./pages/NotificationsPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import DossiePage from "./pages/DossiePage";
import RecurringPage from "./pages/RecurringPage";
import DesempenhoPage from "./pages/DesempenhoPage";
import AuditPage from "./pages/AuditPage";
import SettingsPage from "./pages/SettingsPage";
import { ModulePage } from "./pages/PlaceholderPages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <ProcessProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/processos" element={<ProcessListPage />} />
          <Route path="/processos/:id" element={<ProcessDetailPage />} />
          <Route path="/novo-processo" element={<NewProcessPage />} />
          <Route path="/notificacoes" element={<NotificationsPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/aprovacoes" element={<ApprovalsPage />} />
          <Route path="/dossie" element={<DossiePage />} />
          <Route path="/recorrentes" element={<RecurringPage />} />
          <Route path="/desempenho" element={<DesempenhoPage />} />
          <Route path="/modulo" element={<ModulePage />} />
          {user?.role === 'ti_admin' && (
            <>
              <Route path="/usuarios" element={<UsersPage />} />
              <Route path="/auditoria" element={<AuditPage />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
            </>
          )}
        </Route>
      </Routes>
    </ProcessProvider>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
