
import React, { useState } from 'react';
import { Plus, Trash2, Calendar, CheckCircle2, Circle, Target, Heart, Briefcase, Home, ShieldCheck } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';

interface Event {
  id: string;
  date: string;
  title: string;
  location: string;
}

interface CheckItem {
  id: string;
  text: string;
  completed: boolean;
}

export const AnnualPlanner: React.FC = () => {
  const [reflection, setReflection] = useLocalStorage('planner_annual_reflection', '');
  const [goals, setGoals] = useLocalStorage<string[]>('planner_annual_goals', ['', '', '']);
  
  // State for Priorities (Persisted)
  const [priorities, setPriorities] = useLocalStorage('planner_annual_priorities', {
    personal: ['', '', '', '', ''],
    family: ['', '', '', '', ''],
    work: ['', '', '', '', ''],
  });

  // State for Events (Persisted)
  const [events, setEvents] = useLocalStorage<Event[]>('planner_annual_events', [
    { id: '1', date: '2025-01-15', title: 'Aniversário Beatriz', location: 'Casa' },
    { id: '2', date: '2025-07-10', title: 'Férias em Família', location: 'Praia' }
  ]);
  const [newEvent, setNewEvent] = useState({ date: '', title: '', location: '' });

  // State for Health/Docs (Persisted)
  const [checks, setChecks] = useLocalStorage<CheckItem[]>('planner_annual_checks', [
    { id: '1', text: 'Check-up médico anual', completed: false },
    { id: '2', text: 'Renovar seguro do carro', completed: false },
    { id: '3', text: 'Dentista (Beatriz)', completed: false },
    { id: '4', text: 'Imposto de Renda', completed: true },
  ]);
  const [newCheck, setNewCheck] = useState('');

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const handlePriorityChange = (category: 'personal' | 'family' | 'work', index: number, value: string) => {
    setPriorities(prev => {
        const newList = [...prev[category]];
        newList[index] = value;
        return { ...prev, [category]: newList };
    });
  };

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setEvents([...events, { ...newEvent, id: Date.now().toString() }]);
    setNewEvent({ date: '', title: '', location: '' });
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  const addCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheck.trim()) return;
    setChecks([...checks, { id: Date.now().toString(), text: newCheck, completed: false }]);
    setNewCheck('');
  };

  const toggleCheck = (id: string) => {
    setChecks(checks.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const deleteCheck = (id: string) => {
      setChecks(checks.filter(c => c.id !== id));
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Header / Reflection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
        <h2 className="font-serif text-2xl text-ink mb-4 flex items-center gap-2">
            <Calendar className="text-stone-400" />
            Visão Anual
        </h2>
        <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Reflexão do ano anterior</label>
            <textarea 
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-stone-700 focus:ring-0 resize-none placeholder:text-stone-400/70 leading-relaxed"
                rows={3}
                placeholder="Escreva aqui o que funcionou, o que não funcionou e o que você quer levar para este novo ano..."
            />
        </div>
      </div>

      {/* Main Goals */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((goal, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative overflow-hidden group hover:border-accent/30 transition-colors">
                    <div className="absolute -right-6 -top-6 text-[8rem] font-serif text-stone-50 group-hover:text-accent/5 transition-colors z-0 pointer-events-none">{index + 1}</div>
                    <div className="relative z-10">
                        <label className="text-xs font-bold text-accent uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Target size={14} />
                            Meta Principal {index + 1}
                        </label>
                        <textarea 
                            value={goal}
                            onChange={(e) => updateGoal(index, e.target.value)}
                            placeholder="Defina sua meta principal..."
                            className="w-full bg-transparent border-b border-stone-200 text-lg font-medium text-ink focus:border-accent outline-none py-1 placeholder:text-stone-300 resize-none h-24"
                        />
                    </div>
                </div>
            ))}
      </section>

      {/* Priorities Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Personal */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
             <div className="flex items-center gap-2 mb-4 text-brand-personal">
                 <Heart size={20} />
                 <h3 className="font-serif text-lg font-medium">Pessoal</h3>
             </div>
             <div className="space-y-3">
                 {priorities.personal.map((val, idx) => (
                     <input 
                        key={idx}
                        value={val} 
                        onChange={(e) => handlePriorityChange('personal', idx, e.target.value)}
                        className="w-full bg-stone-50 border-none rounded-md px-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:ring-1 focus:ring-brand-personal/50"
                        placeholder={`Prioridade ${idx + 1}`}
                     />
                 ))}
             </div>
         </div>

         {/* Family */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
             <div className="flex items-center gap-2 mb-4 text-brand-daughter">
                 <Home size={20} />
                 <h3 className="font-serif text-lg font-medium">Família</h3>
             </div>
             <div className="space-y-3">
                 {priorities.family.map((val, idx) => (
                     <input 
                        key={idx}
                        value={val} 
                        onChange={(e) => handlePriorityChange('family', idx, e.target.value)}
                        className="w-full bg-stone-50 border-none rounded-md px-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:ring-1 focus:ring-brand-daughter/50"
                        placeholder={`Prioridade ${idx + 1}`}
                     />
                 ))}
             </div>
         </div>

         {/* Work */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
             <div className="flex items-center gap-2 mb-4 text-brand-work">
                 <Briefcase size={20} />
                 <h3 className="font-serif text-lg font-medium">Trabalho</h3>
             </div>
             <div className="space-y-3">
                 {priorities.work.map((val, idx) => (
                     <input 
                        key={idx}
                        value={val} 
                        onChange={(e) => handlePriorityChange('work', idx, e.target.value)}
                        className="w-full bg-stone-50 border-none rounded-md px-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:ring-1 focus:ring-brand-work/50"
                        placeholder={`Prioridade ${idx + 1}`}
                     />
                 ))}
             </div>
         </div>
      </section>

      {/* Bottom Section: Events & Checks */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Important Events */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
              <h3 className="font-serif text-lg text-ink mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-accent" /> 
                  Eventos Importantes
              </h3>
              
              <div className="space-y-4 mb-6">
                  {events.length === 0 && <p className="text-sm text-stone-400 italic">Nenhum evento adicionado.</p>}
                  {events.map(event => (
                      <div key={event.id} className="flex items-start gap-4 group">
                          <div className="bg-stone-100 rounded-lg px-3 py-1 text-center min-w-[60px]">
                              <span className="block text-xs text-stone-500 font-bold uppercase">{event.date ? new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }) : '-'}</span>
                              <span className="block text-lg font-serif font-bold text-ink">{event.date ? new Date(event.date).getDate() : '-'}</span>
                          </div>
                          <div className="flex-1">
                              <p className="font-medium text-stone-800">{event.title}</p>
                              <p className="text-xs text-stone-500 flex items-center gap-1">
                                  {event.location}
                              </p>
                          </div>
                          <button onClick={() => removeEvent(event.id)} className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
              </div>

              <form onSubmit={addEvent} className="flex gap-2 items-end pt-4 border-t border-stone-100">
                 <div className="flex-1 space-y-2">
                     <div className="flex gap-2">
                        <input 
                            type="date" 
                            value={newEvent.date}
                            onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                            className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs w-1/3 focus:outline-none focus:border-accent"
                        />
                        <input 
                            type="text" 
                            placeholder="Evento"
                            value={newEvent.title}
                            onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                            className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:border-accent"
                        />
                     </div>
                     <input 
                        type="text" 
                        placeholder="Local (opcional)"
                        value={newEvent.location}
                        onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                        className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs w-full focus:outline-none focus:border-accent"
                     />
                 </div>
                 <button type="submit" className="bg-ink text-white p-2 rounded-lg hover:bg-stone-700 transition-colors mb-0.5">
                     <Plus size={16} />
                 </button>
              </form>
          </div>

          {/* Health & Documents Checklist */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col h-full">
              <h3 className="font-serif text-lg text-ink mb-6 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-brand-finance" /> 
                  Saúde & Documentos
              </h3>

              <div className="space-y-3 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                  {checks.length === 0 && <p className="text-stone-400 italic text-sm py-2">Nenhum item pendente.</p>}
                  {checks.map(check => (
                      <div 
                        key={check.id} 
                        onClick={() => toggleCheck(check.id)}
                        className="flex items-center gap-3 group p-2.5 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                      >
                          <button className={`${check.completed ? 'text-brand-finance' : 'text-stone-300 hover:text-brand-finance'} transition-colors`}>
                              {check.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                          </button>
                          <span className={`flex-1 text-sm font-medium ${check.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                              {check.text}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteCheck(check.id); }} 
                            className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
              </div>

              <form onSubmit={addCheck} className="flex gap-3 pt-4 border-t border-stone-100 mt-auto">
                  <input 
                    type="text" 
                    value={newCheck}
                    onChange={e => setNewCheck(e.target.value)}
                    placeholder="Adicionar check (ex: Renovar CNH)..."
                    className="flex-1 bg-white border-2 border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-finance focus:ring-2 focus:ring-brand-finance/10 transition-all placeholder:text-stone-400"
                  />
                  <button 
                    type="submit" 
                    disabled={!newCheck.trim()}
                    className="bg-brand-finance text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                  >
                      <Plus size={22} />
                  </button>
              </form>
          </div>
      </section>
    </div>
  );
};
