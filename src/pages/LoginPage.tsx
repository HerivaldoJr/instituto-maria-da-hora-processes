import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import logoCircular from '@/assets/logo-circular.jpg';
import logoHorizontal from '@/assets/logo-horizontal.webp';

const LoginPage = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Informe usuário e senha para acessar.');
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await login(identifier.trim(), password);
    if (result.error) setError(result.error);

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />
        {/* Geometric decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/10 rounded-full" />
        <div className="absolute bottom-32 right-16 w-48 h-48 border border-white/5 rounded-full" />
        <div className="absolute top-1/3 right-8 w-20 h-20 border border-white/10 rotate-45" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-center">
            <motion.img src={logoCircular} alt="Instituto Maria da Hora"
              className="w-36 h-36 rounded-full mx-auto mb-8 shadow-2xl border-4 border-white/20"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} />
            
            <h1 className="text-4xl font-heading font-bold text-white mb-2">
              Instituto Maria da Hora
            </h1>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full my-5" />
            <p className="text-white/70 text-lg max-w-sm">
              Sistema de Gestão e Tramitação Eletrônica de Processos
            </p>
            
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              {[
                { label: 'Processos', value: '10+' },
                { label: 'Módulos', value: '4' },
                { label: 'Equipe', value: '11' },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-heading font-bold text-white">{stat.value}</p>
                  <p className="text-white/60 text-xs mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-lg">
          
          {/* Mobile header */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src={logoHorizontal} alt="Instituto Maria da Hora" className="h-16 mb-3" />
            <p className="text-muted-foreground text-sm">Sistema de Gestão e Tramitação</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-bold text-foreground">Acesso ao Sistema</h1>
                  <p className="text-muted-foreground text-sm">Entre com usuário e senha.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Usuário ou email</label>
                <input
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Digite seu usuário"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="Digite sua senha"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={submitting}
                className="w-full py-3.5 rounded-xl gradient-primary text-white font-heading font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {submitting ? 'Entrando...' : 'Entrar no Sistema'}
              </motion.button>
            </div>
          </motion.div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <img src={logoHorizontal} alt="Instituto Maria da Hora" className="h-8 mx-auto mb-2 opacity-50 hidden lg:block" />
            <p className="text-xs text-muted-foreground">
              Instituto Maria da Hora © 2026 • Todos os direitos reservados
            </p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">Intranet — Uso interno exclusivo</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
