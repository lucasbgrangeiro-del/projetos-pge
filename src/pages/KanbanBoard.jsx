import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreProvider';
import { ArrowLeft, Clock, MessageSquare, Send, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const COLUMN_KEYS = ['Pendente de triagem', 'Triado', 'Em análise', 'Aguardando posição de terceiros', 'Finalizado'];

export default function KanbanBoard() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTaskStatus, activities, addActivity, currentUser } = useStore();

  const task = tasks.find(t => t.id === taskId);
  const taskActivities = activities.filter(a => a.task_id === taskId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  const [showModal, setShowModal] = useState(false);
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [activityType, setActivityType] = useState('comment'); // comment, acao

  if (!task) return <div>Tarefa não encontrada.</div>;

  const moveTask = (e, direction) => {
    e.stopPropagation(); // prevent modal opening
    const currentIndex = COLUMN_KEYS.indexOf(task.status);
    if (direction === 'left' && currentIndex > 0) {
      const targetStatus = COLUMN_KEYS[currentIndex - 1];
      updateTaskStatus(taskId, targetStatus);
      addActivity(taskId, `Moveu a tarefa para "${targetStatus}"`, 'system');
    } else if (direction === 'right' && currentIndex < COLUMN_KEYS.length - 1) {
      const targetStatus = COLUMN_KEYS[currentIndex + 1];
      updateTaskStatus(taskId, targetStatus);
      addActivity(taskId, `Moveu a tarefa para "${targetStatus}"`, 'system');
    }
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (newActivityDesc.trim()) {
      addActivity(taskId, newActivityDesc, activityType);
      setNewActivityDesc('');
      setActivityType('comment');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <button className="btn btn-outline" onClick={() => navigate(`/projects/${task.project_id}`)}>
          <ArrowLeft size={16} /> Voltar ao Projeto
        </button>
        <div>
          <h1 style={{ marginBottom: 0 }}>{task.title}</h1>
          <p className="text-muted">Kanban da Tarefa • Última atualização: {format(parseISO(task.last_update), 'dd/MM/yyyy HH:mm')}</p>
        </div>
      </div>

      <div className="kanban-board">
        {COLUMN_KEYS.map(col => (
          <div 
            key={col} 
            className="kanban-col"
            style={{ 
              border: task.status === col ? '2px dashed var(--accent-color)' : '1px solid var(--border-color)',
              background: task.status === col ? '#ffffff' : 'var(--bg-input)'
            }}
          >
            <div className="kanban-col-title">
              <span style={{ fontWeight: 600, color: 'var(--bg-sidebar)' }}>{col}</span>
              <span className="pill" style={{ background: task.status === col ? 'var(--accent-color)' : 'var(--bg-input)', color: task.status === col ? '#fff' : 'inherit' }}>
                {task.status === col ? '1' : '0'}
              </span>
            </div>
            
            {task.status === col && (
              <div 
                className="kanban-card"
                onClick={() => setShowModal(true)}
                title="Clique para adicionar atividades e histórico"
                style={{ cursor: 'pointer' }}
              >
                <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{task.title}</div>
                <div className="text-xs text-muted mb-2">Prazo: {task.duration_days} dia(s)</div>
                <div className="text-xs text-muted mb-2">Vencimento: {format(parseISO(task.end_date), 'dd/MM/yyyy')}</div>
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="pill text-xs" style={{ background: 'var(--accent-color)', color: '#fff' }}>+ Atividade</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.2rem', borderColor: '#cbd5e1' }} 
                      onClick={(e) => moveTask(e, 'left')}
                      disabled={COLUMN_KEYS.indexOf(task.status) === 0}
                    >
                      <ChevronLeft size={16} color="var(--text-main)" />
                    </button>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.2rem', borderColor: '#cbd5e1' }} 
                      onClick={(e) => moveTask(e, 'right')}
                      disabled={COLUMN_KEYS.indexOf(task.status) === COLUMN_KEYS.length - 1}
                    >
                      <ChevronRight size={16} color="var(--text-main)" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {task.status !== col && (
               <div style={{ opacity: 0.5, textAlign: 'center', padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)' }}>
                 Mova a tarefa para cá
               </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0 }}>Atividades: {task.title}</h3>
              <button className="btn btn-outline" style={{ padding: '0.2rem' }} onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddActivity} className="flex gap-4 mb-4 items-center">
              <select value={activityType} onChange={e => setActivityType(e.target.value)} className="form-control" style={{ width: '150px' }}>
                <option value="comment">Comentário</option>
                <option value="acao">Ação (ex: Ofício)</option>
              </select>
              <input 
                type="text" 
                placeholder="Descreva a atividade ou comentário..." 
                className="form-control" 
                value={newActivityDesc}
                onChange={e => setNewActivityDesc(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary"><Send size={16} /> Registrar</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {taskActivities.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: '2rem' }}>Nenhuma atividade registrada ainda.</p>
              ) : (
                taskActivities.map(act => (
                  <div key={act.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ marginTop: '0.2rem' }}>
                      {act.type === 'comment' ? <MessageSquare size={20} color="var(--accent-color)" /> :
                       act.type === 'system' ? <Clock size={20} color="var(--text-muted)" /> :
                       <Send size={20} color="var(--status-done)" />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{act.user_name}</span>
                        <span className="text-xs text-muted">{format(parseISO(act.created_at), 'dd/MM/yyyy HH:mm')}</span>
                        {act.type === 'acao' && <span className="pill" style={{ background: 'var(--status-done)', color: '#fff' }}>Ação Oficial</span>}
                      </div>
                      <div>{act.description}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
