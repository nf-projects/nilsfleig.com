import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const createClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeJournalEntry = async (text: string): Promise<AnalysisResult> => {
  const ai = createClient();
  if (!ai) {
    throw new Error("Gemini API not configured");
  }

  const prompt = `
    You are a thoughtful, empathetic literary analyst and therapist. 
    Analyze the following stream-of-consciousness journal entry. 
    The user was not allowed to backspace, so ignore typos.
    
    Return a JSON object with:
    - summary: A brief, poetic summary of what they wrote (max 2 sentences).
    - themes: An array of 3-5 key themes or recurring thoughts.
    - mood: A single word or short phrase describing the emotional tone.

    Journal Entry:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            themes: { type: Type.ARRAY, items: { type: Type.STRING } },
            mood: { type: Type.STRING },
          },
          required: ["summary", "themes", "mood"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");

    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing journal:", error);
    return {
      summary: "We couldn't analyze your thoughts this time, but they remain yours.",
      themes: ["Mystery", "Silence"],
      mood: "Unknown"
    };
  }
};
