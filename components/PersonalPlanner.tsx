
import React, { useState } from 'react';
import { 
  Sun, Moon, BookOpen, Heart, Smile, Plus, Trash2, 
  CheckCircle2, Circle, Coffee, Film, Music, PenTool 
} from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';

interface MediaItem {
  id: string;
  title: string;
  type: 'book' | 'movie' | 'series';
  status: 'todo' | 'doing' | 'done';
}

interface RitualItem {
  id: string;
  text: string;
  completed: boolean;
}

export const PersonalPlanner: React.FC = () => {
  // Rituals State (Persisted)
  const [morningRituals, setMorningRituals] = useLocalStorage<RitualItem[]>('planner_personal_am_rituals', [
    { id: '1', text: 'Beber 500ml de água', completed: false },
    { id: '2', text: 'Meditação (10min)', completed: true },
    { id: '3', text: 'Alongamento', completed: false },
    { id: '4', text: 'Skin Care', completed: false },
  ]);

  const [eveningRituals, setEveningRituals] = useLocalStorage<RitualItem[]>('planner_personal_pm_rituals', [
    { id: '1', text: 'Leitura (20min)', completed: false },
    { id: '2', text: 'Sem telas 1h antes de dormir', completed: false },
    { id: '3', text: 'Planejar o dia seguinte', completed: false },
  ]);

  // Journal State (Persisted)
  const [gratitude, setGratitude] = useLocalStorage('planner_personal_gratitude', '');
  const [mood, setMood] = useLocalStorage<number | null>('planner_personal_mood', null);

  // Media State (Persisted)
  const [mediaList, setMediaList] = useLocalStorage<MediaItem[]>('planner_personal_media', [
    { id: '1', title: 'Hábitos Atômicos', type: 'book', status: 'doing' },
    { id: '2', title: 'Interestelar', type: 'movie', status: 'todo' },
    { id: '3', title: 'Succession', type: 'series', status: 'done' },
  ]);
  const [newItem, setNewItem] = useState('');
  const [newType, setNewType] = useState<'book' | 'movie' | 'series'>('book');

  // Handlers
  const toggleRitual = (list: RitualItem[], setList: React.Dispatch<React.SetStateAction<RitualItem[]>>, id: string) => {
    setList(list.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const addMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setMediaList([...mediaList, { id: Date.now().toString(), title: newItem, type: newType, status: 'todo' }]);
    setNewItem('');
  };

  const deleteMedia = (id: string) => {
    setMediaList(mediaList.filter(item => item.id !== id));
  };

  const updateMediaStatus = (id: string) => {
    setMediaList(mediaList.map(item => {
        if (item.id !== id) return item;
        const next = item.status === 'todo' ? 'doing' : item.status === 'doing' ? 'done' : 'todo';
        return { ...item, status: next };
    }));
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Top Stats / Mood */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
            <h2 className="font-serif text-2xl text-ink mb-1">Bem-estar & Equilíbrio</h2>
            <p className="text-stone-500 text-sm">Invista tempo em você mesma. Como você está se sentindo hoje?</p>
        </div>
        <div className="flex gap-3 bg-stone-50 p-2 rounded-full">
            {[1, 2, 3, 4, 5].map((m) => (
                <button 
                    key={m}
                    onClick={() => setMood(m)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${mood === m ? 'bg-brand-personal text-white shadow-md' : 'text-stone-400 hover:bg-stone-200'}`}
                >
                    {m === 1 ? '😔' : m === 2 ? '😕' : m === 3 ? '😐' : m === 4 ? '🙂' : '😁'}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Rituals */}
        <div className="lg:col-span-1 space-y-6">
            {/* Morning */}
            <div className="bg-[#FFFBF0] p-6 rounded-xl shadow-sm border border-orange-100">
                <h3 className="font-serif text-lg text-orange-800 mb-4 flex items-center gap-2">
                    <Sun size={20} className="text-orange-500" />
                    Ritual da Manhã
                </h3>
                <div className="space-y-3">
                    {morningRituals.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => toggleRitual(morningRituals, setMorningRituals, item.id)}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div className={`transition-colors ${item.completed ? 'text-orange-500' : 'text-orange-200 group-hover:text-orange-400'}`}>
                                {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </div>
                            <span className={`text-sm font-medium ${item.completed ? 'text-orange-300 line-through' : 'text-orange-900/80'}`}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Evening */}
            <div className="bg-[#F3F4F6] p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-serif text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <Moon size={20} className="text-slate-500" />
                    Ritual da Noite
                </h3>
                <div className="space-y-3">
                    {eveningRituals.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => toggleRitual(eveningRituals, setEveningRituals, item.id)}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div className={`transition-colors ${item.completed ? 'text-slate-500' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </div>
                            <span className={`text-sm font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Column 2: Journaling */}
        <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-brand-personal/50"></div>
                <h3 className="font-serif text-lg text-ink mb-4 flex items-center gap-2">
                    <PenTool size={18} className="text-brand-personal" />
                    Diário de Gratidão
                </h3>
                
                <div className="flex-1 flex flex-col bg-stone-50 rounded-lg border border-stone-100 p-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">3 coisas pelas quais sou grata hoje:</label>
                    <textarea 
                        value={gratitude}
                        onChange={(e) => setGratitude(e.target.value)}
                        className="flex-1 w-full bg-transparent border-none resize-none outline-none text-stone-700 leading-loose placeholder:text-stone-300 text-sm"
                        placeholder={`1. O café quente pela manhã...\n2. O sorriso da Beatriz...\n3. Ter saúde para trabalhar...`}
                        style={{ backgroundImage: 'linear-gradient(transparent 1.9em, #e5e7eb 1.9em)', backgroundSize: '100% 2em', lineHeight: '2em' }}
                    />
                </div>
                
                <div className="mt-4 pt-4 border-t border-stone-100">
                    <p className="text-xs text-stone-400 italic text-center">"A gratidão transforma o que temos em suficiente."</p>
                </div>
             </div>
        </div>

        {/* Column 3: Culture Tracker */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-full flex flex-col">
                <h3 className="font-serif text-lg text-ink mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-brand-personal" />
                    Livros, Filmes & Séries
                </h3>

                <form onSubmit={addMedia} className="flex flex-col gap-2 mb-4">
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Título..."
                            className="flex-1 bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-brand-personal/50 focus:border-brand-personal outline-none"
                        />
                        <button type="submit" className="bg-brand-personal text-white px-3 rounded hover:bg-brand-personal/90">
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        {['book', 'movie', 'series'].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setNewType(t as any)}
                                className={`flex-1 text-[10px] uppercase font-bold py-1 rounded border ${newType === t ? 'bg-brand-personal/10 border-brand-personal text-brand-personal' : 'bg-transparent border-stone-100 text-stone-400'}`}
                            >
                                {t === 'book' ? 'Livro' : t === 'movie' ? 'Filme' : 'Série'}
                            </button>
                        ))}
                    </div>
                </form>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 max-h-[400px] pr-1">
                    {mediaList.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 border border-stone-100 rounded-lg bg-stone-50 hover:border-brand-personal/30 transition-colors group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="text-stone-400 shrink-0">
                                    {item.type === 'book' && <BookOpen size={16} />}
                                    {item.type === 'movie' && <Film size={16} />}
                                    {item.type === 'series' && <Music size={16} />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className={`text-sm font-medium truncate ${item.status === 'done' ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                                        {item.title}
                                    </span>
                                    <span className={`text-[10px] uppercase font-bold w-fit px-1.5 py-0.5 rounded 
                                        ${item.status === 'todo' ? 'bg-stone-200 text-stone-500' : 
                                          item.status === 'doing' ? 'bg-yellow-100 text-yellow-700' : 
                                          'bg-green-100 text-green-700'}`}>
                                        {item.status === 'todo' ? 'Ler/Ver' : item.status === 'doing' ? 'Lendo/Vendo' : 'Concluído'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => updateMediaStatus(item.id)} className="p-1 text-stone-400 hover:text-brand-personal" title="Alterar Status">
                                    <CheckCircle2 size={14} />
                                </button>
                                <button onClick={() => deleteMedia(item.id)} className="p-1 text-stone-400 hover:text-red-400" title="Remover">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
