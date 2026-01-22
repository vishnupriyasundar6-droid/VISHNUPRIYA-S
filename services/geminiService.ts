
import { GoogleGenAI, Type } from "@google/genai";
import { GameTheme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGameCommentary = async (score: number, isGameOver: boolean, currentScale: number): Promise<string> => {
  try {
    const scaleDesc = currentScale > 1.2 ? "The bird is getting huge and hard to control!" : "The bird is tiny but mighty.";
    const prompt = isGameOver 
      ? `The player just died in a Flappy Bird game with a score of ${score}. The bird was scaled at ${currentScale.toFixed(1)}x size. Give a short, funny, 1-sentence roast. Be concise.`
      : `The player reached a score of ${score}. ${scaleDesc} Give a very short, 3-5 word high-energy hype message.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text?.trim() || "Keep flapping!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Nice flap!";
  }
};

export const getDynamicTheme = async (): Promise<GameTheme> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a creative visual theme for a flappy bird game. Return a JSON object with: name, skyColor (Tailwind bg class), pipeColor (Tailwind bg class), birdEmoji, groundColor (Tailwind bg class), and accentColor (Tailwind text class).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            skyColor: { type: Type.STRING },
            pipeColor: { type: Type.STRING },
            birdEmoji: { type: Type.STRING },
            groundColor: { type: Type.STRING },
            accentColor: { type: Type.STRING },
          },
          required: ["name", "skyColor", "pipeColor", "birdEmoji", "groundColor", "accentColor"]
        }
      }
    });

    const theme = JSON.parse(response.text || "{}");
    return theme;
  } catch (error) {
    console.error("Theme Error:", error);
    return {
      name: "Neon Night",
      skyColor: "bg-slate-900",
      pipeColor: "bg-cyan-400",
      birdEmoji: "⚡",
      groundColor: "bg-slate-800",
      accentColor: "text-pink-500"
    };
  }
};
