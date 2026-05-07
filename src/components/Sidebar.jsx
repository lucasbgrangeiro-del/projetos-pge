import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../context/StoreProvider';
import { LayoutDashboard, FolderKanban, Users } from 'lucide-react';

export default function Sidebar() {
  const { currentUser } = useStore();
  
  const navLinkStyle = {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 1rem', borderRadius: '0.5rem',
    color: 'var(--text-muted)', textDecoration: 'none',
    transition: 'var(--transition)', marginBottom: '0.5rem'
  };
  
  const activeStyle = {
    ...navLinkStyle,
    backgroundColor: 'var(--accent-color)', color: '#fff'
  };

  return (
    <div className="sidebar">
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--accent-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>PGE</div>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Projetos</h2>
      </div>
      
      <nav>
        <NavLink to="/" style={({isActive}) => isActive ? activeStyle : navLinkStyle}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/projects" style={({isActive}) => isActive ? activeStyle : navLinkStyle}>
          <FolderKanban size={20} /> Projetos
        </NavLink>
        {currentUser?.role === 'admin' && (
          <NavLink to="/admin/users" style={({isActive}) => isActive ? activeStyle : navLinkStyle}>
            <Users size={20} /> Usuários
          </NavLink>
        )}
      </nav>
    </div>
  );
}
