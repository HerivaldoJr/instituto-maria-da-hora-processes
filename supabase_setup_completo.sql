-- =====================================================
-- SUITE Maria da Hora - Script Completo para Supabase
-- Execute no SQL Editor do Supabase (supabase.com > SQL Editor)
-- =====================================================

-- 1. ENUMS
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('ti_admin', 'presidencia', 'diretoria', 'coordenacao', 'liderado');

DROP TYPE IF EXISTS public.department_type CASCADE;
CREATE TYPE public.department_type AS ENUM ('financeiro', 'rh', 'licitacao', 'dp', 'ti', 'presidencia', 'diretoria', 'gestar', 'gerencia_tecnica');

DROP TYPE IF EXISTS public.process_status CASCADE;
CREATE TYPE public.process_status AS ENUM ('aberto', 'em_analise', 'aguardando_aprovacao', 'em_execucao', 'concluido', 'arquivado', 'ganha', 'perdida');

DROP TYPE IF EXISTS public.process_priority CASCADE;
CREATE TYPE public.process_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');

DROP TYPE IF EXISTS public.process_module CASCADE;
CREATE TYPE public.process_module AS ENUM ('rh', 'financeiro', 'licitacao', 'dp', 'gerencia_tecnica');

DROP TYPE IF EXISTS public.timeline_event_type CASCADE;
CREATE TYPE public.timeline_event_type AS ENUM ('criacao', 'tramitacao', 'analise', 'aprovacao', 'rejeicao', 'execucao', 'conclusao', 'comentario', 'documento', 'edicao');

DROP TYPE IF EXISTS public.notification_type CASCADE;
CREATE TYPE public.notification_type AS ENUM ('info', 'warning', 'success', 'urgent');

-- 2. TABELAS

-- Profiles
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'liderado',
  department public.department_type NOT NULL,
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  cargo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories
DROP TABLE IF EXISTS public.process_categories CASCADE;
CREATE TABLE IF NOT EXISTS public.process_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module public.process_module NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Processes
DROP TABLE IF EXISTS public.processes CASCADE;
CREATE TABLE IF NOT EXISTS public.processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nup TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  module public.process_module NOT NULL,
  category_id UUID REFERENCES public.process_categories(id),
  project_name TEXT,
  resource_source TEXT,
  status public.process_status NOT NULL DEFAULT 'aberto',
  priority public.process_priority NOT NULL DEFAULT 'media',
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  department public.department_type NOT NULL,
  current_department public.department_type NOT NULL,
  deadline DATE,
  value NUMERIC(15,2),
  confidential BOOLEAN NOT NULL DEFAULT false,
  confidential_by UUID REFERENCES public.profiles(id),
  pending_acceptance BOOLEAN NOT NULL DEFAULT false,
  pending_acceptance_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timeline Events
DROP TABLE IF EXISTS public.timeline_events CASCADE;
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  user_name TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_type public.timeline_event_type NOT NULL DEFAULT 'criacao',
  from_department TEXT,
  to_department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
DROP TABLE IF EXISTS public.documents CASCADE;
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'PDF',
  size TEXT NOT NULL DEFAULT '0 KB',
  uploaded_by TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments
DROP TABLE IF EXISTS public.comments CASCADE;
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
DROP TABLE IF EXISTS public.notifications CASCADE;
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type public.notification_type NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  process_id UUID REFERENCES public.processes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Colaboradores
DROP TABLE IF EXISTS public.colaboradores CASCADE;
CREATE TABLE IF NOT EXISTS public.colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cpf TEXT NOT NULL,
  rg TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  data_admissao DATE NOT NULL,
  cargo TEXT NOT NULL,
  salario NUMERIC(12,2) NOT NULL,
  endereco TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_processes_status ON public.processes(status);
