import {genkit} from 'genkit';

let ai: ReturnType<typeof genkit>;

// Initialize Genkit - only load Google AI plugin if API key is present
const plugins = [];
if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
  try {
    const {googleAI} = require('@genkit-ai/google-genai');
    plugins.push(googleAI());
  } catch (e) {
    console.warn('Google AI plugin not available, using mock mode');
  }
}

ai = genkit({
  plugins: plugins.length > 0 ? plugins : [],
  model: 'mock/model',
});

export { ai };
