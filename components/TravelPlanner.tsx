
import React, { useState } from 'react';
import { 
  Plane, MapPin, Calendar, Luggage, CreditCard, 
  Sparkles, CheckCircle2, Circle, Plus, Trash2, FileText, Share2
} from 'lucide-react';
import { suggestTravelItinerary } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';

interface PackingItem {
  id: string;
  text: string;
  category: 'clothes' | 'toiletries' | 'tech' | 'docs';
  checked: boolean;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
}

export const TravelPlanner: React.FC = () => {
  // Trip Details (Persisted)
  const [destination, setDestination] = useLocalStorage('planner_travel_dest', 'Paris, França');
  const [dates, setDates] = useLocalStorage('planner_travel_dates', { start: '2024-09-10', end: '2024-09-20' });
  
  // Itinerary AI
  const [interests, setInterests] = useState('');
  const [itinerary, setItinerary] = useLocalStorage('planner_travel_itinerary', '');
  const [isGenerating, setIsGenerating] = useState(false);

  // Packing List (Persisted)
  const [packingList, setPackingList] = useLocalStorage<PackingItem[]>('planner_travel_packing', [
    { id: '1', text: 'Passaporte', category: 'docs', checked: true },
    { id: '2', text: 'Carregador Universal', category: 'tech', checked: false },
    { id: '3', text: 'Casaco leve', category: 'clothes', checked: false },
    { id: '4', text: 'Kit higiene mini', category: 'toiletries', checked: false },
  ]);
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState<PackingItem['category']>('clothes');

  // Budget (Persisted)
  const [totalBudget, setTotalBudget] = useLocalStorage('planner_travel_budget', 15000);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('planner_travel_expenses', [
    { id: '1', description: 'Passagens Aéreas', amount: 4500, category: 'Transporte' },
    { id: '2', description: 'Reserva Hotel', amount: 3200, category: 'Hospedagem' },
  ]);
  const [newExpense, setNewExpense] = useState({ desc: '', amount: '' });

  // Handlers
  const handleGenerateItinerary = async () => {
    setIsGenerating(true);
    const duration = Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 60 * 60 * 24));
    const result = await suggestTravelItinerary(
        destination, 
        duration.toString(), 
        'Moderado', 
        interests || 'Cultura, Gastronomia e Pontos turísticos clássicos'
    );
    setItinerary(result);
    setIsGenerating(false);
  };

  const handleShareItinerary = async () => {
      if (!itinerary) return;
      const text = `✈️ *Roteiro para ${destination}*\n\n${itinerary}`;

      if (navigator.share) {
          try {
              await navigator.share({ title: `Viagem ${destination}`, text });
          } catch (err) { console.log(err); }
      } else {
          navigator.clipboard.writeText(text);
          alert('Roteiro copiado!');
      }
  }

  const addPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setPackingList([...packingList, { id: Date.now().toString(), text: newItem, category: newCategory, checked: false }]);
    setNewItem('');
  };

  const togglePackingItem = (id: string) => {
    setPackingList(packingList.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.desc || !newExpense.amount) return;
    setExpenses([...expenses, { 
        id: Date.now().toString(), 
        description: newExpense.desc, 
        amount: parseFloat(newExpense.amount), 
        category: 'Outros' 
    }]);
    setNewExpense({ desc: '', amount: '' });
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Hero Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full -mr-20 -mt-20 pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-2 text-sky-600 mb-2">
                    <Plane size={20} />
                    <span className="text-sm font-bold uppercase tracking-wider">Próxima Aventura</span>
                </div>
                <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="text-4xl font-serif text-ink bg-transparent border-b-2 border-transparent hover:border-stone-200 focus:border-sky-500 focus:outline-none w-full max-w-md transition-colors"
                />
                <div className="flex gap-4 mt-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] text-stone-400 uppercase font-bold mb-1">Ida</label>
                        <input 
                            type="date" 
                            value={dates.start}
                            onChange={(e) => setDates({...dates, start: e.target.value})}
                            className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-sm text-stone-600 focus:outline-none focus:border-sky-500"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] text-stone-400 uppercase font-bold mb-1">Volta</label>
                        <input 
                            type="date" 
                            value={dates.end}
                            onChange={(e) => setDates({...dates, end: e.target.value})}
                            className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-sm text-stone-600 focus:outline-none focus:border-sky-500"
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex gap-8 text-right">
                <div>
                    <p className="text-xs text-stone-400 font-bold uppercase">Dias</p>
                    <p className="text-2xl font-serif text-ink">
                        {Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-stone-400 font-bold uppercase">Budget</p>
                    <p className="text-2xl font-serif text-ink">R$ {(remainingBudget/1000).toFixed(1)}k</p>
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Itinerary AI */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-xl text-ink flex items-center gap-2">
                        <MapPin size={20} className="text-sky-500" />
                        Roteiro
                    </h3>
                    {itinerary && (
                        <button onClick={handleShareItinerary} className="text-sky-500 hover:bg-sky-50 p-2 rounded-full">
                            <Share2 size={18} />
                        </button>
                    )}
                </div>
                
                <div className="bg-sky-50 p-4 rounded-lg border border-sky-100 mb-4">
                    <label className="block text-xs font-bold text-sky-700 uppercase tracking-wider mb-2">Interesses & Estilo</label>
                    <textarea 
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="Ex: Museus, cafés, natureza, sem pressa..."
                        className="w-full bg-white text-sm border-stone-200 rounded-lg p-3 focus:ring-sky-300 focus:border-sky-500 h-20 resize-none"
                    />
                    <button 
                        onClick={handleGenerateItinerary}
                        disabled={isGenerating}
                        className="mt-3 w-full bg-sky-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        <Sparkles size={16} />
                        {isGenerating ? 'Planejando...' : 'Gerar Roteiro com IA'}
                    </button>
                </div>

                {itinerary ? (
                    <div className="flex-1 bg-stone-50 p-4 rounded-lg border border-stone-100 overflow-y-auto custom-scrollbar">
                        <div className="prose prose-stone prose-sm whitespace-pre-line">
                            {itinerary}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-100 rounded-lg p-8">
                        <MapPin size={40} className="mb-2 opacity-20" />
                        <p className="text-sm text-center">Defina o destino e deixe a IA criar seu dia a dia.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Column 2: Packing List */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-[600px] flex flex-col">
                <h3 className="font-serif text-xl text-ink mb-6 flex items-center gap-2">
                    <Luggage size={20} className="text-brand-personal" />
                    Mala & Docs
                </h3>

                <form onSubmit={addPackingItem} className="flex gap-2 mb-4">
                    <input 
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Item..."
                        className="flex-1 bg-stone-50 border-stone-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-personal"
                    />
                    <select 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="bg-stone-50 border-stone-200 rounded px-2 py-1 text-xs"
                    >
                        <option value="clothes">Roupas</option>
                        <option value="toiletries">Higiene</option>
                        <option value="tech">Tech</option>
                        <option value="docs">Docs</option>
                    </select>
                    <button type="submit" className="bg-stone-800 text-white p-1.5 rounded hover:bg-stone-700">
                        <Plus size={16} />
                    </button>
                </form>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                    {['docs', 'clothes', 'toiletries', 'tech'].map(cat => {
                        const items = packingList.filter(i => i.category === cat);
                        if (items.length === 0) return null;
                        
                        const catLabel = cat === 'docs' ? 'Documentos' : cat === 'clothes' ? 'Roupas' : cat === 'toiletries' ? 'Higiene' : 'Eletrônicos';
                        const catColor = cat === 'docs' ? 'text-red-500' : cat === 'clothes' ? 'text-brand-personal' : 'text-stone-500';

                        return (
                            <div key={cat}>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${catColor} border-b border-stone-100 pb-1`}>
                                    {catLabel}
                                </h4>
                                <div className="space-y-2">
                                    {items.map(item => (
                                        <div 
                                            key={item.id}
                                            onClick={() => togglePackingItem(item.id)}
                                            className="flex items-center gap-3 group cursor-pointer"
                                        >
                                            <div className={`transition-colors ${item.checked ? 'text-stone-400' : 'text-stone-300 group-hover:text-stone-500'}`}>
                                                {item.checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                            </div>
                                            <span className={`text-sm ${item.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                                                {item.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

        {/* Column 3: Budget */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="font-serif text-xl text-ink mb-6 flex items-center gap-2">
                    <CreditCard size={20} className="text-green-600" />
                    Orçamento
                </h3>

                <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 mb-6">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-500">Gasto</span>
                        <span className="font-bold text-stone-700">R$ {totalSpent}</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-1">
                        <div 
                            className={`h-full rounded-full ${totalSpent > totalBudget ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-stone-400">
                        <span>0</span>
                        <span>Meta: R$ {totalBudget}</span>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    {expenses.map(exp => (
                        <div key={exp.id} className="flex justify-between items-center p-2 border-b border-stone-50 last:border-0">
                            <div>
                                <p className="text-sm font-medium text-stone-700">{exp.description}</p>
                                <p className="text-[10px] text-stone-400 bg-stone-100 px-1 rounded w-fit">{exp.category}</p>
                            </div>
                            <p className="text-sm font-bold text-stone-700">R$ {exp.amount}</p>
                        </div>
                    ))}
                </div>

                <form onSubmit={addExpense} className="pt-4 border-t border-stone-100">
                    <div className="flex gap-2 mb-2">
                        <input 
                            placeholder="Descrição"
                            value={newExpense.desc}
                            onChange={(e) => setNewExpense({...newExpense, desc: e.target.value})}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs"
                        />
                        <input 
                            type="number"
                            placeholder="R$"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                            className="w-20 bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs"
                        />
                    </div>
                    <button type="submit" className="w-full bg-stone-100 text-stone-600 py-1.5 rounded text-xs font-bold hover:bg-stone-200 transition-colors">
                        Adicionar Gasto
                    </button>
                </form>
            </div>

            {/* Quick Docs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="font-serif text-lg text-ink mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-stone-400" />
                    Docs Rápidos
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors">
                        Passaporte.pdf
                    </button>
                    <button className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors">
                        Seguro.pdf
                    </button>
                    <button className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors">
                        Tickets.pdf
                    </button>
                     <button className="p-3 border border-dashed border-stone-300 rounded-lg text-xs text-stone-400 hover:bg-stone-50 transition-colors">
                        + Upload
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
