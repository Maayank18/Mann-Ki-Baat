import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const executeGroqWithFallback = async (operation) => {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3
  ].filter(key => key && key.trim() !== '');

  if (keys.length === 0) {
    throw new Error('No GROQ API keys configured in .env');
  }

  let lastError;
  for (let i = 0; i < keys.length; i++) {
    try {
      const groq = new Groq({ apiKey: keys[i].trim() });
      return await operation(groq);
    } catch (error) {
      console.warn(`[Fallback] Groq API key ${i + 1} failed:`, error.message);
      lastError = error;
      // Continue to next key
    }
  }

  throw new Error(`All fallback API keys failed. Last error: ${lastError.message}`);
};
