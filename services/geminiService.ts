import { GoogleGenAI } from "@google/genai";

// Initialize GoogleGenAI with process.env.API_KEY directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper: Convert File to Base64 for Gemini
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove "data:image/jpeg;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getParentingAdvice = async (query: string): Promise<string> => {
  if (!process.env.API_KEY) {
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

export const verifyReceipt = async (file: File, providerName: string): Promise<boolean> => {
  if (!process.env.API_KEY) return false;

  try {
    const base64Data = await fileToBase64(file);
    
    // Using gemini-flash-latest (aliased to 2.5 flash which supports vision) as per instructions
    const model = 'gemini-flash-latest'; 

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: `Analyze this receipt image. Does it contain the business name "${providerName}" (or a very similar variation)? 
            Ignore minor typos or spaces. 
            If you find the business name, return "TRUE". Otherwise, return "FALSE". 
            Only return the boolean string.`
          }
        ]
      }
    });

    const text = response.text?.trim().toUpperCase();
    return text?.includes('TRUE') || false;

  } catch (error) {
    console.error("Receipt Verification Error:", error);
    return false;
  }
};

// New: Business License Verification
export const verifyBusinessLicense = async (file: File): Promise<boolean> => {
  if (!process.env.API_KEY) return false;

  try {
    const base64Data = await fileToBase64(file);
    
    const model = 'gemini-flash-latest';

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: `Analyze this image. Is this a valid Korean Business Registration Certificate (사업자등록증)?
            Look for keywords like "사업자등록증", "등록번호", "대표자", "상호".
            If it looks like a valid business license, return "TRUE". Otherwise, return "FALSE".
            Only return the boolean string.`
          }
        ]
      }
    });

    const text = response.text?.trim().toUpperCase();
    return text?.includes('TRUE') || false;

  } catch (error) {
    console.error("Business License Verification Error:", error);
    return false;
  }
};
