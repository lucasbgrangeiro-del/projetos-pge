import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { addDays, format, parseISO } from 'date-fns';

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('pge_current_user')) || null);
  const [loading, setLoading] = useState(true);

  // Firestore listeners
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubActivities = onSnapshot(collection(db, 'activities'), (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);

    return () => {
      unsubUsers();
      unsubProjects();
      unsubTasks();
      unsubActivities();
    };
  }, []);

  // Ensure default users exist if empty after loading (Auto-seed)
  useEffect(() => {
    if (!loading && users.length === 0) {
      const seedUsers = async () => {
        try {
          await addDoc(collection(db, 'users'), { name: 'Lucas Grangeiro', role: 'admin', lotacao: 'PGE/AC', email: 'lucasbgrangeiro@gmail.com', phone: '11999999999', password: 'teste1234' });
          await addDoc(collection(db, 'users'), { name: 'Jose Sergio', role: 'member', lotacao: 'PGE/AC', email: 'jose@pge.ac.gov.br', phone: '11888888888', password: 'senha' });
        } catch(e) {}
      };
      // Give it a brief delay to ensure it's truly empty and not just fetching
      const t = setTimeout(seedUsers, 3000);
      return () => clearTimeout(t);
    }
  }, [users, loading]);

  useEffect(() => {
    localStorage.setItem('pge_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const addUser = async (userData) => {
    await addDoc(collection(db, 'users'), { ...userData, password: 'pge123' });
  };

  const addProject = async (projectData) => {
    await addDoc(collection(db, 'projects'), { ...projectData, status: 'active' });
  };

  const deleteProject = async (id) => {
    await deleteDoc(doc(db, 'projects', id));
    // Remove cascading tasks
    tasks.filter(t => t.project_id === id).forEach(async t => {
      await deleteDoc(doc(db, 'tasks', t.id));
    });
  };

  const finishProject = async (id) => {
    await updateDoc(doc(db, 'projects', id), { status: 'finished' });
  };

  const addTask = async (taskData) => {
    const end_date = format(addDays(parseISO(taskData.start_date), parseInt(taskData.duration_days) - 1), 'yyyy-MM-dd');
    await addDoc(collection(db, 'tasks'), { 
      ...taskData, 
      end_date, 
      status: 'Pendente de triagem', 
      last_update: new Date().toISOString() 
    });
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const updateTask = async (taskId, updates) => {
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;
    
    const updatedPayload = { ...updates, last_update: new Date().toISOString() };
    
    if (updates.start_date || updates.duration_days) {
      const startDate = updates.start_date || t.start_date;
      const duration = updates.duration_days || t.duration_days;
      updatedPayload.end_date = format(addDays(parseISO(startDate), parseInt(duration) - 1), 'yyyy-MM-dd');
    }

    await updateDoc(doc(db, 'tasks', taskId), updatedPayload);
  };

  const updateTaskStatus = async (taskId, status) => {
    await updateTask(taskId, { status });
  };

  const addActivity = async (taskId, description, type = 'comment') => {
    await addDoc(collection(db, 'activities'), {
      task_id: taskId,
      description,
      type, // 'comment', 'system', 'acao'
      user_name: currentUser.name,
      created_at: new Date().toISOString()
    });
    await updateTask(taskId, {}); // Trigger last_update
  };

  const value = {
    currentUser, login, logout,
    users, addUser,
    projects, addProject, deleteProject, finishProject,
    tasks, addTask, updateTask, updateTaskStatus, deleteTask,
    activities, addActivity
  };

  if (loading) return <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>Carregando o sistema...</div>;

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
