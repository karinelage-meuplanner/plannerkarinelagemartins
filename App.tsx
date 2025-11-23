
import React, { useState, useEffect } from 'react';
import { Tab, WheelSegment, User, GoogleCalendarEvent } from './types';
import { 
  LayoutDashboard, Calendar, CheckSquare, Briefcase, 
  DollarSign, Home, User as UserIcon, Heart, Settings, Menu, X, 
  FileText, Plane, Dumbbell, ShoppingBag, Target, LogOut
} from 'lucide-react';

import { DailyPlanner } from './components/DailyPlanner';
import { FinanceTracker } from './components/FinanceTracker';
import { AnnualPlanner } from './components/AnnualPlanner';
import { MonthlyPlanner } from './components/MonthlyPlanner';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { WorkPlanner } from './components/WorkPlanner';
import { HomePlanner } from './components/HomePlanner';
import { PersonalPlanner } from './components/PersonalPlanner';
import { DaughterPlanner } from './components/DaughterPlanner';
import { TravelPlanner } from './components/TravelPlanner';
import { ToolsPage } from './components/ToolsPage';
import { WheelOfLife } from './components/WheelOfLife';
import { LoginPage } from './components/LoginPage';
import { fetchCalendarEvents, mockCalendarEvents } from './services/googleService';
import useLocalStorage from './hooks/useLocalStorage';

