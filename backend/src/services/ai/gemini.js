import { GoogleGenerativeAI } from '@google/generative-ai';

let client = null;

export function getGeminiClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment');
    }
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

export function getModel(systemInstruction, tools) {
  return getGeminiClient().getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
    systemInstruction,
    tools,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });
}
