
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCOg3O2FqylFUFBjjYPxlhXr3M6AbrKogo";

if (!apiKey) {
  console.warn('⚠️  GOOGLE_GENAI_API_KEY not set in .env file');
}

const genai = new GoogleGenerativeAI(apiKey);

async function invokeGenAI() {
  try {
    const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("what is the ?");
    const response = await result.response;
    console.log('✅ Gemini Response:', response.text());
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
  }
}

export default invokeGenAI;