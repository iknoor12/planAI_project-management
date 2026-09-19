import { GoogleGenerativeAI } from "@google/generative-ai";

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const classifyGeminiError = (error) => {
  const status = Number(error.status || error.statusCode || error.response?.status || 0);
  const message = error.message || '';

  if (status === 429 || /quota|rate.?limit|resource.?exhausted/i.test(message)) {
    return { category: 'rate_limit', statusCode: 429 };
  }

  if (status === 401 || status === 403 || /api key|permission|unauthorized|forbidden/i.test(message)) {
    return { category: 'authentication', statusCode: 502 };
  }

  if (status === 400 || /invalid argument|invalid request|bad request/i.test(message)) {
    return { category: 'invalid_request', statusCode: 400 };
  }

  if (status === 404 || /not found|no longer available/i.test(message)) {
    return { category: 'model_error', statusCode: 502 };
  }

  if (status >= 500 || /service unavailable|temporarily|overloaded|high demand/i.test(message)) {
    return { category: 'service_unavailable', statusCode: 503 };
  }

  return { category: 'provider_error', statusCode: 502 };
};

export class GeminiRequestError extends Error {
  constructor(category, statusCode) {
    super('Gemini request failed');
    this.name = 'GeminiRequestError';
    this.category = category;
    this.statusCode = statusCode;
  }
}

export const generateText = async (prompt) => {
  try {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error("Invalid prompt passed to Gemini");
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const request = () => model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    let result;
    try {
      result = await request();
    } catch (error) {
      const failure = classifyGeminiError(error);
      if (failure.category !== 'service_unavailable') {
        throw new GeminiRequestError(failure.category, failure.statusCode);
      }

      await delay(500);
      try {
        result = await request();
      } catch (retryError) {
        const retryFailure = classifyGeminiError(retryError);
        throw new GeminiRequestError(retryFailure.category, retryFailure.statusCode);
      }
    }

    const text = result.response.text();
    if (!text || !text.trim()) {
      throw new GeminiRequestError('empty_response', 502);
    }

    return text.trim();
  } catch (error) {
    if (error instanceof GeminiRequestError) {
      console.error('Gemini API error:', {
        category: error.category,
        statusCode: error.statusCode,
      });
      throw error;
    }

    const failure = classifyGeminiError(error);
    console.error('Gemini API error:', failure);
    throw new GeminiRequestError(failure.category, failure.statusCode);
  }
};