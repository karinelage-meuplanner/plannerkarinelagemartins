
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Clock, Target, MoreHorizontal, 
  CheckCircle2, AlertCircle, Play, Pause, Calendar, Bell, Settings, RotateCcw
} from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';

interface Project {
  id: string;
  name: string;
  client?: string;
  status: 'active' | 'blocked' | 'completed';
  progress: number;
  nextAction: string;
  deadline: string;
  deadlineReminder?: boolean;
  nextActionReminder?: boolean;
  nextActionDate?: string;
}

interface OKR {
  id: string;
  objective: string;
  keyResult: string;
  progress: number;
}

export const WorkPlanner: React.FC = () => {
  // Projects State (Persisted)
  const [projects, setProjects] = useLocalStorage<Project[]>('planner_work_projects', [
    { 
      id: '1', 
      name: 'Lançamento Website Q1', 
      client: 'Interno', 
      status: 'active', 
      progress: 65, 
      nextAction: 'Revisar copy da home',
      deadline: '2024-02-28',
      deadlineReminder: true,
      nextActionReminder: false,
      nextActionDate: ''
    },
    { 
      id: '2', 
      name: 'Relatório Financeiro Anual', 
      client: 'Diretoria', 
      status: 'blocked', 
      progress: 30, 
      nextAction: 'Aguardando dados de vendas',
      deadline: '2024-03-15',
      deadlineReminder: false,
      nextActionReminder: true,
      nextActionDate: '2024-03-10'
    }
  ]);

  // Deep Work Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTime, setTimerTime] = useState(25 * 60); // seconds
  const [initialTime, setInitialTime] = useState(25 * 60); // seconds
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime((prev) => prev - 1);
      }, 1000);
    } else if (timerTime === 0) {
      setIsTimerRunning(false);
      // Optional: Play sound or notification here
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTime]);

  // OKRs State (Persisted)
  const [okrs, setOkrs] = useLocalStorage<OKR[]>('planner_work_okrs', [
    { id: '1', objective: 'Aumentar eficiência da equipe', keyResult: 'Reduzir tempo de reunião em 20%', progress: 40 },
    { id: '2', objective: 'Desenvolvimento Pessoal', keyResult: 'Completar curso de Liderança', progress: 10 }
  ]);

  const [notes, setNotes] = useLocalStorage('planner_work_notes', '');

  // Helper functions
  const toggleProjectStatus = (id: string) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'active' ? 'blocked' : p.status === 'blocked' ? 'completed' : 'active';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const updateProjectProgress = (id: string, newProgress: number) => {
    setProjects(projects.map(p => p.id === id ? { ...p, progress: newProgress } : p));
  };

  const toggleDeadlineReminder = (id: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, deadlineReminder: !p.deadlineReminder } : p));
  };

  const toggleNextActionReminder = (id: string) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        const newStatus = !p.nextActionReminder;
        // If turning on and no date is set, set today's date as default
        const newDate = (newStatus && !p.nextActionDate) 
          ? new Date().toISOString().split('T')[0] 
          : p.nextActionDate;
          
        return { 
          ...p, 
          nextActionReminder: newStatus,
          nextActionDate: newDate
        };
      }
      return p;
    }));
  };

  const updateNextActionDate = (id: string, date: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, nextActionDate: date } : p));
  };

  const handleSetTimer = () => {
    const newTime = customMinutes * 60;
    setTimerTime(newTime);
    setInitialTime(newTime);
    setIsTimerRunning(false);
    setShowTimerSettings(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerTime(initialTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Top Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Projetos Ativos</p>
            <p className="text-2xl font-serif font-bold text-brand-work">{projects.filter(p => p.status === 'active').length}</p>
          </div>
          <Briefcase className="text-brand-work opacity-20" size={32} />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Prazos Próximos</p>
            <p className="text-2xl font-serif font-bold text-orange-500">2</p>
          </div>
          <Calendar className="text-orange-500 opacity-20" size={32} />
        </div>
        
        {/* Deep Work Timer Widget */}
        <div className="col-span-1 md:col-span-2 bg-brand-work text-white p-4 rounded-xl shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10 w-full">
            <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Sessão de Foco</p>
                <button 
                    onClick={() => setShowTimerSettings(!showTimerSettings)} 
                    className="text-white/40 hover:text-white transition-colors p-1"
                    title="Configurar tempo"
                >
                    <Settings size={14} />
                </button>
            </div>
            
            {showTimerSettings ? (
                <div className="flex items-center gap-2 animate-fade-in">
                    <label className="text-sm text-white/80">Duração:</label>
                    <input 
                        type="number" 
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white/50 text-center"
                        min="1"
                    />
                    <span className="text-xs text-white/60">min</span>
                    <button 
                        onClick={handleSetTimer} 
                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-xs font-bold ml-2 transition-colors"
                    >
                        Definir
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-mono font-medium w-24">{formatTime(timerTime)}</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                        >
                            {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <button 
                            onClick={handleResetTimer}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white/70 hover:text-white"
                            title="Reiniciar"
                        >
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </div>
            )}
          </div>
          <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none" size={80} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl text-ink flex items-center gap-2">
                <Briefcase size={20} className="text-brand-work" />
                Projetos & Entregas
              </h3>
              <button className="text-xs flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={14} /> Novo Projeto
              </button>
            </div>

            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="border border-stone-100 rounded-xl p-4 hover:border-brand-work/30 transition-all bg-stone-50/30 group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-stone-800">{project.name}</h4>
                        {project.status === 'blocked' && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">Bloqueado</span>}
                        {project.status === 'completed' && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Concluído</span>}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-stone-500">{project.client}</p>
                        <div className="flex items-center gap-2 bg-stone-100/50 px-2 py-0.5 rounded">
                            <span className={`text-xs transition-colors ${project.deadlineReminder ? 'text-orange-600 font-bold' : 'text-stone-500'}`}>
                                Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                            </span>
                            <button 
                                onClick={() => toggleDeadlineReminder(project.id)} 
                                className={`transition-colors p-1 rounded-full hover:bg-stone-200 ${project.deadlineReminder ? 'text-orange-500' : 'text-stone-300'}`}
                                title={project.deadlineReminder ? "Remover lembrete de prazo" : "Definir lembrete de prazo"}
                            >
                                <Bell size={12} fill={project.deadlineReminder ? "currentColor" : "none"} />
                            </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => toggleProjectStatus(project.id)} className="text-stone-400 hover:text-brand-work">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${project.status === 'blocked' ? 'bg-red-400' : 'bg-brand-work'}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-mono text-stone-500 w-8 text-right">{project.progress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" step="5"
                    value={project.progress}
                    onChange={(e) => updateProjectProgress(project.id, parseInt(e.target.value))}
                    className="w-full opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto cursor-pointer mb-2 accent-brand-work"
                  />

                  {/* Next Action */}
                  <div className={`flex items-center gap-2 bg-white p-2 rounded border text-sm text-stone-600 transition-all duration-200 ${project.nextActionReminder ? 'border-orange-200 bg-orange-50/30 shadow-sm' : 'border-stone-100'}`}>
                    <span className="text-xs font-bold text-brand-work uppercase shrink-0">Próximo Passo:</span>
                    <input 
                      value={project.nextAction}
                      onChange={(e) => {
                        const newProjects = projects.map(p => p.id === project.id ? { ...p, nextAction: e.target.value } : p);
                        setProjects(newProjects);
                      }}
                      className="flex-1 bg-transparent outline-none text-sm text-stone-700"
                      placeholder="Descreva a próxima ação"
                    />
                    
                    {/* Date Input for Next Action Reminder */}
                    {project.nextActionReminder && (
                         <input 
                            type="date" 
                            value={project.nextActionDate || ''}
                            onChange={(e) => updateNextActionDate(project.id, e.target.value)}
                            className="bg-white border border-orange-200 rounded px-2 py-1 text-xs text-stone-600 focus:outline-none focus:border-orange-400 max-w-[110px]"
                        />
                    )}

                     <button 
                        onClick={() => toggleNextActionReminder(project.id)} 
                        className={`transition-colors p-1.5 rounded-md hover:bg-black/5 ${project.nextActionReminder ? 'text-orange-500' : 'text-stone-300'}`}
                        title={project.nextActionReminder ? "Lembrete ativo" : "Ativar lembrete"}
                    >
                        <Bell size={14} fill={project.nextActionReminder ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

           {/* OKRs Section */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
             <h3 className="font-serif text-xl text-ink mb-4 flex items-center gap-2">
                <Target size={20} className="text-brand-work" />
                Objetivos Trimestrais (OKRs)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {okrs.map(okr => (
                  <div key={okr.id} className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                    <p className="font-bold text-stone-700 text-sm mb-1">{okr.objective}</p>
                    <p className="text-xs text-stone-500 mb-3">KR: {okr.keyResult}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${okr.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-stone-500">{okr.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Right Column: Notes & Quick Tasks */}
        <div className="space-y-6">
           {/* Meeting Scratchpad */}
           <div className="bg-[#FFFBEB] p-6 rounded-xl shadow-sm border border-[#FCD34D]/30 h-96 flex flex-col relative transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#FCD34D]/40 rounded-sm"></div>
              <h3 className="font-serif text-lg text-yellow-800 mb-4">Bloco de Notas</h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none resize-none text-stone-700 leading-relaxed custom-scrollbar text-sm"
                placeholder="Rascunhos, ideias de reuniões, lembretes rápidos..."
                style={{ backgroundImage: 'linear-gradient(transparent 1.5em, #FDE68A 1.5em)', backgroundSize: '100% 1.52em', lineHeight: '1.52em' }}
              />
           </div>

           {/* Quick Actions */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
              <h3 className="font-serif text-lg text-ink mb-4">Acesso Rápido</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-sm font-medium flex items-center gap-2 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  Email Urgente
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-sm font-medium flex items-center gap-2 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  Agendar Reunião
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-sm font-medium flex items-center gap-2 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  Revisar Faturas
                </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
