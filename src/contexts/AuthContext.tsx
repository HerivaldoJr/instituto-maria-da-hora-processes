import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ti_admin' | 'presidencia' | 'diretoria' | 'coordenacao' | 'liderado';
  department: 'financeiro' | 'rh' | 'licitacao' | 'dp' | 'ti' | 'presidencia' | 'diretoria' | 'gestar';
  avatar?: string;
  active: boolean;
  cargo?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  allUsers: User[]; 
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').order('name');
        if (profilesError) throw profilesError;
        
        const mapped: User[] = (profiles || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: p.role,
          department: p.department,
          avatar: p.avatar_url || undefined,
          active: p.active,
          cargo: p.cargo || undefined,
        }));
        setAllUsers(mapped);

        let currentSession = null;
        try {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.warn('Aviso: Erro ao obter sessão inicial:', sessionError.message);
          }
          currentSession = data?.session;
        } catch (e) {
          console.warn('Exceção ao obter sessão:', e);
        }

        // Fallback blindado contra o erro de Lock do Supabase:
        // Se a sessão vier vazia, lemos diretamente do cache do navegador
        if (!currentSession) {
          try {
            const storedAuth = localStorage.getItem('imh-suite-auth-token');
            if (storedAuth) {
              const parsedAuth = JSON.parse(storedAuth);
              if (parsedAuth && parsedAuth.user) {
                currentSession = { user: parsedAuth.user } as any;
              }
            }
          } catch (err) {
            // ignorar
          }
        }

        if (currentSession?.user) {
          const profile = mapped.find(u => u.email === currentSession.user.email || u.id === currentSession.user.id);
          if (profile) {
            setUser(profile);
          }
        }
      } catch (err) {
        console.error("Erro ao puxar dados do Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            department: profile.department,
            avatar: profile.avatar_url || undefined,
            active: profile.active,
            cargo: profile.cargo || undefined,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    init();

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (identifier: string, password: string): Promise<{ error?: string }> => {
    // Identifier mapping (email or plain text)
    const normalized = identifier.trim().toLowerCase();
    const matchedUser = allUsers.find(u => {
      const email = u.email.toLowerCase();
      const username = email.split('@')[0];
      return email === normalized || username === normalized || u.name.toLowerCase() === normalized;
    });

    const resolvedEmail = matchedUser?.email || normalized;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: resolvedEmail, password });
      if (error) {
        return { error: 'Credenciais inválidas. Verifique seu email e senha.' };
      }
      return {};
    } catch {
      return { error: 'Erro de comunicação estrita ao banco Supabase.' };
    }
  }, [allUsers]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Validando servidor e usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading, allUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
