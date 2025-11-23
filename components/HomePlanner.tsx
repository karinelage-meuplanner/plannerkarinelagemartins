
import React, { useState } from 'react';
import { 
  Utensils, ShoppingCart, Home as HomeIcon, Plus, Trash2, Sparkles, 
  CheckCircle2, Circle, Droplets, ChefHat, Coffee, Sun, Moon, Share2 
} from 'lucide-react';
import { suggestMealPlan } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';

interface Chore {
  id: string;
  text: string;
  zone: string;
  completed: boolean;
  frequency: 'daily' | 'weekly';
}

interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
}

export const HomePlanner: React.FC = () => {
  // Shopping List State (Persisted)
  const [shoppingList, setShoppingList] = useLocalStorage<ShoppingItem[]>('planner_home_shopping', [
    { id: '1', text: 'Leite de Amêndoas', checked: false },
    { id: '2', text: 'Ovos Orgânicos', checked: true },
    { id: '3', text: 'Detergente', checked: false },
  ]);
  const [newItem, setNewItem] = useState('');

  // Chores State (Persisted)
  const [chores, setChores] = useLocalStorage<Chore[]>('planner_home_chores', [
    { id: '1', text: 'Lavar a louça do jantar', zone: 'Cozinha', completed: false, frequency: 'daily' },
    { id: '2', text: 'Regar as plantas', zone: 'Sala', completed: true, frequency: 'weekly' },
    { id: '3', text: 'Trocar toalhas', zone: 'Banheiro', completed: false, frequency: 'weekly' },
  ]);

  // Meal Plan State (Persisted)
  const [preferences, setPreferences] = useLocalStorage('planner_home_meal_pref', '');
  const [mealPlan, setMealPlan] = useLocalStorage<string>('planner_home_meal_plan', '');
  const [isGenerating, setIsGenerating] = useState(false);

  // Handlers
  const addShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setShoppingList([...shoppingList, { id: Date.now().toString(), text: newItem, checked: false }]);
    setNewItem('');
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(shoppingList.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  const toggleChore = (id: string) => {
    setChores(chores.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  };

  const handleMealGen = async () => {
    setIsGenerating(true);
    const suggestion = await suggestMealPlan(preferences || "Saudável e prático para família de 3 pessoas");
    setMealPlan(suggestion);
    setIsGenerating(false);
  };

  const handleShareShopping = async () => {
    const items = shoppingList.filter(i => !i.checked).map(i => `- [ ] ${i.text}`).join('\n');
    const text = `🛒 *Lista de Compras*\n\n${items || 'Lista vazia!'}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Lista de Compras',
                text: text,
            });
        } catch (err) {
            console.log('Error sharing', err);
        }
    } else {
        navigator.clipboard.writeText(text);
        alert('Lista copiada para a área de transferência!');
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex items-center gap-4">
            <div className="bg-brand-home/10 p-3 rounded-full text-brand-home">
                <ShoppingCart size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Lista de Compras</p>
                <p className="text-xl font-serif font-bold text-ink">{shoppingList.filter(i => !i.checked).length} itens pendentes</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Droplets size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Tarefas de Casa</p>
                <p className="text-xl font-serif font-bold text-ink">{chores.filter(c => !c.completed).length} a fazer</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                <ChefHat size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Cardápio</p>
                <p className="text-xl font-serif font-bold text-ink">{mealPlan ? 'Definido' : 'Não planejado'}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Meal Planner (AI) */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 h-full flex flex-col">
                <h3 className="font-serif text-xl text-ink mb-4 flex items-center gap-2">
                    <Utensils size={20} className="text-brand-home" />
                    Planejamento de Refeições
                </h3>
                
                <div className="bg-brand-home/5 p-4 rounded-lg border border-brand-home/10 mb-4">
                    <label className="block text-xs font-bold text-brand-home uppercase tracking-wider mb-2">Preferências da Semana</label>
                    <textarea 
                        value={preferences}
                        onChange={(e) => setPreferences(e.target.value)}
                        placeholder="Ex: Segunda sem carne, jantares rápidos, culinária italiana no sábado..."
                        className="w-full bg-white text-sm border-stone-200 rounded-lg p-3 focus:ring-brand-home/30 focus:border-brand-home h-24 resize-none"
                    />
                    <button 
                        onClick={handleMealGen}
                        disabled={isGenerating}
                        className="mt-3 w-full bg-brand-home text-white py-2 rounded-lg text-sm font-medium hover:bg-brand-home/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        <Sparkles size={16} />
                        {isGenerating ? 'Criando Cardápio...' : 'Sugerir Cardápio com IA'}
                    </button>
                </div>

                {mealPlan ? (
                    <div className="flex-1 bg-stone-50 p-4 rounded-lg border border-stone-100 overflow-y-auto custom-scrollbar max-h-[500px]">
                        <div className="prose prose-stone prose-sm whitespace-pre-line">
                            {mealPlan}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-100 rounded-lg p-8">
                        <ChefHat size={40} className="mb-2 opacity-20" />
                        <p className="text-sm text-center">Defina suas preferências e deixe a IA organizar sua semana alimentar.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Column 2: Household Chores */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="font-serif text-xl text-ink mb-6 flex items-center gap-2">
                    <HomeIcon size={20} className="text-blue-500" />
                    Rotina da Casa
                </h3>

                <div className="space-y-1">
                    {['daily', 'weekly'].map((freq) => (
                        <div key={freq} className="mb-6">
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 border-b border-stone-100 pb-1">
                                {freq === 'daily' ? 'Diário' : 'Semanal'}
                            </h4>
                            <div className="space-y-2">
                                {chores.filter(c => c.frequency === freq).map(chore => (
                                    <div 
                                        key={chore.id}
                                        onClick={() => toggleChore(chore.id)} 
                                        className="flex items-start gap-3 p-2 hover:bg-stone-50 rounded-lg cursor-pointer group transition-colors"
                                    >
                                        <div className={`mt-0.5 ${chore.completed ? 'text-blue-500' : 'text-stone-300 group-hover:text-blue-400'}`}>
                                            {chore.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${chore.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                                                {chore.text}
                                            </p>
                                            <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                {chore.zone}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {chores.filter(c => c.frequency === freq).length === 0 && <p className="text-xs text-stone-300 italic">Nada aqui.</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Column 3: Shopping List */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-50 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="font-serif text-xl text-ink flex items-center gap-2">
                        <ShoppingCart size={20} className="text-yellow-600" />
                        Lista de Compras
                    </h3>
                    <button 
                        onClick={handleShareShopping}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                        title="Compartilhar Lista"
                    >
                        <Share2 size={18} />
                    </button>
                </div>

                <form onSubmit={addShoppingItem} className="flex gap-2 mb-6 relative z-10">
                    <input 
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Adicionar item..."
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                    />
                    <button type="submit" className="bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-700 transition-colors">
                        <Plus size={20} />
                    </button>
                </form>

                <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1 relative z-10">
                    {shoppingList.map(item => (
                        <div key={item.id} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-stone-50 transition-colors">
                            <button 
                                onClick={() => toggleShoppingItem(item.id)}
                                className={`${item.checked ? 'text-yellow-600' : 'text-stone-300 hover:text-yellow-600'} transition-colors`}
                            >
                                {item.checked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </button>
                            <span className={`flex-1 text-sm font-medium ${item.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                                {item.text}
                            </span>
                            <button 
                                onClick={() => removeShoppingItem(item.id)}
                                className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                     {shoppingList.length === 0 && (
                        <div className="text-center py-8 text-stone-400">
                            <ShoppingCart size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Sua lista está vazia.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