const App: React.FC = () => {
  // Auth State (Persisted)
  const [user, setUser] = useLocalStorage<User | null>('planner_user_session', null);
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);

  // UI State (Not persisted generally, but activeTab could be if desired)
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State for Wheel of Life (Persisted)
  const [wheelData, setWheelData] = useLocalStorage<WheelSegment[]>('planner_wheel_of_life', [
    { label: 'Carreira', value: 7 },
    { label: 'Finanças', value: 5 },
    { label: 'Saúde', value: 6 },
    { label: 'Relações', value: 8 },
    { label: 'Lazer', value: 4 },
    { label: 'Crescimento', value: 6 },
    { label: 'Casa', value: 7 },
    { label: 'Espiritual', value: 5 },
  ]);

  // Load Calendar events when user logs in
  useEffect(() => {
    const loadEvents = async () => {
        if (user) {
            if (user.id === 'mock-user-123') {
                // User logged in via demo mode
                setCalendarEvents(mockCalendarEvents());
            } else if (user.accessToken) {
                // User logged in via real Google Auth
                const events = await fetchCalendarEvents(user.accessToken);
                setCalendarEvents(events);
            }
        }
    };
    loadEvents();
  }, [user]);

  const handleLogin = (userData: User) => {
      setUser(userData);
  };

  const handleLogout = () => {
      setUser(null);
      setCalendarEvents([]);
      localStorage.removeItem('planner_user_session'); // Ensure cleanup
  };

  const updateWheel = (index: number, newVal: number) => {
    const newData = [...wheelData];
    newData[index].value = newVal;
    setWheelData(newData);
  };

  const NavItem = ({ tab, label, icon: Icon, colorClass }: { tab: Tab, label: string, icon: any, colorClass?: string }) => (
    <button
      onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all duration-200
        ${activeTab === tab 
          ? 'bg-white shadow-sm text-ink font-medium border border-stone-100' 
          : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}
        ${colorClass ? colorClass : ''}
      `}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  // Render Login Page if not authenticated
  if (!user) {
      return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-[#FDFBF7] text-[#4A4036] paper-texture">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full h-16 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200 flex items-center justify-between px-4 z-50">
        <h1 className="font-serif text-xl font-semibold text-ink">Meu Planner</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-stone-600">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#F9F5E3] border-r border-[#EBE5CE] transform transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 hidden lg:block">
          <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">Meu Planner<span className="text-accent">.</span></h1>
          <p className="text-xs text-stone-500 mt-1">Organize sua vida com inteligência</p>
        </div>

        <nav className="px-4 py-2 space-y-1 mb-8 mt-16 lg:mt-0 flex-1">
            <p className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 mt-4">Planejamento</p>
            <NavItem tab="dashboard" label="Visão Geral" icon={LayoutDashboard} />
            <NavItem tab="annual" label="Anual" icon={Calendar} />
            <NavItem tab="monthly" label="Mensal" icon={Calendar} />
            <NavItem tab="weekly" label="Semanal" icon={Calendar} />
            <NavItem tab="daily" label="Planejamento Diário" icon={CheckSquare} />

            <p className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 mt-6">Áreas da Vida</p>
            <NavItem tab="work" label="Trabalho" icon={Briefcase} colorClass="hover:text-brand-work" />
            <NavItem tab="finance" label="Minhas Finanças" icon={DollarSign} colorClass="hover:text-brand-finance" />
            <NavItem tab="home" label="Casa" icon={Home} colorClass="hover:text-brand-home" />
            <NavItem tab="personal" label="Pessoal" icon={UserIcon} colorClass="hover:text-brand-personal" />
            <NavItem tab="daughter" label="Beatriz" icon={Heart} colorClass="hover:text-brand-daughter" />
            
            <p className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 mt-6">Ferramentas</p>
            <NavItem tab="travel" label="Viagens" icon={Plane} colorClass="hover:text-sky-600" />
            <NavItem tab="tools" label="Ferramentas" icon={Target} />
        </nav>

        {/* User Profile Sidebar Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50">
            <div className="flex items-center gap-3 mb-3">
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border border-stone-200" />
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-ink truncate">{user.name}</p>
                    <p className="text-xs text-stone-400 truncate">{user.email}</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-600 py-2 rounded-lg text-xs font-bold hover:bg-stone-100 transition-colors"
            >
                <LogOut size={14} /> Sair
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto pt-20 lg:pt-8 px-4 lg:px-10 pb-10 scroll-smooth">
        <div className="max-w-6xl mx-auto">
            
          {/* Header Context */}
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-3xl font-serif font-bold text-ink capitalize">
                    {activeTab === 'tools' ? 'Ferramentas & Recursos' : 
                     activeTab === 'travel' ? 'Planejador de Viagens' :
                     activeTab === 'daughter' ? 'Espaço da Beatriz' :
                     activeTab === 'dashboard' ? 'Visão Geral' :
                     activeTab === 'annual' ? 'Planejamento Anual' :
                     activeTab === 'monthly' ? 'Planejamento Mensal' :
                     activeTab === 'weekly' ? 'Planejamento Semanal' :
                     activeTab === 'daily' ? 'Planejamento Diário' :
                     activeTab === 'finance' ? 'Minhas Finanças' :
                     activeTab === 'work' ? 'Espaço de Trabalho' :
                     activeTab === 'home' ? 'Gestão da Casa' :
                     activeTab === 'personal' ? 'Espaço Pessoal' :
                     activeTab}
                </h2>
                <p className="text-stone-500 mt-1 text-sm">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
          </header>

          {/* Content Views */}
          {activeTab === 'daily' && <DailyPlanner calendarEvents={calendarEvents} />}
          
          {activeTab === 'finance' && <FinanceTracker />}

          {activeTab === 'annual' && <AnnualPlanner />}

          {activeTab === 'monthly' && <MonthlyPlanner />}

          {activeTab === 'weekly' && <WeeklyPlanner />}

          {activeTab === 'work' && <WorkPlanner />}

          {activeTab === 'home' && <HomePlanner />}

          {activeTab === 'personal' && <PersonalPlanner />}

          {activeTab === 'daughter' && <DaughterPlanner />}

          {activeTab === 'travel' && <TravelPlanner />}

          {activeTab === 'tools' && <ToolsPage />}

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h3 className="font-serif text-xl mb-4">Resumo Rápido</h3>
                    <p className="text-stone-600 mb-4">Olá, {user.name.split(' ')[0]}! Você tem {calendarEvents.length} compromissos sincronizados para hoje.</p>
                    <button onClick={() => setActiveTab('daily')} className="text-accent font-medium hover:underline text-sm">Ir para o planejamento diário &rarr;</button>
                </div>
                <WheelOfLife data={wheelData} onUpdate={updateWheel} />
            </div>
          )}

          {/* Placeholders for other tabs to show structure */}
          {(activeTab !== 'daily' && activeTab !== 'finance' && activeTab !== 'dashboard' && activeTab !== 'annual' && activeTab !== 'monthly' && activeTab !== 'weekly' && activeTab !== 'work' && activeTab !== 'home' && activeTab !== 'personal' && activeTab !== 'daughter' && activeTab !== 'travel' && activeTab !== 'tools') && (
              <div className="bg-white p-12 rounded-xl border border-dashed border-stone-300 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-50 text-stone-400 mb-4">
                    {activeTab === 'weekly' && <Calendar size={32} />}
                    {activeTab === 'work' && <Briefcase size={32} />}
                    {activeTab === 'home' && <Home size={32} />}
                    {activeTab === 'daughter' && <Heart size={32} />}
                  </div>
                  <h3 className="text-lg font-medium text-stone-700 mb-2">Página em Construção</h3>
                  <p className="text-stone-500 max-w-md mx-auto">
                      Esta seção do planner ({activeTab}) está estruturada, mas o conteúdo demo foca nas guias principais para esta demonstração.
                  </p>
              </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
