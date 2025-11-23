
import React, { useState } from 'react';
import { TodoItem, GoogleCalendarEvent } from '../types';
import { CheckCircle2, Circle, Plus, Download, Sparkles, Calendar as CalendarIcon, Share2, Clock } from 'lucide-react';
import { generateDailyPlan } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';

interface Props {
  calendarEvents?: GoogleCalendarEvent[];
}

export const DailyPlanner: React.FC<Props> = ({ calendarEvents = [] }) => {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('planner_daily_todos', [
    { id: '1', text: 'Revisar orçamento mensal', completed: false, priority: 'high', category: 'finance' },
    { id: '2', text: 'Brincar com Beatriz no parque', completed: false, priority: 'high', category: 'daughter' },
    { id: '3', text: 'Enviar relatório semanal', completed: true, priority: 'medium', category: 'work' },
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { 
      id: Date.now().toString(), 
      text: newTodo, 
      completed: false, 
      priority: 'medium' 
    }]);
    setNewTodo('');
  };

  const handleExportCalendar = () => {
    // Generate CSV content
    const headers = "Subject,Start Date,Start Time,Description\n";
    const dateStr = new Date().toISOString().split('T')[0]; // Today
    const rows = todos.map(t => `"${t.text}","${dateStr}","09:00","Prioridade: ${t.priority}"`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `planner_export_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const dateStr = new Date().toLocaleDateString('pt-BR');
    const priorities = todos.filter(t => t.priority === 'high').map(t => `- ${t.completed ? '✅' : '⭕'} ${t.text}`).join('\n');
    const otherTasks = todos.filter(t => t.priority !== 'high').map(t => `- ${t.completed ? '✅' : '⭕'} ${t.text}`).join('\n');

    const text = `📅 *Planejamento Diário - ${dateStr}*\n\n` +
                 `🔥 *Prioridades:*\n${priorities || 'Nenhuma'}\n\n` +
                 `📝 *Tarefas:*\n${otherTasks || 'Nenhuma'}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Planejamento ${dateStr}`,
                text: text,
            });
        } catch (err) {
            console.log('Error sharing', err);
        }
    } else {
        navigator.clipboard.writeText(text);
        alert('Copiado para a área de transferência!');
    }
  };

  const handleAiPlan = async () => {
    setIsGenerating(true);
    const activeTodos = todos.filter(t => !t.completed).map(t => t.text);
    const eventsSummary = calendarEvents.map(e => `${e.summary} (${new Date(e.start.dateTime || '').toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})})`);
    const plan = await generateDailyPlan(activeTodos, eventsSummary.length ? eventsSummary : ["Sem compromissos"], "Motivado");
    setAiSuggestion(plan);
    setIsGenerating(false);
  };

  // Helper to filter events for specific hour slot
  const getEventsForHour = (hour: number) => {
      return calendarEvents.filter(event => {
          if (!event.start.dateTime) return false;
          const eventDate = new Date(event.start.dateTime);
          return eventDate.getHours() === hour;
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Priorities & To-Do */}
      <div className="lg:col-span-2 space-y-8">
        {/* Top 3 Priorities */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
            <h3 className="font-serif text-xl mb-4 text-ink">Prioridades do Dia</h3>
            <div className="space-y-3">
                {todos.filter(t => t.priority === 'high').map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
                        <button onClick={() => toggleTodo(t.id)} className="text-accent hover:text-accent-hover">
                            {t.completed ? <CheckCircle2 /> : <Circle />}
                        </button>
                        <span className={`flex-1 font-medium ${t.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>{t.text}</span>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full uppercase tracking-wide">Top 3</span>
                    </div>
                ))}
                 {todos.filter(t => t.priority === 'high').length === 0 && <p className="text-stone-400 italic text-sm">Nenhuma prioridade alta definida.</p>}
            </div>
        </div>

        {/* Task List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-xl text-ink">Tarefas</h3>
                <div className="flex gap-2">
                    <button onClick={handleShare} className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors" title="Compartilhar Tarefas">
                        <Share2 size={20} />
                    </button>
                    <button onClick={handleAiPlan} disabled={isGenerating} className="p-2 text-accent hover:bg-accent/10 rounded-full transition-colors" title="Gerar Plano com IA">
                        <Sparkles size={20} />
                    </button>
                    <button onClick={handleExportCalendar} className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors" title="Exportar para GCalendar (CSV)">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <form onSubmit={addTodo} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Adicionar nova tarefa..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <button type="submit" className="bg-ink text-white px-4 py-2 rounded-lg hover:bg-stone-700">
                    <Plus size={20} />
                </button>
            </form>

            <div className="space-y-2">
                {todos.filter(t => t.priority !== 'high').map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg transition-colors group">
                        <button onClick={() => toggleTodo(t.id)} className="text-stone-400 hover:text-accent">
                            {t.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <span className={`flex-1 ${t.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>{t.text}</span>
                        {t.category && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold
                                ${t.category === 'work' ? 'bg-brand-work/10 text-brand-work' : ''}
                                ${t.category === 'finance' ? 'bg-brand-finance/10 text-brand-finance' : ''}
                                ${t.category === 'daughter' ? 'bg-brand-daughter/10 text-brand-daughter' : ''}
                            `}>
                                {t.category}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Right Column: Schedule & Gemini Plan */}
      <div className="space-y-8">
        {/* Time Blocking Visualization */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-96 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-xl text-ink flex items-center gap-2">
                    <CalendarIcon size={20} /> Agenda Google
                </h3>
                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{calendarEvents.length} eventos</span>
            </div>
            
            <div className="space-y-0 relative">
                {/* Time slots 8:00 to 18:00 */}
                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => {
                    const hourEvents = getEventsForHour(hour);
                    return (
                        <div key={hour} className="flex border-b border-stone-100 min-h-[60px] relative group">
                            <span className="w-12 text-xs text-stone-400 pt-2 font-mono">{hour}:00</span>
                            <div className="flex-1 relative pt-1 pl-2 pb-1">
                                {hourEvents.length > 0 ? (
                                    hourEvents.map(ev => (
                                        <div key={ev.id} className="bg-blue-50 border-l-2 border-blue-500 p-1.5 mb-1 rounded-r text-xs animate-fade-in">
                                            <p className="font-bold text-blue-900 truncate">{ev.summary}</p>
                                            <div className="flex items-center gap-1 text-blue-600/70 text-[10px]">
                                                <Clock size={10} />
                                                {new Date(ev.start.dateTime || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                {' - '}
                                                {new Date(ev.end.dateTime || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[10px] text-stone-300 pt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-default">Livre</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Gemini Suggestion Box */}
        {aiSuggestion && (
            <div className="bg-gradient-to-br from-white to-stone-50 p-6 rounded-xl shadow-sm border border-accent/30 animate-fade-in">
                 <h3 className="font-serif text-lg mb-2 text-ink flex items-center gap-2">
                    <Sparkles size={18} className="text-accent" /> Sugestão IA
                </h3>
                <div className="text-sm text-stone-600 prose prose-stone leading-relaxed whitespace-pre-line">
                    {aiSuggestion}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
