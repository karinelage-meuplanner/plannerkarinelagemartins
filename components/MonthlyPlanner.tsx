
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Target, List, CheckSquare, Droplets, Moon, Zap } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';

export const MonthlyPlanner: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State for inputs (Persisted)
  const [goals, setGoals] = useLocalStorage<string[]>('planner_monthly_goals', ['', '', '']);
  const [priorities, setPriorities] = useLocalStorage<string[]>('planner_monthly_priorities', ['', '', '', '', '']);
  const [actionPlans, setActionPlans] = useLocalStorage<string[]>('planner_monthly_actions', ['', '', '']);
  
  // Mock Habit Data (31 days) (Persisted)
  const [habits, setHabits] = useLocalStorage('planner_monthly_habits', {
    water: Array(31).fill(false),
    sleep: Array(31).fill(false),
    exercise: Array(31).fill(false)
  });

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
  
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDayOfMonth(year, month); // 0 = Sunday
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const empties = Array.from({ length: startDay }, (_, i) => i);

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const toggleHabit = (habit: 'water' | 'sleep' | 'exercise', dayIndex: number) => {
    setHabits(prev => ({
        ...prev,
        [habit]: prev[habit].map((val: boolean, idx: number) => idx === dayIndex ? !val : val)
    }));
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl text-ink capitalize">
            {monthNames[month]} <span className="text-stone-400">{year}</span>
        </h2>
        <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-stone-100 rounded-full text-stone-600"><ChevronLeft /></button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-stone-100 rounded-full text-stone-600"><ChevronRight /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid (Left - 2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className="text-xs font-bold text-stone-400 uppercase tracking-wider py-2">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2 auto-rows-fr flex-1">
                {empties.map(e => <div key={`empty-${e}`} className="bg-transparent min-h-[80px]"></div>)}
                {days.map(day => (
                    <div key={day} className="border border-stone-100 rounded-lg p-2 hover:border-accent/50 transition-colors cursor-pointer relative group bg-stone-50/30 min-h-[80px] flex flex-col justify-between">
                        <span className="text-sm font-serif font-medium text-stone-700">{day}</span>
                        {/* Mock Events dots */}
                        {day === 15 && <div className="text-[10px] bg-brand-daughter/10 text-brand-daughter px-1 rounded mt-1 truncate w-full">Niver</div>}
                    </div>
                ))}
            </div>
        </div>

        {/* Sidebar: Goals & Priorities */}
        <div className="space-y-6">
            {/* Monthly Goals */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="font-serif text-lg text-ink mb-4 flex items-center gap-2">
                    <Target size={18} className="text-accent" />
                    Metas do Mês
                </h3>
                <div className="space-y-3">
                    {goals.map((g, i) => (
                        <input 
                            key={i}
                            value={g}
                            onChange={(e) => {
                                const newG = [...goals];
                                newG[i] = e.target.value;
                                setGoals(newG);
                            }}
                            placeholder={`Meta ${i + 1}`}
                            className="w-full bg-stone-50 border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-accent/50 placeholder:text-stone-400"
                        />
                    ))}
                </div>
            </div>

            {/* Top 5 Priorities */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="font-serif text-lg text-ink mb-4 flex items-center gap-2">
                    <List size={18} className="text-brand-work" />
                    Top 5 Prioridades
                </h3>
                <div className="space-y-2">
                    {priorities.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-300 w-4">{i + 1}</span>
                            <input 
                                value={p}
                                onChange={(e) => {
                                    const newP = [...priorities];
                                    newP[i] = e.target.value;
                                    setPriorities(newP);
                                }}
                                className="flex-1 bg-transparent border-b border-stone-100 py-1 text-sm focus:border-brand-work outline-none"
                                placeholder="..."
                            />
                        </div>
                    ))}
                </div>
            </div>

             {/* Action Plan */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="font-serif text-lg text-ink mb-4 flex items-center gap-2">
                    <CheckSquare size={18} className="text-brand-finance" />
                    Plano de Ação
                </h3>
                <div className="space-y-3">
                    {actionPlans.map((item, i) => (
                        <div key={i} className="flex gap-2">
                            <div className="mt-1.5 w-2 h-2 rounded-full bg-stone-300"></div>
                            <textarea 
                                value={item}
                                onChange={(e) => {
                                    const newA = [...actionPlans];
                                    newA[i] = e.target.value;
                                    setActionPlans(newA);
                                }}
                                className="flex-1 bg-stone-50 rounded-lg p-2 text-sm border border-stone-100 resize-none focus:ring-1 focus:ring-brand-finance/50 outline-none"
                                rows={2}
                                placeholder="O que fazer..."
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Habit Trackers */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 overflow-x-auto custom-scrollbar">
         <h3 className="font-serif text-lg text-ink mb-4">Rastreadores de Hábitos</h3>
         <div className="min-w-[800px]">
             {/* Header Days */}
             <div className="flex mb-2">
                 <div className="w-32 shrink-0"></div>
                 {days.map(d => (
                     <div key={d} className="flex-1 text-center text-[10px] text-stone-400">{d}</div>
                 ))}
             </div>
             
             {/* Water */}
             <div className="flex items-center mb-3 py-2 border-b border-stone-50">
                 <div className="w-32 shrink-0 flex items-center gap-2 font-medium text-sm text-blue-500">
                     <Droplets size={16} /> Água
                 </div>
                 {habits.water.map((checked: boolean, i: number) => (
                     <div key={i} className="flex-1 flex justify-center">
                        <button 
                            onClick={() => toggleHabit('water', i)}
                            className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${checked ? 'bg-blue-400 border-blue-400' : 'border-stone-200 hover:border-blue-300'}`}
                        >
                            {checked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </button>
                     </div>
                 ))}
             </div>

             {/* Sleep */}
             <div className="flex items-center mb-3 py-2 border-b border-stone-50">
                 <div className="w-32 shrink-0 flex items-center gap-2 font-medium text-sm text-indigo-500">
                     <Moon size={16} /> Sono
                 </div>
                 {habits.sleep.map((checked: boolean, i: number) => (
                     <div key={i} className="flex-1 flex justify-center">
                        <button 
                            onClick={() => toggleHabit('sleep', i)}
                            className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${checked ? 'bg-indigo-400 border-indigo-400' : 'border-stone-200 hover:border-indigo-300'}`}
                        >
                            {checked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </button>
                     </div>
                 ))}
             </div>

             {/* Energy/Exercise */}
             <div className="flex items-center py-2">
                 <div className="w-32 shrink-0 flex items-center gap-2 font-medium text-sm text-orange-500">
                     <Zap size={16} /> Exercício
                 </div>
                 {habits.exercise.map((checked: boolean, i: number) => (
                     <div key={i} className="flex-1 flex justify-center">
                        <button 
                            onClick={() => toggleHabit('exercise', i)}
                            className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${checked ? 'bg-orange-400 border-orange-400' : 'border-stone-200 hover:border-orange-300'}`}
                        >
                            {checked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </button>
                     </div>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
};
