import { useState } from 'react';
import { mockUsers, roleLabels, departmentLabels, User, UserRole, Department } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, UserPlus, Shield, MoreVertical, CheckCircle2, XCircle,
  Edit3, Trash2, X, Save, Ban, Unlock
} from 'lucide-react';
import { toast } from 'sonner';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [showNewUser, setShowNewUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // New user form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('liderado');
  const [newDept, setNewDept] = useState<Department>('financeiro');
  const [newCargo, setNewCargo] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('liderado');
  const [editDept, setEditDept] = useState<Department>('financeiro');
  const [editCargo, setEditCargo] = useState('');

  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
  });

  const isAdmin = currentUser?.role === 'ti_admin';

  const handleCreateUser = () => {
    if (!newName.trim() || !newEmail.trim()) { toast.error('Preencha nome e email.'); return; }
    if (users.find(u => u.email === newEmail.trim())) { toast.error('Email já cadastrado.'); return; }
    const newUser: User = {
      id: `u${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      department: newDept,
      active: true,
      cargo: newCargo.trim() || undefined,
    };
    setUsers(prev => [...prev, newUser]);
    setShowNewUser(false);
    setNewName(''); setNewEmail(''); setNewRole('liderado'); setNewDept('financeiro'); setNewCargo('');
    toast.success(`Usuário ${newUser.name} criado com sucesso.`);
  };

  const handleStartEdit = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditDept(u.department);
    setEditCargo(u.cargo || '');
    setMenuOpen(null);
  };

  const handleSaveEdit = () => {
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;
    setUsers(prev => prev.map(u =>
      u.id === editingUser.id ? {
        ...u,
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        department: editDept,
        cargo: editCargo.trim() || undefined,
      } : u
    ));
    setEditingUser(null);
    toast.success('Usuário atualizado.');
  };

  const handleToggleActive = (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, active: !u.active } : u
    ));
    setMenuOpen(null);
    toast.success('Status do usuário alterado.');
  };

  const handleDelete = (userId: string) => {
    const u = users.find(x => x.id === userId);
    setUsers(prev => prev.filter(x => x.id !== userId));
    setDeleteConfirm(null);
    setMenuOpen(null);
    toast.success(`Usuário ${u?.name} removido.`);
  };

  const allRoles: { value: UserRole; label: string }[] = [
    { value: 'ti_admin', label: 'Supervisor de TI' },
    { value: 'presidencia', label: 'Presidência' },
    { value: 'diretoria', label: 'Diretoria' },
    { value: 'coordenacao', label: 'Coordenação' },
    { value: 'liderado', label: 'Colaborador' },
  ];

  const allDepts: { value: Department; label: string }[] = Object.entries(departmentLabels).map(([k, v]) => ({ value: k as Department, label: v }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground text-sm">{users.length} usuários cadastrados</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowNewUser(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
            <UserPlus className="w-4 h-4" /> Novo Usuário
          </button>
        )}
      </div>

      {/* New user form */}
      <AnimatePresence>
        {showNewUser && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-card rounded-xl border border-primary/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" /> Criar Novo Usuário
                </h3>
                <button onClick={() => setShowNewUser(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Nome completo *</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome do colaborador"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Email *</label>
                  <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@imh.org.br" type="email"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Cargo</label>
                  <input value={newCargo} onChange={e => setNewCargo(e.target.value)} placeholder="Cargo do colaborador"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Perfil</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {allRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Departamento</label>
                  <select value={newDept} onChange={e => setNewDept(e.target.value as Department)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {allDepts.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowNewUser(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Cancelar</button>
                <button onClick={handleCreateUser} className="px-5 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:opacity-90 font-medium">
                  <Save className="w-4 h-4 inline mr-1" /> Criar Usuário
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit user modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-card rounded-xl border border-info/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-info" /> Editar Usuário: {editingUser.name}
                </h3>
                <button onClick={() => setEditingUser(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Nome</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Email</label>
                  <input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Cargo</label>
                  <input value={editCargo} onChange={e => setEditCargo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Perfil</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {allRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Departamento</label>
                  <select value={editDept} onChange={e => setEditDept(e.target.value as Department)}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {allDepts.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Cancelar</button>
                <button onClick={handleSaveEdit} className="px-5 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:opacity-90 font-medium">
                  <Save className="w-4 h-4 inline mr-1" /> Salvar Alterações
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-heading font-semibold text-foreground">Usuário</th>
              <th className="text-left px-4 py-3 font-heading font-semibold text-foreground hidden md:table-cell">Perfil</th>
              <th className="text-left px-4 py-3 font-heading font-semibold text-foreground hidden md:table-cell">Departamento</th>
              <th className="text-left px-4 py-3 font-heading font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-right font-heading font-semibold text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground flex items-center gap-1 w-fit">
                    {u.role === 'ti_admin' && <Shield className="w-3 h-3" />}
                    {roleLabels[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{departmentLabels[u.department]}</td>
                <td className="px-4 py-3">
                  {u.active ? (
                    <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="w-3.5 h-3.5" /> Ativo</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-destructive"><XCircle className="w-3.5 h-3.5" /> Bloqueado</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isAdmin && (
                    <div className="relative inline-block">
                      <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <AnimatePresence>
                        {menuOpen === u.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-8 w-48 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                            <button onClick={() => handleStartEdit(u)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground">
                              <Edit3 className="w-4 h-4" /> Editar
                            </button>
                            <button onClick={() => handleToggleActive(u.id)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground">
                              {u.active ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              {u.active ? 'Bloquear' : 'Desbloquear'}
                            </button>
                            {deleteConfirm === u.id ? (
                              <div className="px-4 py-2.5 space-y-2 bg-destructive/5">
                                <p className="text-xs text-destructive font-medium">Confirmar exclusão?</p>
                                <div className="flex gap-2">
                                  <button onClick={() => handleDelete(u.id)}
                                    className="flex-1 px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded">Sim</button>
                                  <button onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-2 py-1 text-xs border border-border rounded">Não</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(u.id)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-destructive/10 transition-colors text-destructive">
                                <Trash2 className="w-4 h-4" /> Excluir
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
