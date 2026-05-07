import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreProvider';
import { Plus, Download } from 'lucide-react';
import { addDays, format, parseISO, min, max, differenceInDays, isWeekend, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { projects, tasks, users, currentUser, addTask, updateTask, deleteTask } = useStore();
  const navigate = useNavigate();
  
  const project = projects.find(p => p.id === projectId);
  const projectTasks = tasks.filter(t => t.project_id === projectId);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', start_date: format(new Date(), 'yyyy-MM-dd'), duration_days: 1, assignee_id: '' });

  const isAdmin = currentUser.role === 'admin';
  const assignees = users.filter(u => project?.assignees.includes(u.id));

  // Determine Gantt Date Range
  const { startDate, totalDays, datesArray } = useMemo(() => {
    if (!projectTasks.length) {
      const today = new Date();
      return { startDate: today, totalDays: 30, datesArray: Array.from({length: 30}).map((_, i) => addDays(today, i)) };
    }
    const dates = projectTasks.map(t => parseISO(t.start_date));
    const earliest = min(dates);
    // Add a few days before and end 30 days after by default, or fit to tasks
    const start = subDays(earliest, 2);
    const lastDates = projectTasks.map(t => parseISO(t.end_date));
    const latest = max(lastDates);
    const span = Math.max(30, differenceInDays(latest, start) + 5);
    const arr = Array.from({length: span}).map((_, i) => addDays(start, i));
    return { startDate: start, totalDays: span, datesArray: arr };
  }, [projectTasks]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask({ ...formData, project_id: projectId });
    setShowModal(false);
    setFormData({ title: '', start_date: format(new Date(), 'yyyy-MM-dd'), duration_days: 1, assignee_id: '' });
  };

  const handleExport = () => {
    alert("Funcionalidade de exportação de relatório (PDF) a ser implementada pelo backend.");
  };

  if (!project) return <div>Projeto não encontrado.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 style={{ marginBottom: 0 }}>{project.name}</h1>
          {project.sei_process && <span className="pill mb-2" style={{ display: 'inline-block', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>SEI: {project.sei_process}</span>}
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>{project.subject}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && <button className="btn btn-outline" onClick={handleExport}><Download size={16} /> Relatório</button>}
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Nova Tarefa</button>}
        </div>
      </div>

      {showModal && isAdmin && (
        <div className="glass-panel card mb-4">
          <h3>Adicionar Tarefa ao Gantt</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 200px' }}><label className="form-label">Tarefa</label><input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Data Início</label><input type="date" className="form-control" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Prazo (Dias)</label><input type="number" min="1" className="form-control" required value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: parseInt(e.target.value)})} /></div>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label className="form-label">Responsável</label>
              <select className="form-control" required value={formData.assignee_id} onChange={e => setFormData({...formData, assignee_id: e.target.value})}>
                <option value="">Selecione...</option>
                {assignees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-primary h-full">Adicionar</button>
            </div>
            <div className="form-group">
              <button type="button" className="btn btn-outline h-full" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '0', overflowX: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        <table className="gantt-table">
          <thead className="gantt-header-row">
            <tr>
              {isAdmin && <th style={{minWidth:'40px'}}></th>}
              <th style={{minWidth:'50px'}}>ITEM</th>
              <th style={{minWidth:'200px', textAlign:'left'}}>TAREFA</th>
              <th style={{minWidth:'100px'}}>INÍCIO</th>
              <th style={{minWidth:'80px'}}>PRAZO (DIAS)</th>
              <th style={{minWidth:'100px'}}>TÉRMINO</th>
              <th style={{minWidth:'150px', textAlign:'left'}}>RESPONSÁVEL</th>
              {datesArray.map((d, i) => (
                <th key={i} className="gantt-cell" style={{ fontSize: '0.7rem', padding: '0.2rem', minWidth: '30px' }}>
                  <div style={{ paddingBottom: '0.2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.2rem' }}>
                    {format(d, 'dd/MM')}
                  </div>
                  <div style={{ color: isWeekend(d) ? 'var(--status-pending)' : 'inherit' }}>
                    {format(d, 'eeeee', {locale: ptBR}).toUpperCase()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projectTasks.map((t, idx) => {
              const u = users.find(user => user.id === t.assignee_id);
              const startParsed = parseISO(t.start_date);
              const endParsed = parseISO(t.end_date);
              return (
                <tr key={t.id} style={{ cursor: 'pointer', opacity: t.status === 'Finalizado' ? 0.6 : 1 }} onClick={() => navigate(`/tasks/${t.id}`)} className="gantt-row-hover">
                  {isAdmin && (
                    <td style={{textAlign:'center'}} onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-outline" style={{ padding: '0.1rem 0.3rem', borderColor: 'transparent', color: 'var(--status-third)' }} onClick={() => { if(window.confirm('Excluir tarefa?')) deleteTask(t.id); }}>X</button>
                    </td>
                  )}
                  <td style={{textAlign:'center'}}>{idx + 1}</td>
                  <td style={{ textDecoration: t.status === 'Finalizado' ? 'line-through' : 'none' }}>
                    {t.title}
                    {t.status === 'Finalizado' && <span className="pill text-xs ml-2" style={{ background: 'var(--status-done)', color: '#fff', marginLeft: '0.5rem' }}>Concluído</span>}
                  </td>
                  <td style={{textAlign:'center'}}>{format(startParsed, 'dd/MM/yyyy')}</td>
                  <td style={{textAlign:'center'}}>{t.duration_days}</td>
                  <td style={{textAlign:'center'}}>{format(endParsed, 'dd/MM/yyyy')}</td>
                  <td>{u?.name || 'Não atribuído'}</td>
                  
                  {datesArray.map((d, i) => {
                    // Check if date is within task range
                    const isWithin = d >= startParsed && d <= endParsed;
                    return (
                      <td key={i} className={`gantt-cell ${isWeekend(d) ? 'gantt-cell-weekend' : ''}`}>
                        {isWithin && <div className="gantt-bar"></div>}
                      </td>
                    );
                  })}
                </tr>
              )
            })}
            {projectTasks.length === 0 && (
              <tr>
                <td colSpan={(isAdmin ? 7 : 6) + datesArray.length} style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma tarefa cadastrada.</td>
              </tr>
            )}
          </tbody>
        </table>
        <style dangerouslySetInnerHTML={{__html: `
          .gantt-row-hover:hover td { background-color: rgba(255,255,255,0.05); }
        `}} />
      </div>
    </div>
  );
}
