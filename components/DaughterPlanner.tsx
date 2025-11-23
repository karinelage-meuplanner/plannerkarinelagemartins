
import React, { useState } from 'react';
import { 
  Heart, GraduationCap, Stethoscope, Ruler, Camera, 
  Gift, Calendar, Plus, Trash2, Clock, Music, Activity 
} from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';

interface ScheduleItem {
  id: string;
  day: string;
  time: string;
  activity: string;
  category: 'school' | 'sport' | 'art' | 'other';
}

interface Appointment {
  id: string;
  date: string;
  specialty: string;
  doctor: string;
}

interface Memory {
  id: string;
  date: string;
  text: string;
}

export const DaughterPlanner: React.FC = () => {
  // Schedule State (Persisted)
  const [schedule, setSchedule] = useLocalStorage<ScheduleItem[]>('planner_daughter_schedule', [
    { id: '1', day: 'Segunda', time: '14:00', activity: 'Escola', category: 'school' },
    { id: '2', day: 'Segunda', time: '18:00', activity: 'Natação', category: 'sport' },
    { id: '3', day: 'Quarta', time: '17:30', activity: 'Ballet', category: 'art' },
    { id: '4', day: 'Sexta', time: '14:00', activity: 'Escola', category: 'school' },
  ]);

  // Health State (Persisted)
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('planner_daughter_appointments', [
    { id: '1', date: '2024-06-15', specialty: 'Pediatra', doctor: 'Dra. Ana' },
    { id: '2', date: '2024-07-10', specialty: 'Dentista', doctor: 'Dr. Carlos' },
  ]);
  const [stats, setStats] = useLocalStorage('planner_daughter_stats', { height: '110', weight: '18.5' });

  // Memories State (Persisted)
  const [memories, setMemories] = useLocalStorage<Memory[]>('planner_daughter_memories', [
    { id: '1', date: '2024-05-10', text: 'Caiu o primeiro dentinho!' },
    { id: '2', date: '2024-05-01', text: 'Aprendeu a andar de bicicleta sem rodinhas.' },
  ]);
  const [newMemory, setNewMemory] = useState('');

  // School/Tasks (Persisted)
  const [schoolTasks, setSchoolTasks] = useLocalStorage('planner_daughter_school_tasks', [
    { id: 1, text: 'Maquete de Geografia', date: '20/05', done: false },
    { id: 2, text: 'Prova de Matemática', date: '22/05', done: false },
  ]);

  // Handlers
  const addMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;
    setMemories([{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], text: newMemory }, ...memories]);
    setNewMemory('');
  };

  const toggleTask = (id: number) => {
    setSchoolTasks(schoolTasks.map((t: any) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Header / Quick Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-daughter/10 flex items-center justify-center text-brand-daughter border-2 border-brand-daughter/20">
                <Heart size={32} fill="#BE185D" fillOpacity={0.2} />
            </div>
            <div>
                <h2 className="font-serif text-2xl text-ink">Espaço da Beatriz</h2>
                <p className="text-stone-500 text-sm">Acompanhando cada passo.</p>
            </div>
         </div>
         
         <div className="flex gap-4 text-sm">
            <div className="bg-stone-50 px-4 py-2 rounded-lg border border-stone-100 text-center">
                <span className="block text-xs text-stone-400 uppercase font-bold">Altura</span>
                <span className="font-serif font-bold text-brand-daughter text-lg">{stats.height} <span className="text-xs text-stone-500">cm</span></span>
            </div>
            <div className="bg-stone-50 px-4 py-2 rounded-lg border border-stone-100 text-center">
                <span className="block text-xs text-stone-400 uppercase font-bold">Peso</span>
                <span className="font-serif font-bold text-brand-daughter text-lg">{stats.weight} <span className="text-xs text-stone-500">kg</span></span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Routine & Activities */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-full">
                <h3 className="font-serif text-lg text-ink mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-brand-daughter" />
                    Atividades da Semana
                </h3>
                
                <div className="space-y-4">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(day => {
                        const dayActivities = schedule.filter(s => s.day === day);
                        return (
                            <div key={day} className="border-b border-stone-50 pb-3 last:border-0">
                                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{day}</h4>
                                {dayActivities.length > 0 ? (
                                    <div className="space-y-2">
                                        {dayActivities.map(act => (
                                            <div key={act.id} className="flex items-center gap-3 bg-stone-50 p-2 rounded-lg">
                                                <div className={`p-1.5 rounded ${
                                                    act.category === 'school' ? 'bg-blue-100 text-blue-600' : 
                                                    act.category === 'sport' ? 'bg-green-100 text-green-600' :
                                                    act.category === 'art' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100'
                                                }`}>
                                                    {act.category === 'school' ? <GraduationCap size={14} /> : 
                                                     act.category === 'sport' ? <Activity size={14} /> :
                                                     act.category === 'art' ? <Music size={14} /> : <Clock size={14} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-stone-700">{act.activity}</p>
                                                    <p className="text-[10px] text-stone-500">{act.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-stone-300 italic">Livre</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Column 2: School & Health */}
        <div className="lg:col-span-1 space-y-6">
            {/* School Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="font-serif text-lg text-ink mb-4 flex items-center gap-2">
                    <GraduationCap size={18} className="text-blue-500" />
                    Escola & Tarefas
                </h3>
                <div className="space-y-2">
                    {schoolTasks.map((task: any) => (
                        <div 
                            key={task.id} 
                            onClick={() => toggleTask(task.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${task.done ? 'bg-stone-50 border-stone-100' : 'bg-white border-stone-200 hover:border-blue-300'}`}
                        >
                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${task.done ? 'bg-blue-500 border-blue-500' : 'border-stone-300'}`}>
                                {task.done && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${task.done ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{task.text}</p>
                                <p className="text-xs text-stone-400">{task.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Health Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="font-serif text-lg text-ink mb-4 flex items-center gap-2">
                    <Stethoscope size={18} className="text-green-500" />
                    Saúde
                </h3>
                
                <div className="mb-4">
                     <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Próximas Consultas</p>
                     <div className="space-y-2">
                         {appointments.map(app => (
                             <div key={app.id} className="flex items-center justify-between p-2 bg-green-50/50 rounded border border-green-100">
                                 <div>
                                     <p className="text-sm font-bold text-green-800">{app.specialty}</p>
                                     <p className="text-xs text-green-600">{app.doctor} • {new Date(app.date).toLocaleDateString('pt-BR')}</p>
                                 </div>
                                 <button onClick={() => deleteAppointment(app.id)} className="text-green-300 hover:text-green-600">
                                     <Trash2 size={14} />
                                 </button>
                             </div>
                         ))}
                     </div>
                </div>

                <div className="pt-4 border-t border-stone-100">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-stone-600 flex items-center gap-2"><Gift size={14} /> Vitaminas</span>
                        <input type="checkbox" className="rounded text-green-500 focus:ring-green-500" />
                    </div>
                </div>
            </div>
        </div>

        {/* Column 3: Memories */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#FFF0F5] p-6 rounded-xl shadow-sm border border-pink-100 h-full flex flex-col">
                <h3 className="font-serif text-lg text-pink-800 mb-4 flex items-center gap-2">
                    <Camera size={18} className="text-pink-500" />
                    Diário de Memórias
                </h3>
                
                <form onSubmit={addMemory} className="mb-4 relative">
                    <textarea 
                        value={newMemory}
                        onChange={(e) => setNewMemory(e.target.value)}
                        placeholder="O que aconteceu de especial hoje?"
                        className="w-full bg-white border border-pink-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-pink-200 outline-none resize-none h-24 placeholder:text-pink-300"
                    />
                    <button type="submit" className="absolute bottom-3 right-3 bg-pink-500 text-white p-1.5 rounded-md hover:bg-pink-600 transition-colors">
                        <Plus size={16} />
                    </button>
                </form>

                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar max-h-[400px] pr-2">
                    {memories.map(mem => (
                        <div key={mem.id} className="bg-white p-4 rounded-lg border border-pink-100 shadow-sm relative">
                            <div className="absolute -left-1.5 top-4 w-3 h-3 bg-pink-200 rounded-full border-2 border-white"></div>
                            <p className="text-xs text-pink-400 font-bold mb-1">{new Date(mem.date).toLocaleDateString('pt-BR')}</p>
                            <p className="text-stone-700 text-sm leading-relaxed font-serif italic">"{mem.text}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
