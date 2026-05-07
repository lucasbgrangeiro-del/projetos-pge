import React from 'react';
import { useStore } from '../context/StoreProvider';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="topbar">
      <div>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>PGE-AC • Sistema Interno de Controle</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User size={18} color="var(--text-muted)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {currentUser?.name} <span className="text-muted">({currentUser?.role === 'admin' ? 'Administrador' : 'Integrante'})</span>
          </span>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem' }}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    </div>
  );
}
