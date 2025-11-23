import { GoogleGenAI } from "@google/genai";

// Helper to safely get env vars
const getApiKey = () => {
  try {
    return typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';
  } catch {
    return '';
  }
};

const getClient = () => {
    const apiKey = getApiKey();
    // Fallback to allow app to run (will error on actual generation if key missing)
    return new GoogleGenAI({ apiKey: apiKey || 'DEMO_KEY' });
};

export const generateDailyPlan = async (todos: string[], events: string[], mood: string): Promise<string> => {
    try {
        const ai = getClient();
        const prompt = `
        Atue como um assistente pessoal empático e eficiente.
        Aqui estão minhas tarefas para hoje: ${todos.join(', ')}.
        Aqui estão meus compromissos: ${events.join(', ')}.
        Meu humor/energia hoje está: ${mood}.

        Por favor, crie um plano de ação sugerido para o meu dia, priorizando o que é importante e sugerindo pausas se minha energia estiver baixa. Mantenha o tom calmo e motivador. Formate a resposta em Markdown leve.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Não foi possível gerar o plano no momento.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Desculpe, ocorreu um erro ao conectar com a inteligência do planner. Verifique sua chave de API.";
    }
};

export const analyzeFinances = async (income: number, expenses: number, expenseList: string): Promise<string> => {
    try {
        const ai = getClient();
        const prompt = `
        Sou seu consultor financeiro pessoal.
        Minha renda mensal: R$ ${income}.
        Meus gastos totais: R$ ${expenses}.
        Lista de gastos:
        ${expenseList}

        Forneça uma análise curta (max 3 parágrafos) sobre minha saúde financeira e 3 dicas práticas para economizar.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Análise indisponível.";
    } catch (error) {
        console.error(error);
        return "Erro ao analisar finanças.";
    }
};

export const suggestMealPlan = async (preferences: string): Promise<string> => {
     try {
        const ai = getClient();
        const prompt = `
        Crie um plano de refeições simples para um dia (Café, Almoço, Jantar) baseado nestas preferências: "${preferences}".
        Inclua uma lista de compras resumida no final.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Sugestão indisponível.";
    } catch (error) {
        console.error(error);
        return "Erro ao gerar refeições.";
    }
}

export const suggestTravelItinerary = async (destination: string, days: string, budget: string, interests: string): Promise<string> => {
    try {
        const ai = getClient();
        const prompt = `
        Atue como um agente de viagens experiente.
        Crie um roteiro de viagem detalhado para ${destination}.
        Duração: ${days} dias.
        Orçamento: ${budget}.
        Interesses: ${interests}.
        
        Formate como uma lista dia a dia (Dia 1, Dia 2, etc.), com sugestões para Manhã, Tarde e Noite.
        Inclua dicas de onde comer e estimativas de preço se possível.
        Use Markdown para formatar.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Não foi possível gerar o roteiro.";
    } catch (error) {
        console.error(error);
        return "Erro ao gerar roteiro de viagem.";
    }
}