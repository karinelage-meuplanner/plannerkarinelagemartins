
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Circle, Heart, Home, DollarSign, Sparkles, Layout, CheckSquare } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';

interface DayData {
  date: Date;
  top3: string[];
  morning: string;
  afternoon: string;
  evening: string;
}

export const WeeklyPlanner: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'plan' | 'review'>('plan');
  
  // Review State (Persisted)
  const [review, setReview] = useLocalStorage('planner_weekly_review', {
    wins: '',
    improvements: '',
    nextPriorities: '',
    mood: 3,
    balance: { leisure: false, family: false, work: false, health: false }
  });

  // Sidebar Data State (Persisted)
  const [weeklyTasks, setWeeklyTasks] = useLocalStorage('planner_weekly_tasks', [
    { id: 1, text: 'Agendar médico', done: false },
    { id: 2, text: 'Comprar presente mãe', done: true },
    { id: 3, text: 'Reunião Escolar', done: false }
  ]);
  
  const [beatrizTime, setBeatrizTime] = useLocalStorage('planner_weekly_beatriz', '');
  const [homeChores, setHomeChores] = useLocalStorage('planner_weekly_home', [
    { id: 1, text: 'Lavar cortinas', done: false },
    { id: 2, text: 'Organizar despensa', done: false }
  ]);
  const [financeDue, setFinanceDue] = useLocalStorage('planner_weekly_finance', [
    { id: 1, text: 'Internet (dia 15)', done: false },
    { id: 2, text: 'Cartão (dia 20)', done: false }
  ]);

  // Helper to get start of week (Monday)
  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getMonday(new Date(currentDate));
  const weekDays: DayData[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return {
      date: d,
      top3: ['', '', ''],
      morning: '',
      afternoon: '',
      evening: ''
    };
  });

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentDate(newDate);
  };

  const toggleTask = (list: any[], setList: any, id: number) => {
    setList(list.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const weekRangeStr = `${startOfWeek.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${new Date(weekDays[6].date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Navigation & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center justify-between w-full md:w-auto bg-white p-1 rounded-xl shadow-sm border border-stone-200">
           <button 
              onClick={() => changeWeek(-1)} 
              className="flex items-center gap-1 px-3 py-2 text-stone-600 hover:bg-stone-50 rounded-lg transition-colors text-sm font-medium"
           >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Semana Anterior</span>
           </button>
           
           <div className="flex items-center gap-2 px-4 font-serif font-bold text-ink text-lg border-l border-r border-stone-100 mx-1">
              <Calendar size={18} className="text-accent" />
              <span className="whitespace-nowrap">{weekRangeStr}</span>
           </div>

           <button 
              onClick={() => changeWeek(1)} 
              className="flex items-center gap-1 px-3 py-2 text-stone-600 hover:bg-stone-50 rounded-lg transition-colors text-sm font-medium"
           >
              <span className="hidden sm:inline">Próxima Semana</span>
              <ChevronRight size={16} />
           </button>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-lg self-start md:self-auto">
            <button 
                onClick={() => setViewMode('plan')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'plan' ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
                <Layout size={16} /> Planejamento
            </button>
            <button 
                onClick={() => setViewMode('review')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'review' ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
                <Sparkles size={16} /> Revisão Semanal
            </button>
        </div>
      </div>

      {viewMode === 'plan' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Weekly Grid (Days) */}
            <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                    {weekDays.map((day, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col gap-3 group hover:border-stone-300 transition-colors">
                            {/* Day Header */}
                            <div className="flex items-baseline justify-between border-b border-stone-50 pb-2">
                                <span className="font-serif font-bold text-ink capitalize">
                                    {day.date.toLocaleDateString('pt-BR', { weekday: 'long' })}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    day.date.toDateString() === new Date().toDateString() ? 'bg-accent text-white' : 'bg-stone-100 text-stone-500'
                                }`}>
                                    {day.date.getDate()}
                                </span>
                            </div>

                            {/* Top 3 */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400">Top 3 Prioridades</label>
                                {[0, 1, 2].map(idx => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-stone-300">{idx+1}</span>
                                        <input className="flex-1 bg-stone-50 text-xs border-none rounded px-2 py-1 focus:ring-1 focus:ring-accent/30" placeholder="Prioridade..." />
                                    </div>
                                ))}
                            </div>

                            {/* Time Blocks */}
                            <div className="grid grid-cols-1 gap-2 mt-1">
                                <div>
                                    <label className="text-[10px] text-stone-400 font-semibold block mb-0.5">Manhã</label>
                                    <textarea rows={2} className="w-full bg-stone-50/50 text-xs border border-stone-100 rounded p-2 resize-none focus:border-accent/50 outline-none" placeholder="Compromissos..." />
                                </div>
                                <div>
                                    <label className="text-[10px] text-stone-400 font-semibold block mb-0.5">Tarde</label>
                                    <textarea rows={2} className="w-full bg-stone-50/50 text-xs border border-stone-100 rounded p-2 resize-none focus:border-accent/50 outline-none" placeholder="Compromissos..." />
                                </div>
                                <div>
                                    <label className="text-[10px] text-stone-400 font-semibold block mb-0.5">Noite</label>
                                    <textarea rows={1} className="w-full bg-stone-50/50 text-xs border border-stone-100 rounded p-2 resize-none focus:border-accent/50 outline-none" placeholder="Lazer/Descanso..." />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar Context Areas */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Weekly Tasks */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="font-serif text-lg text-ink mb-3 flex items-center gap-2">
                        <CheckSquare size={18} className="text-stone-400" />
                        Tarefas da Semana
                    </h3>
                    <div className="space-y-2 mb-3">
                        {weeklyTasks.map((task: any) => (
                            <div key={task.id} onClick={() => toggleTask(weeklyTasks, setWeeklyTasks, task.id)} className="flex items-center gap-2 cursor-pointer group">
                                {task.done ? <CheckCircle2 size={18} className="text-stone-400"/> : <Circle size={18} className="text-stone-300 group-hover:text-accent"/>}
                                <span className={`text-sm ${task.done ? 'line-through text-stone-400' : 'text-stone-600'}`}>{task.text}</span>
                            </div>
                        ))}
                    </div>
                    <input placeholder="+ Adicionar tarefa" className="w-full text-xs bg-stone-50 border-none p-2 rounded focus:ring-1 focus:ring-stone-200" />
                </div>

                {/* Beatriz Time */}
                <div className="bg-brand-daughter/5 p-5 rounded-xl border border-brand-daughter/10">
                    <h3 className="font-serif text-lg text-brand-daughter mb-3 flex items-center gap-2">
                        <Heart size={18} />
                        Tempo com Beatriz
                    </h3>
                    <p className="text-xs text-stone-500 mb-2">Planeje uma atividade especial:</p>
                    <textarea 
                        value={beatrizTime}
                        onChange={e => setBeatrizTime(e.target.value)}
                        className="w-full bg-white text-sm border-brand-daughter/10 rounded-lg p-3 focus:ring-brand-daughter/30 focus:border-brand-daughter placeholder:text-brand-daughter/30 min-h-[80px]" 
                        placeholder="Ex: Ir ao parque, leitura antes de dormir..."
                    />
                </div>

                {/* Home Chores */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200">
                     <h3 className="font-serif text-lg text-ink mb-3 flex items-center gap-2">
                        <Home size={18} className="text-brand-home" />
                        Casa
                    </h3>
                    <div className="space-y-2">
                        {homeChores.map((task: any) => (
                            <div key={task.id} onClick={() => toggleTask(homeChores, setHomeChores, task.id)} className="flex items-center gap-2 cursor-pointer group">
                                {task.done ? <CheckCircle2 size={18} className="text-brand-home"/> : <Circle size={18} className="text-stone-300 group-hover:text-brand-home"/>}
                                <span className={`text-sm ${task.done ? 'line-through text-stone-400' : 'text-stone-600'}`}>{task.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Quick Finance */}
                 <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200">
                     <h3 className="font-serif text-lg text-ink mb-3 flex items-center gap-2">
                        <DollarSign size={18} className="text-brand-finance" />
                        Financeiro Rápido
                    </h3>
                    <div className="space-y-2">
                        {financeDue.map((task: any) => (
                            <div key={task.id} onClick={() => toggleTask(financeDue, setFinanceDue, task.id)} className="flex items-center gap-2 cursor-pointer group">
                                {task.done ? <CheckCircle2 size={18} className="text-brand-finance"/> : <Circle size={18} className="text-stone-300 group-hover:text-brand-finance"/>}
                                <span className={`text-sm ${task.done ? 'line-through text-stone-400' : 'text-stone-600'}`}>{task.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
          </div>
      ) : (
        /* Review Mode */
        <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-sm border border-stone-200">
            <div className="text-center mb-8">
                <h2 className="font-serif text-3xl text-ink mb-2">Revisão Semanal</h2>
                <p className="text-stone-500">Domingo à noite ou Segunda pela manhã. Um momento para calibrar a bússola.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="block font-serif text-lg text-brand-finance">O que deu certo?</label>
                    <textarea 
                        value={review.wins} 
                        onChange={e => setReview({...review, wins: e.target.value})}
                        className="w-full h-32 bg-stone-50 border border-stone-200 rounded-lg p-4 focus:ring-1 focus:ring-accent/50 focus:border-accent outline-none resize-none"
                        placeholder="Vitórias, momentos felizes, tarefas concluídas..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="block font-serif text-lg text-brand-daughter">O que ajustar?</label>
                    <textarea 
                         value={review.improvements} 
                         onChange={e => setReview({...review, improvements: e.target.value})}
                        className="w-full h-32 bg-stone-50 border border-stone-200 rounded-lg p-4 focus:ring-1 focus:ring-accent/50 focus:border-accent outline-none resize-none"
                        placeholder="O que ficou pendente? O que drenou energia?"
                    />
                </div>
            </div>

            <div className="space-y-2">
                 <label className="block font-serif text-lg text-ink">Prioridades da Próxima Semana</label>
                 <textarea 
                    value={review.nextPriorities} 
                    onChange={e => setReview({...review, nextPriorities: e.target.value})}
                    className="w-full h-24 bg-stone-50 border border-stone-200 rounded-lg p-4 focus:ring-1 focus:ring-accent/50 focus:border-accent outline-none resize-none"
                    placeholder="Focar em..."
                 />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-stone-100">
                <div>
                    <label className="block font-serif text-lg text-ink mb-4">Humor & Energia (1-5)</label>
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button 
                                key={n}
                                onClick={() => setReview({...review, mood: n})}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${review.mood === n ? 'bg-accent text-white scale-110' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                     <label className="block font-serif text-lg text-ink mb-4">Equilíbrio da Semana</label>
                     <div className="grid grid-cols-2 gap-3">
                         {Object.entries(review.balance).map(([key, val]) => (
                             <label key={key} className="flex items-center gap-2 cursor-pointer p-2 border border-stone-100 rounded hover:bg-stone-50">
                                 <input 
                                    type="checkbox" 
                                    checked={val}
                                    onChange={() => setReview({...review, balance: { ...review.balance, [key]: !val }})}
                                    className="rounded text-accent focus:ring-accent"
                                 />
                                 <span className="capitalize text-stone-600">{key === 'work' ? 'Trabalho' : key === 'health' ? 'Saúde' : key === 'family' ? 'Família' : 'Lazer'}</span>
                             </label>
                         ))}
                     </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
