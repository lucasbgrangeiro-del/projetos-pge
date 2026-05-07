import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Credenciais inválidas. Tente lucasbgrangeiro@gmail.com / teste1234');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--accent-color)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '1.5rem', margin: '0 auto 1rem' }}>PGE</div>
          <h1>Login</h1>
          <p className="text-muted">Acesso ao Sistema de Projetos</p>
        </div>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" required />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" required />
          </div>
          <button type="submit" className="btn btn-primary w-full">Entrar no Sistema</button>
        </form>
      </div>
    </div>
  );
}
