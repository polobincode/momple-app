import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // In a real app, ensure this is set securely.

// Initializing the client. 
// Note: In a production client-side app, you'd usually proxy this through a backend 
// to hide the API key, or use a specific restricted key.
const ai = new GoogleGenAI({ apiKey });

export const getParentingAdvice = async (query: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure process.env.API_KEY.";
  }

  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: model,
      contents: `You are a helpful, empathetic parenting expert assistant named 'Momple AI'. 
      Answer the following question from a parent briefly and kindly.
      Question: ${query}`,
      config: {
        maxOutputTokens: 300,
      }
    });

    return response.text || "죄송합니다. 답변을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};