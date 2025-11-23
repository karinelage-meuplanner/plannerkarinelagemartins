
import React, { useState } from 'react';
import { initGoogleAuth, mockLogin } from '../services/googleService';
import { User } from '../types';
import { Layout, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

// Helper to safely check if env var exists
const hasClientId = () => {
    try {
        return typeof process !== 'undefined' && process.env && !!process.env.GOOGLE_CLIENT_ID;
    } catch {
        return false;
    }
};

export const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (hasClientId()) {
        // Real Google Flow
        const client = initGoogleAuth(onLogin);
        client?.requestAccessToken();
    } else {
        // Manual Entry Flow
        if (!email || !email.includes('@')) {
            setError('Por favor, insira um e-mail válido.');
            return;
        }
        
        performMockLogin(email, name);
    }
  };

  const performMockLogin = (userEmail: string, userName?: string) => {
    setLoading(true);
    setTimeout(() => {
        const finalName = userName || userEmail.split('@')[0];
        const user = mockLogin(userEmail, finalName);
        onLogin(user);
        setLoading(false);
    }, 800);
  };

  const handleGoogleDemoLogin = () => {
      // Simulates clicking "Login with Google"
      performMockLogin('usuario.demo@gmail.com', 'Usuário Google');
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] flex items-center justify-center paper-texture p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-stone-200 text-center relative overflow-hidden">
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-brand-home"></div>
        
        <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-accent">
                <Layout size={40} />
            </div>
        </div>

        <h1 className="font-serif text-3xl font-bold text-ink mb-2">Meu Planner</h1>
        <p className="text-stone-500 mb-8">Organize sua vida, finanças e família em um só lugar.</p>

        <div className="space-y-4 text-left">
            {/* Google Login Button (Real or Simulated) */}
            <button 
                onClick={hasClientId() ? () => handleLogin() : handleGoogleDemoLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 group relative overflow-hidden"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? "Conectando..." : "Entrar com Google"}
            </button>

            {!hasClientId() && (
                <>
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-stone-200"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-stone-400 font-bold uppercase">Ou entre com e-mail</span>
                        <div className="flex-grow border-t border-stone-200"></div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Seu Nome</label>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nome"
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 focus:outline-none focus:border-accent transition-colors text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">E-mail</label>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                placeholder="seu@email.com"
                                className={`w-full bg-stone-50 border rounded-lg p-3 focus:outline-none transition-colors text-sm ${error ? 'border-red-300 focus:border-red-400' : 'border-stone-200 focus:border-accent'}`}
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
                                <AlertCircle size={12} /> {error}
                            </div>
                        )}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-ink text-white font-medium py-3 px-4 rounded-xl hover:bg-stone-800 transition-all shadow-sm disabled:opacity-70"
                        >
                            {loading ? "Entrando..." : "Entrar"} <ArrowRight size={16} />
                        </button>
                    </form>
                </>
            )}
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100">
             <div className="flex items-start gap-3 text-left bg-green-50 p-3 rounded-lg">
                <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-800">
                    <strong>Armazenamento Seguro:</strong> Seus dados são salvos automaticamente no seu navegador. Nenhuma informação é enviada para servidores externos além da IA.
                </p>
             </div>
        </div>
      </div>
    </div>
  );
};
