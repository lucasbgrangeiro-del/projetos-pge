import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const { users, addUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'member', lotacao: '', email: '', phone: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser(formData);
    setShowModal(false);
    setFormData({ name: '', role: 'member', lotacao: '', email: '', phone: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1>Gestão de Usuários</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      {showModal && (
        <div className="glass-panel card mb-4">
          <h3>Cadastrar Usuário</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group"><label className="form-label">Nome</label><input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">E-mail</label><input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Telefone</label><input type="text" className="form-control" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Lotação</label><input type="text" className="form-control" required value={formData.lotacao} onChange={e => setFormData({...formData, lotacao: e.target.value})} /></div>
            <div className="form-group">
              <label className="form-label">Perfil</label>
              <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="member">Integrante de Projeto</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="gantt-table">
          <thead>
            <tr className="gantt-header-row">
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Lotação</th>
              <th>Perfil</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.lotacao}</td>
                <td><span className="pill">{u.role === 'admin' ? 'Admin' : 'Integrante'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