CREATE INDEX IF NOT EXISTS idx_processes_current_dept ON public.processes(current_department);
CREATE INDEX IF NOT EXISTS idx_processes_module ON public.processes(module);
CREATE INDEX IF NOT EXISTS idx_processes_created_by ON public.processes(created_by);
CREATE INDEX IF NOT EXISTS idx_timeline_process ON public.timeline_events(process_id);
CREATE INDEX IF NOT EXISTS idx_documents_process ON public.documents(process_id);
CREATE INDEX IF NOT EXISTS idx_comments_process ON public.comments(process_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- 4. RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_categories ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (para início - depois refinar por role)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_insert_all" ON public.profiles;
CREATE POLICY "profiles_insert_all" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;
CREATE POLICY "profiles_update_all" ON public.profiles FOR UPDATE USING (true);
DROP POLICY IF EXISTS "profiles_delete_all" ON public.profiles;
CREATE POLICY "profiles_delete_all" ON public.profiles FOR DELETE USING (true);

DROP POLICY IF EXISTS "processes_select_all" ON public.processes;
CREATE POLICY "processes_select_all" ON public.processes FOR SELECT USING (true);
DROP POLICY IF EXISTS "processes_insert_all" ON public.processes;
CREATE POLICY "processes_insert_all" ON public.processes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "processes_update_all" ON public.processes;
CREATE POLICY "processes_update_all" ON public.processes FOR UPDATE USING (true);
DROP POLICY IF EXISTS "processes_delete_all" ON public.processes;
CREATE POLICY "processes_delete_all" ON public.processes FOR DELETE USING (true);

DROP POLICY IF EXISTS "timeline_select_all" ON public.timeline_events;
CREATE POLICY "timeline_select_all" ON public.timeline_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "timeline_insert_all" ON public.timeline_events;
CREATE POLICY "timeline_insert_all" ON public.timeline_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "documents_select_all" ON public.documents;
CREATE POLICY "documents_select_all" ON public.documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "documents_insert_all" ON public.documents;
CREATE POLICY "documents_insert_all" ON public.documents FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "comments_select_all" ON public.comments;
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "comments_insert_all" ON public.comments;
CREATE POLICY "comments_insert_all" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_select_all" ON public.notifications;
CREATE POLICY "notifications_select_all" ON public.notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "notifications_insert_all" ON public.notifications;
CREATE POLICY "notifications_insert_all" ON public.notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "notifications_update_all" ON public.notifications;
CREATE POLICY "notifications_update_all" ON public.notifications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "colaboradores_select_all" ON public.colaboradores;
CREATE POLICY "colaboradores_select_all" ON public.colaboradores FOR SELECT USING (true);
DROP POLICY IF EXISTS "colaboradores_insert_all" ON public.colaboradores;
CREATE POLICY "colaboradores_insert_all" ON public.colaboradores FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "colaboradores_update_all" ON public.colaboradores;
CREATE POLICY "colaboradores_update_all" ON public.colaboradores FOR UPDATE USING (true);

DROP POLICY IF EXISTS "categories_select_all" ON public.process_categories;
CREATE POLICY "categories_select_all" ON public.process_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "categories_insert_all" ON public.process_categories;
CREATE POLICY "categories_insert_all" ON public.process_categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "categories_update_all" ON public.process_categories;
CREATE POLICY "categories_update_all" ON public.process_categories FOR UPDATE USING (true);
DROP POLICY IF EXISTS "categories_delete_all" ON public.process_categories;
CREATE POLICY "categories_delete_all" ON public.process_categories FOR DELETE USING (true);

-- 5. TRIGGER para updated_at
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS processes_updated_at ON public.processes;
CREATE TRIGGER processes_updated_at
  BEFORE UPDATE ON public.processes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 6. FUNÇÃO para gerar NUP sequencial
DROP FUNCTION IF EXISTS public.generate_nup() CASCADE;
CREATE OR REPLACE FUNCTION public.generate_nup()
RETURNS TRIGGER AS $$
DECLARE
  seq INT;
BEGIN
  IF NEW.nup IS NULL OR NEW.nup = '' THEN
    SELECT COALESCE(MAX(
      CAST(SPLIT_PART(SPLIT_PART(nup, '/', 2), ' ', 1) AS INTEGER)
    ), 0) + 1 INTO seq FROM public.processes;
    NEW.nup := 'IMH-' || EXTRACT(YEAR FROM now())::TEXT || '/' || LPAD(seq::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS processes_generate_nup ON public.processes;
CREATE TRIGGER processes_generate_nup
  BEFORE INSERT ON public.processes
  FOR EACH ROW EXECUTE FUNCTION public.generate_nup();

-- =====================================================
-- 7. DADOS INICIAIS - LIMPAR E INSERIR
-- =====================================================

-- Limpar dados existentes (ordem de dependência)
TRUNCATE public.notifications CASCADE;
TRUNCATE public.comments CASCADE;
TRUNCATE public.documents CASCADE;
TRUNCATE public.timeline_events CASCADE;
TRUNCATE public.colaboradores CASCADE;
TRUNCATE public.processes CASCADE;
TRUNCATE public.process_categories CASCADE;
TRUNCATE public.profiles CASCADE;

-- 7.1 PROFILES (Usuários)
INSERT INTO public.profiles (id, name, email, role, department, active, cargo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Carlos Silva', 'carlos@imh.org.br', 'ti_admin', 'ti', true, 'Supervisor de TI'),
  ('00000000-0000-0000-0000-000000000002', 'Glorinha', 'glorinha@imh.org.br', 'presidencia', 'presidencia', true, 'Presidente'),
  ('00000000-0000-0000-0000-000000000003', 'Ana Oliveira', 'ana@imh.org.br', 'coordenacao', 'financeiro', true, 'Coordenadora Financeira'),
  ('00000000-0000-0000-0000-000000000004', 'João Pereira', 'joao@imh.org.br', 'coordenacao', 'rh', true, 'Coordenador de RH'),
  ('00000000-0000-0000-0000-000000000005', 'Cris', 'cris@imh.org.br', 'coordenacao', 'gestar', true, 'Coordenadora do Gestar'),
  ('00000000-0000-0000-0000-000000000006', 'Pedro Almeida', 'pedro@imh.org.br', 'liderado', 'financeiro', true, 'Assistente Financeiro'),
  ('00000000-0000-0000-0000-000000000007', 'Luísa Ferreira', 'luisa@imh.org.br', 'liderado', 'rh', true, 'Assistente de RH'),
  ('00000000-0000-0000-0000-000000000008', 'Ricardo Lima', 'ricardo@imh.org.br', 'liderado', 'licitacao', true, 'Analista de Licitações'),
  ('00000000-0000-0000-0000-000000000009', 'Juliana Souza', 'juliana@imh.org.br', 'liderado', 'dp', true, 'Assistente de DP'),
  ('00000000-0000-0000-0000-000000000010', 'Marcos Rocha', 'marcos@imh.org.br', 'coordenacao', 'dp', true, 'Coordenador de DP'),
  ('00000000-0000-0000-0000-000000000011', 'Nathalie', 'nathalie@imh.org.br', 'diretoria', 'diretoria', true, 'Diretora');

-- 7.1.5 CATEGORIES
INSERT INTO public.process_categories (id, module, name, active) VALUES
  ('00000000-0000-0000-0002-000000000001', 'dp', 'Admissão', true),
  ('00000000-0000-0000-0002-000000000002', 'dp', 'Folha de Pagamento', true),
  ('00000000-0000-0000-0002-000000000003', 'dp', 'Férias', true),
  ('00000000-0000-0000-0002-000000000004', 'rh', 'Avaliação de Desempenho', true),
  ('00000000-0000-0000-0002-000000000005', 'rh', 'Recrutamento e Seleção', true),
  ('00000000-0000-0000-0002-000000000006', 'licitacao', 'Pregão Eletrônico', true),
  ('00000000-0000-0000-0002-000000000007', 'licitacao', 'Adesão a Ata', true),
  ('00000000-0000-0000-0002-000000000008', 'financeiro', 'Pagamento Fatura', true),
  ('00000000-0000-0000-0002-000000000009', 'financeiro', 'Prestação de Contas', true),
  ('00000000-0000-0000-0002-000000000010', 'gerencia_tecnica', 'Acompanhamento de Projeto', true),
  ('00000000-0000-0000-0002-000000000011', 'gerencia_tecnica', 'Aditivo de Contrato', true);

-- 7.2 PROCESSES
INSERT INTO public.processes (id, nup, title, description, module, category_id, project_name, resource_source, status, priority, assigned_to, created_by, department, current_department, deadline, value, created_at, updated_at) VALUES
  ('00000000-0000-0000-0001-000000000001', 'IMH-2026/00142', 'Solicitação de Férias - Luísa Ferreira', 'Solicitação de férias para o período de 15/04 a 30/04/2026.', 'rh', '00000000-0000-0000-0002-000000000003', NULL, NULL, 'aguardando_aprovacao', 'media', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'rh', 'presidencia', '2026-04-05', NULL, '2026-03-15', '2026-03-28'),
  ('00000000-0000-0000-0001-000000000002', 'IMH-2026/00138', 'Pagamento Fornecedor - Gráfica Express', 'Pagamento referente à impressão de material didático - NF 4521.', 'financeiro', '00000000-0000-0000-0002-000000000008', 'Educação em Ação', 'Fundo Municipal', 'em_analise', 'alta', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'financeiro', 'financeiro', '2026-04-01', 12500.00, '2026-03-10', '2026-03-27'),
  ('00000000-0000-0000-0001-000000000003', 'IMH-2026/00155', 'Pregão Eletrônico - Material de Escritório', 'Abertura de pregão eletrônico para aquisição de material de escritório para o exercício 2026.', 'licitacao', '00000000-0000-0000-0002-000000000006', NULL, NULL, 'em_execucao', 'alta', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000005', 'licitacao', 'licitacao', '2026-04-15', 45000.00, '2026-03-01', '2026-03-29'),
  ('00000000-0000-0000-0001-000000000004', 'IMH-2026/00160', 'Admissão - Roberto Nascimento', 'Processo de admissão do novo colaborador para o setor de projetos.', 'dp', '00000000-0000-0000-0002-000000000001', NULL, NULL, 'aberto', 'media', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000010', 'dp', 'dp', '2026-04-10', NULL, '2026-03-28', '2026-03-28'),
  ('00000000-0000-0000-0001-000000000005', 'IMH-2026/00101', 'Reembolso de Despesas - Evento Educacional', 'Reembolso de despesas com transporte e alimentação para evento em Juazeiro do Norte.', 'financeiro', '00000000-0000-0000-0002-000000000008', NULL, NULL, 'concluido', 'baixa', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'financeiro', 'financeiro', '2026-03-10', 1850.00, '2026-02-20', '2026-03-05'),
  ('00000000-0000-0000-0001-000000000006', 'IMH-2026/00130', 'Renovação de Contrato - Segurança Patrimonial', 'Renovação do contrato de prestação de serviços de segurança patrimonial.', 'licitacao', '00000000-0000-0000-0002-000000000006', NULL, NULL, 'aguardando_aprovacao', 'urgente', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'licitacao', 'presidencia', '2026-03-31', 180000.00, '2026-03-05', '2026-03-29'),
  ('00000000-0000-0000-0001-000000000007', 'IMH-2026/00165', 'Avaliação de Desempenho - Ciclo 2026.1', 'Processo de avaliação de desempenho semestral dos colaboradores.', 'rh', '00000000-0000-0000-0002-000000000004', NULL, NULL, 'em_execucao', 'media', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004', 'rh', 'rh', '2026-04-20', NULL, '2026-03-20', '2026-03-29'),
  ('00000000-0000-0000-0001-000000000008', 'IMH-2026/00170', 'Compra de Equipamentos de TI', 'Aquisição de 10 notebooks e 5 monitores para renovação do parque tecnológico.', 'licitacao', '00000000-0000-0000-0002-000000000006', 'Ação Social', 'Recurso Próprio', 'aberto', 'alta', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'licitacao', 'licitacao', '2026-05-15', 95000.00, '2026-03-29', '2026-03-29'),
  ('00000000-0000-0000-0001-000000000009', 'IMH-2026/00175', 'Folha de Pagamento - Março/2026', 'Processamento da folha de pagamento mensal referente a março de 2026.', 'dp', '00000000-0000-0000-0002-000000000002', NULL, NULL, 'em_execucao', 'alta', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000010', 'dp', 'financeiro', '2026-03-30', NULL, '2026-03-25', '2026-03-29'),
  ('00000000-0000-0000-0001-000000000010', 'IMH-2026/00180', 'Relatório Trimestral - Prestação de Contas', 'Elaboração do relatório trimestral de prestação de contas para o conselho.', 'financeiro', '00000000-0000-0000-0002-000000000009', NULL, NULL, 'aguardando_aprovacao', 'alta', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'financeiro', 'presidencia', '2026-04-05', NULL, '2026-03-20', '2026-03-29'),
  ('00000000-0000-0000-0001-000000000011', 'IMH-2026/00185', 'Acompanhamento Fundo Municipal', 'Relatório e Controle Mensal', 'gerencia_tecnica', '00000000-0000-0000-0002-000000000010', 'Educação em Ação', 'Fundo Municipal', 'em_analise', 'media', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'gerencia_tecnica', 'gerencia_tecnica', '2026-05-10', 0, '2026-03-10', '2026-03-28');

-- 7.3 TIMELINE EVENTS
INSERT INTO public.timeline_events (process_id, action, user_name, department, description, event_type, from_department, to_department, created_at) VALUES
  -- p1: Férias Luísa
  ('00000000-0000-0000-0001-000000000001', 'Processo criado', 'Luísa Ferreira', 'RH', 'Solicitação de férias registrada no sistema.', 'criacao', NULL, NULL, '2026-03-15 09:00'),
  ('00000000-0000-0000-0001-000000000001', 'Tramitado para Coordenação de RH', 'Luísa Ferreira', 'RH', 'Processo tramitado para coordenação de RH.', 'tramitacao', 'RH', 'RH', '2026-03-15 09:05'),
  ('00000000-0000-0000-0001-000000000001', 'Em análise', 'João Pereira', 'RH', 'Coordenador iniciou análise do saldo de férias.', 'analise', NULL, NULL, '2026-03-20 14:30'),
  ('00000000-0000-0000-0001-000000000001', 'Tramitado para Presidência', 'João Pereira', 'RH', 'Saldo verificado. Aguardando aprovação da Presidência.', 'tramitacao', 'RH', 'Presidência', '2026-03-28 10:00'),
  -- p2: Pagamento Gráfica
  ('00000000-0000-0000-0001-000000000002', 'Processo criado', 'Ana Oliveira', 'Financeiro', 'Solicitação de pagamento registrada.', 'criacao', NULL, NULL, '2026-03-10 08:30'),
  ('00000000-0000-0000-0001-000000000002', 'Atribuído a Pedro Almeida', 'Ana Oliveira', 'Financeiro', 'Atribuído a Pedro Almeida para conferência documental.', 'tramitacao', NULL, NULL, '2026-03-10 08:35'),
  ('00000000-0000-0000-0001-000000000002', 'Em análise', 'Pedro Almeida', 'Financeiro', 'Verificação de nota fiscal e documentos comprobatórios.', 'analise', NULL, NULL, '2026-03-12 10:00'),
  -- p3: Pregão
  ('00000000-0000-0000-0001-000000000003', 'Processo criado', 'Cris', 'Gestar', 'Demanda de material de escritório registrada.', 'criacao', NULL, NULL, '2026-03-01 10:00'),
  ('00000000-0000-0000-0001-000000000003', 'Tramitado para Licitação', 'Cris', 'Gestar', 'Processo encaminhado ao setor de Licitação.', 'tramitacao', 'Gestar', 'Licitação', '2026-03-02 08:00'),
  ('00000000-0000-0000-0001-000000000003', 'Em cotação', 'Ricardo Lima', 'Licitação', 'Pesquisa de mercado em andamento.', 'analise', NULL, NULL, '2026-03-05 14:00'),
  ('00000000-0000-0000-0001-000000000003', 'Edital publicado', 'Ricardo Lima', 'Licitação', 'Edital publicado no portal de compras.', 'execucao', NULL, NULL, '2026-03-25 08:00'),
  -- p4: Admissão
  ('00000000-0000-0000-0001-000000000004', 'Processo criado', 'Marcos Rocha', 'DP', 'Processo de admissão aberto após aprovação de vaga.', 'criacao', NULL, NULL, '2026-03-28 11:00'),
  -- p5: Reembolso
  ('00000000-0000-0000-0001-000000000005', 'Processo criado', 'Pedro Almeida', 'Financeiro', 'Solicitação de reembolso.', 'criacao', NULL, NULL, '2026-02-20 09:00'),
  ('00000000-0000-0000-0001-000000000005', 'Em análise', 'Ana Oliveira', 'Financeiro', 'Conferência de comprovantes.', 'analise', NULL, NULL, '2026-02-22 14:00'),
  ('00000000-0000-0000-0001-000000000005', 'Aprovado', 'Ana Oliveira', 'Financeiro', 'Reembolso aprovado.', 'aprovacao', NULL, NULL, '2026-02-25 10:00'),
  ('00000000-0000-0000-0001-000000000005', 'Pago', 'Ana Oliveira', 'Financeiro', 'Valor creditado na conta.', 'conclusao', NULL, NULL, '2026-03-05 08:00'),
  -- p6: Renovação Segurança
  ('00000000-0000-0000-0001-000000000006', 'Processo criado', 'Cris', 'Gestar', 'Identificada necessidade de renovação.', 'criacao', NULL, NULL, '2026-03-05 10:00'),
  ('00000000-0000-0000-0001-000000000006', 'Em análise', 'Cris', 'Gestar', 'Análise de desempenho contratual.', 'analise', NULL, NULL, '2026-03-10 08:00'),
  ('00000000-0000-0000-0001-000000000006', 'Parecer jurídico', 'Cris', 'Gestar', 'Enviado para parecer jurídico favorável.', 'analise', NULL, NULL, '2026-03-20 14:00'),
  ('00000000-0000-0000-0001-000000000006', 'Tramitado para Presidência', 'Cris', 'Gestar', 'Aguardando assinatura da Presidência (Glorinha).', 'tramitacao', 'Gestar', 'Presidência', '2026-03-29 09:00'),
  -- p7: Avaliação Desempenho
  ('00000000-0000-0000-0001-000000000007', 'Processo criado', 'João Pereira', 'RH', 'Abertura do ciclo de avaliação 2026.1.', 'criacao', NULL, NULL, '2026-03-20 08:00'),
  ('00000000-0000-0000-0001-000000000007', 'Formulários distribuídos', 'Luísa Ferreira', 'RH', 'Formulários enviados para todos os setores.', 'execucao', NULL, NULL, '2026-03-22 10:00'),
  -- p8: Compra TI
  ('00000000-0000-0000-0001-000000000008', 'Processo criado', 'Carlos Silva', 'TI', 'Solicitação de compra de equipamentos de TI.', 'criacao', NULL, NULL, '2026-03-29 14:00'),
  -- p9: Folha Pagamento
  ('00000000-0000-0000-0001-000000000009', 'Processo criado', 'Marcos Rocha', 'DP', 'Início do processamento da folha mensal.', 'criacao', NULL, NULL, '2026-03-25 08:00'),
  ('00000000-0000-0000-0001-000000000009', 'Em processamento', 'Juliana Souza', 'DP', 'Cálculos de horas extras e descontos em andamento.', 'execucao', NULL, NULL, '2026-03-27 10:00'),
  ('00000000-0000-0000-0001-000000000009', 'Tramitado para Financeiro', 'Marcos Rocha', 'DP', 'Folha calculada. Encaminhado ao Financeiro para pagamento.', 'tramitacao', 'DP', 'Financeiro', '2026-03-28 16:00'),
  -- p10: Relatório Trimestral
  ('00000000-0000-0000-0001-000000000010', 'Processo criado', 'Ana Oliveira', 'Financeiro', 'Início da elaboração do relatório Q1.', 'criacao', NULL, NULL, '2026-03-20 09:00'),
  ('00000000-0000-0000-0001-000000000010', 'Em revisão', 'Ana Oliveira', 'Financeiro', 'Relatório finalizado, enviado para aprovação da Diretoria.', 'tramitacao', 'Financeiro', 'Diretoria', '2026-03-28 14:00'),
  ('00000000-0000-0000-0001-000000000010', 'Tramitado para Presidência', 'Nathalie', 'Diretoria', 'Aprovado pela Diretoria. Encaminhado para Presidência.', 'tramitacao', 'Diretoria', 'Presidência', '2026-03-29 09:00');

-- 7.4 DOCUMENTS
INSERT INTO public.documents (process_id, name, file_type, size, uploaded_by, created_at) VALUES
  ('00000000-0000-0000-0001-000000000001', 'formulario_ferias.pdf', 'PDF', '245 KB', 'Luísa Ferreira', '2026-03-15'),
  ('00000000-0000-0000-0001-000000000002', 'nota_fiscal_4521.pdf', 'PDF', '1.2 MB', 'Ana Oliveira', '2026-03-10'),
  ('00000000-0000-0000-0001-000000000002', 'contrato_grafica.pdf', 'PDF', '890 KB', 'Ana Oliveira', '2026-03-10'),
  ('00000000-0000-0000-0001-000000000003', 'edital_pregao_001.pdf', 'PDF', '3.4 MB', 'Ricardo Lima', '2026-03-25'),
  ('00000000-0000-0000-0001-000000000003', 'termo_referencia.pdf', 'PDF', '1.8 MB', 'Cris', '2026-03-01'),
  ('00000000-0000-0000-0001-000000000005', 'comprovantes_despesas.pdf', 'PDF', '2.1 MB', 'Pedro Almeida', '2026-02-20'),
  ('00000000-0000-0000-0001-000000000006', 'parecer_juridico.pdf', 'PDF', '540 KB', 'Cris', '2026-03-20'),
  ('00000000-0000-0000-0001-000000000006', 'relatorio_desempenho.pdf', 'PDF', '1.5 MB', 'Cris', '2026-03-10'),
  ('00000000-0000-0000-0001-000000000008', 'especificacao_tecnica.pdf', 'PDF', '780 KB', 'Carlos Silva', '2026-03-29'),
  ('00000000-0000-0000-0001-000000000010', 'relatorio_q1_2026.pdf', 'PDF', '4.2 MB', 'Ana Oliveira', '2026-03-28');

-- 7.5 COMMENTS
INSERT INTO public.comments (process_id, user_name, text, department, created_at) VALUES
  ('00000000-0000-0000-0001-000000000001', 'João Pereira', 'Saldo de férias conferido. 30 dias disponíveis.', 'RH', '2026-03-28 10:00'),
  ('00000000-0000-0000-0001-000000000002', 'Pedro Almeida', 'NF conferida, aguardando validação do contrato.', 'Financeiro', '2026-03-27 16:00'),
  ('00000000-0000-0000-0001-000000000006', 'Cris', 'URGENTE: Contrato vence em 31/03. Precisa de assinatura imediata da Glorinha.', 'Gestar', '2026-03-29 09:00'),
  ('00000000-0000-0000-0001-000000000010', 'Ana Oliveira', 'Relatório Q1 finalizado. Aguardando aprovação da Nathalie e Glorinha.', 'Financeiro', '2026-03-29 08:00');

-- 7.6 NOTIFICATIONS
INSERT INTO public.notifications (user_id, title, message, notification_type, read, process_id, created_at) VALUES
  (NULL, 'Processo urgente', 'Renovação de contrato de segurança vence em 2 dias!', 'urgent', false, '00000000-0000-0000-0001-000000000006', '2026-03-29 09:00'),
  ('00000000-0000-0000-0000-000000000008', 'Nova atribuição', 'Você recebeu o processo IMH-2026/00170 - Compra de Equipamentos de TI.', 'info', false, '00000000-0000-0000-0001-000000000008', '2026-03-29 14:00'),
  ('00000000-0000-0000-0000-000000000003', 'Prazo próximo', 'Pagamento Fornecedor - Gráfica Express vence em 3 dias.', 'warning', false, '00000000-0000-0000-0001-000000000002', '2026-03-29 08:00'),
  ('00000000-0000-0000-0000-000000000006', 'Processo concluído', 'Reembolso de despesas foi concluído com sucesso.', 'success', true, '00000000-0000-0000-0001-000000000005', '2026-03-05 08:00'),
  ('00000000-0000-0000-0000-000000000002', 'Aprovação pendente', 'Férias de Luísa Ferreira aguardam sua aprovação.', 'info', false, '00000000-0000-0000-0001-000000000001', '2026-03-28 10:00'),
  (NULL, 'Demanda recorrente', 'Folha de pagamento de abril será gerada automaticamente em 25/04.', 'info', false, NULL, '2026-03-29 07:00'),
  ('00000000-0000-0000-0000-000000000002', 'Aprovação pendente', 'Relatório trimestral Q1 aguarda aprovação da Presidência.', 'warning', false, '00000000-0000-0000-0001-000000000010', '2026-03-29 08:00');

-- 7.7 COLABORADORES
INSERT INTO public.colaboradores (user_id, cpf, rg, data_nascimento, data_admissao, cargo, salario, endereco, telefone) VALUES
  ('00000000-0000-0000-0000-000000000007', '123.456.789-00', '2001234 SSP/CE', '1992-05-15', '2022-03-01', 'Assistente de RH', 3200.00, 'Rua das Flores, 123 - Fortaleza/CE', '(85) 98765-4321'),
  ('00000000-0000-0000-0000-000000000006', '987.654.321-00', '2005678 SSP/CE', '1988-11-20', '2020-06-15', 'Assistente Financeiro', 3500.00, 'Av. Santos Dumont, 456 - Fortaleza/CE', '(85) 91234-5678');

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT 'profiles' AS tabela, COUNT(*) AS registros FROM public.profiles
UNION ALL SELECT 'processes', COUNT(*) FROM public.processes
UNION ALL SELECT 'timeline_events', COUNT(*) FROM public.timeline_events
UNION ALL SELECT 'documents', COUNT(*) FROM public.documents
UNION ALL SELECT 'comments', COUNT(*) FROM public.comments
UNION ALL SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL SELECT 'colaboradores', COUNT(*) FROM public.colaboradores;
