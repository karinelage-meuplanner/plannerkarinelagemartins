import { User, GoogleCalendarEvent } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

// Helper to safely get env vars without crashing in browser
const getEnv = (key: string) => {
  try {
    return typeof process !== 'undefined' && process.env ? process.env[key] : '';
  } catch {
    return '';
  }
};

// IMPORTANTE: Em produção, este Client ID deve vir de uma variável de ambiente.
const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID'); 
const SCOPES = 'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

export const initGoogleAuth = (callback: (user: User) => void) => {
  // Esta função é chamada pelo botão de login
  if (!window.google) return;

  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: async (tokenResponse: any) => {
      if (tokenResponse && tokenResponse.access_token) {
        try {
          // Buscar dados do usuário
          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }).then(res => res.json());

          const user: User = {
            id: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            accessToken: tokenResponse.access_token,
          };
          
          callback(user);
        } catch (error) {
          console.error("Erro ao buscar dados do usuário Google:", error);
        }
      }
    },
  });

  return client;
};

export const fetchCalendarEvents = async (accessToken: string): Promise<GoogleCalendarEvent[]> => {
  if (!accessToken || accessToken === 'mock-token') {
      return mockCalendarEvents();
  }

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    const data = await response.json();
    if (data.items) {
      return data.items;
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar eventos do calendário:", error);
    return [];
  }
};

// MOCK DATA atualizada para aceitar dados do usuário
export const mockLogin = (email?: string, name?: string): User => ({
  id: 'mock-user-' + Date.now(),
  name: name || 'Usuário Convidado',
  email: email || 'usuario@planner.com',
  picture: `https://ui-avatars.com/api/?name=${name || 'User'}&background=D98E73&color=fff`,
  accessToken: 'mock-token'
});

export const mockCalendarEvents = (): GoogleCalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    return [
        {
            id: 'evt1',
            summary: 'Reunião de Planejamento',
            start: { dateTime: `${today}T09:00:00` },
            end: { dateTime: `${today}T10:00:00` },
            description: 'Alinhamento semanal com a equipe'
        },
        {
            id: 'evt2',
            summary: 'Almoço com Cliente',
            start: { dateTime: `${today}T12:30:00` },
            end: { dateTime: `${today}T13:30:00` },
            location: 'Restaurante Central'
        },
        {
            id: 'evt3',
            summary: 'Consulta Dentista',
            start: { dateTime: `${today}T17:00:00` },
            end: { dateTime: `${today}T18:00:00` }
        }
    ];
};