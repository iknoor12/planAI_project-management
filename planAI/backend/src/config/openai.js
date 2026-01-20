import OpenAI from 'openai';

/**
 * OpenAI Configuration
 * Initialize OpenAI client with API key
 */
let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI API configured');
} else {
  console.warn('⚠️  OpenAI API key not found. AI features will be disabled.');
}

export default openai;
