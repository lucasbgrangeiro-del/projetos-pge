import React, { useState } from 'react';
import { useStore } from '../context/StoreProvider';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectsPage() {
  const { projects, users, addProject, deleteProject, finishProject, currentUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', subject: '', sei_process: '', assignees: [] });

  const isAdmin = currentUser.role === 'admin';
  const displayProjects = isAdmin ? projects : projects.filter(p => p.assignees.includes(currentUser.id));

  const handleCheckbox = (userId) => {
    setFormData(prev => {
      const idx = prev.assignees.indexOf(userId);
      if (idx !== -1) {
        return { ...prev, assignees: prev.assignees.filter(id => id !== userId) };
      } else {
        return { ...prev, assignees: [...prev.assignees, userId] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addProject({ ...formData, manager_id: currentUser.id });
    setShowModal(false);
    setFormData({ name: '', subject: '', sei_process: '', assignees: [] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1>Projetos</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Novo Projeto
          </button>
        )}
      </div>

      {showModal && isAdmin && (
        <div className="glass-panel card mb-4">
          <h3>Cadastrar Projeto</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label className="form-label">Nome do Projeto</label><input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="form-label">Nº Processo SEI</label><input type="text" className="form-control" value={formData.sei_process} onChange={e => setFormData({...formData, sei_process: e.target.value})} placeholder="0001.000000/0000-00" /></div>
            </div>
            <div className="form-group"><label className="form-label">Assunto</label><textarea className="form-control" rows="3" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}></textarea></div>
            
            <div className="form-group">
              <label className="form-label">Responsáveis / Integrantes (Selecione)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                {users.map(u => (
                  <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.assignees.includes(u.id)} onChange={() => handleCheckbox(u.id)} />
                    {u.name}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Projeto</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {displayProjects.map(proj => (
          <div key={proj.id} className="glass-panel card" style={{ display: 'flex', flexDirection: 'column', opacity: proj.status === 'finished' ? 0.7 : 1 }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0 }}>{proj.name}</h3>
                {proj.sei_process && <span className="text-xs text-muted">SEI: {proj.sei_process}</span>}
              </div>
              {proj.status === 'finished' && <span className="pill" style={{ background: 'var(--status-done)', color: '#fff' }}>Finalizado</span>}
            </div>
            
            <p className="text-sm text-muted mb-4" style={{ flex: 1 }}>{proj.subject}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex gap-2">
                <span className="text-xs text-muted">Integrantes: {proj.assignees.length}</span>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <>
                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--status-third)', color: 'var(--status-third)' }} onClick={() => { if(window.confirm('Excluir projeto permanentemente?')) deleteProject(proj.id); }}>Excluir</button>
                    {proj.status !== 'finished' && <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--status-done)', color: 'var(--status-done)' }} onClick={() => { if(window.confirm('Marcar como finalizado?')) finishProject(proj.id); }}>Finalizar</button>}
                  </>
                )}
                <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigate(`/projects/${proj.id}`)}>Acessar Gantt</button>
              </div>
            </div>
          </div>
        ))}
        {displayProjects.length === 0 && <p className="text-muted">Nenhum projeto encontrado.</p>}
      </div>
    </div>
  );
}
