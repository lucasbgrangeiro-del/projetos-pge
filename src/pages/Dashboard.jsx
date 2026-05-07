import React from 'react';
import { useStore } from '../context/StoreProvider';


export default function Dashboard() {
  const { currentUser, projects, tasks, users } = useStore();

  const userProjects = currentUser.role === 'admin' ? projects : projects.filter(p => p.assignees.includes(currentUser.id));
  const userTasks = currentUser.role === 'admin' ? tasks : tasks.filter(t => t.assignee_id === currentUser.id);

  const stats = {
    totalProjects: userProjects.length,
    totalTasks: userTasks.length,
    pendingTasks: userTasks.filter(t => t.status === 'Pendente de triagem' || t.status === 'Em análise').length,
    completedTasks: userTasks.filter(t => t.status === 'Finalizado').length
  };

  return (
    <div>
      <h1 className="mb-4">Dashboard Gerencial</h1>
      <p className="text-muted mb-4">Bem-vindo, {currentUser.name}. Aqui está o resumo das suas atividades.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel card">
          <h4 className="text-muted">Projetos Ativos</h4>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)' }}>{stats.totalProjects}</span>
        </div>
        <div className="glass-panel card">
          <h4 className="text-muted">Total de Tarefas</h4>
          <span style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalTasks}</span>
        </div>
        <div className="glass-panel card">
          <h4 className="text-muted">Tarefas Pendentes</h4>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--status-pending)' }}>{stats.pendingTasks}</span>
        </div>
        <div className="glass-panel card">
          <h4 className="text-muted">Tarefas Finalizadas</h4>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--status-done)' }}>{stats.completedTasks}</span>
        </div>
      </div>

      <h2>Meus Projetos Recentes</h2>
      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table className="gantt-table">
          <thead>
            <tr className="gantt-header-row">
              <th style={{textAlign: 'left'}}>Nome do Projeto</th>
              <th style={{textAlign: 'left'}}>Assunto</th>
              <th style={{textAlign: 'center'}}>Pendentes / Análise</th>
              <th style={{textAlign: 'center'}}>Finalizadas</th>
              <th style={{textAlign: 'center'}}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {userProjects.map(proj => {
              const projTasks = tasks.filter(t => t.project_id === proj.id);
              const pendentes = projTasks.filter(t => t.status !== 'Finalizado').length;
              const finalizadas = projTasks.filter(t => t.status === 'Finalizado').length;
              return (
                <tr key={proj.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{proj.name}</div>
                    {proj.sei_process && <div className="text-xs text-muted">SEI: {proj.sei_process}</div>}
                  </td>
                  <td className="text-sm">{proj.subject}</td>
                  <td style={{textAlign: 'center'}}><span className="pill" style={{ background: pendentes > 0 ? 'var(--status-pending)' : 'var(--bg-input)', color: pendentes > 0 ? '#fff' : 'inherit' }}>{pendentes}</span></td>
                  <td style={{textAlign: 'center'}}><span className="pill" style={{ background: finalizadas > 0 ? 'var(--status-done)' : 'var(--bg-input)', color: finalizadas > 0 ? '#fff' : 'inherit' }}>{finalizadas}</span></td>
                  <td style={{textAlign: 'center'}}>
                    <a href={`/projects/${proj.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Acessar</a>
                  </td>
                </tr>
              );
            })}
            {userProjects.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center'}} className="text-muted">Nenhum projeto encontrado.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Tarefas Pendentes (Visão Sintética)</h2>
      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table className="gantt-table">
          <thead>
            <tr className="gantt-header-row">
              <th style={{textAlign: 'left'}}>Projeto</th>
              <th style={{textAlign: 'left'}}>Tarefa</th>
              <th style={{textAlign: 'left'}}>Responsável</th>
              <th style={{textAlign: 'center'}}>Vencimento</th>
              <th style={{textAlign: 'center'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {userTasks.filter(t => t.status !== 'Finalizado').length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '1rem'}} className="text-muted">Nenhuma tarefa pendente. Excelente trabalho!</td></tr>
            ) : (
              userTasks.filter(t => t.status !== 'Finalizado')
                .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
                .map(task => {
                  const proj = projects.find(p => p.id === task.project_id);
                  const user = users.find(u => u.id === task.assignee_id);
                  return (
                    <tr key={task.id}>
                      <td style={{ fontWeight: 600 }}>{proj?.name}</td>
                      <td>
                        <a href={`/tasks/${task.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', borderBottom: '1px dotted var(--text-muted)' }}>
                          {task.title}
                        </a>
                      </td>
                      <td>{user?.name || 'Não atribuído'}</td>
                      <td style={{textAlign: 'center'}}>{new Date(task.end_date).toLocaleDateString('pt-BR')}</td>
                      <td style={{textAlign: 'center'}}>
                        <span className="pill text-xs" style={{ background: task.status === 'Pendente de triagem' ? 'var(--status-pending)' : 'var(--bg-input)', color: task.status === 'Pendente de triagem' ? '#fff' : 'inherit' }}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
